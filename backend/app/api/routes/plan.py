from fastapi import APIRouter, Depends, Response, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta

from backend.app.db.session import get_db
from backend.app.db.models import Subject, Topic, Availability, PlanSession
from backend.app.schemas import (
    PlanGenerateRequest, PlanGenerateResponse,
    PlanSessionResponse, FeasibilityResult, ReplanResponse
)
from backend.app.services.scheduler import scheduler
from backend.app.services.feasibility import feasibility_checker
from backend.app.services.replanner import replanner
from backend.app.services.ics_export import ics_exporter
from backend.app.ai.hybrid_engine import hybrid_engine
from backend.app.services.plan_prompt import (
    apply_plan_prompt,
    extract_prompt_exam_date,
    select_prompt_subjects,
)

router = APIRouter(prefix="/plan", tags=["Plan & Scheduling"])

@router.post("/generate", response_model=PlanGenerateResponse)
def generate_plan(payload: PlanGenerateRequest, db: Session = Depends(get_db)):
    """Generate constraint-based study timetable with spaced revision and LLM explanations."""
    start_date = datetime.strptime(payload.start_date, "%Y-%m-%d").date() if payload.start_date else datetime.now().date()

    subjects_db = db.query(Subject).all()
    topics_db = db.query(Topic).all()
    availability_db = db.query(Availability).all()

    subjects_dict = [{"id": s.id, "name": s.name, "exam_date": s.exam_date, "weightage": s.weightage} for s in subjects_db]
    topics_dict = [{"id": t.id, "subject_id": t.subject_id, "name": t.name, "est_hours": t.est_hours, "difficulty": t.difficulty, "confidence": t.confidence} for t in topics_db]
    avail_dict = [{"weekday": a.weekday, "start": a.start, "end": a.end} for a in availability_db]
    prompt_subject_ids, gate_prompt_notes = select_prompt_subjects(payload.prompt or "", subjects_dict)
    if prompt_subject_ids is not None:
        if not prompt_subject_ids:
            raise HTTPException(status_code=422, detail=gate_prompt_notes[0])
        subjects_dict = [subject for subject in subjects_dict if subject["id"] in prompt_subject_ids]
        prompt_exam_date = extract_prompt_exam_date(payload.prompt or "", start_date)
        if prompt_exam_date and prompt_exam_date <= start_date:
            raise HTTPException(
                status_code=422,
                detail=(
                    f"The exam date in your prompt ({prompt_exam_date.isoformat()}) is on or before "
                    "the plan start date. Choose a future exam date; your current plan was left unchanged."
                ),
            )
        if prompt_exam_date:
            for subject in subjects_dict:
                subject["exam_date"] = prompt_exam_date.isoformat()
            gate_prompt_notes.append(
                f"Using the exam date from your prompt: {prompt_exam_date.isoformat()}."
            )
        expired_subjects = []
        for subject in subjects_dict:
            try:
                exam_date = datetime.strptime(subject["exam_date"], "%Y-%m-%d").date()
            except (TypeError, ValueError):
                continue
            if exam_date <= start_date:
                expired_subjects.append(subject)

        if len(expired_subjects) == len(subjects_dict) and not prompt_exam_date:
            fallback_exam_date = (start_date + timedelta(days=14)).strftime("%Y-%m-%d")
            for subject in subjects_dict:
                subject["exam_date"] = fallback_exam_date
            gate_prompt_notes.append(
                f"No future exam date was saved for these GATE subjects; used a 14-day "
                f"preparation window ending {fallback_exam_date}. Update the saved exam "
                "date under Goals & subjects if you know the actual date."
            )
        elif expired_subjects and not prompt_exam_date:
            expired_ids = {subject["id"] for subject in expired_subjects}
            subjects_dict = [subject for subject in subjects_dict if subject["id"] not in expired_ids]
            gate_prompt_notes.append(
                "Skipped matching subjects whose exam date is on or before the plan start: "
                + ", ".join(subject["name"] for subject in expired_subjects)
                + "."
            )
        selected_subject_ids = {subject["id"] for subject in subjects_dict}
        topics_dict = [topic for topic in topics_dict if topic["subject_id"] in selected_subject_ids]
        if not topics_dict:
            raise HTTPException(
                status_code=422,
                detail="Add topics to your matching GATE subjects before generating this plan. The existing plan was left unchanged.",
            )

    effective_availability, preferred_subject_ids, constraint_prompt_notes = apply_plan_prompt(
        payload.prompt or "",
        avail_dict,
        subjects_dict,
    )
    prompt_notes = gate_prompt_notes + constraint_prompt_notes

    # Clear old plan sessions
    db.query(PlanSession).delete()
    db.commit()

    # 1. Run Greedy Scheduler
    raw_sessions = scheduler.schedule(
        subjects=subjects_dict,
        topics=topics_dict,
        availability=effective_availability,
        start_date=start_date,
        preferred_subject_ids=preferred_subject_ids,
    )

    # Save to database
    db_sessions = []
    for s in raw_sessions:
        ps = PlanSession(
            topic_id=s["topic_id"],
            date=s["date"],
            start=s["start"],
            end=s["end"],
            kind=s["kind"],
            status=s["status"]
        )
        db.add(ps)
        db_sessions.append(ps)

    db.commit()

    # 2. Evaluate Feasibility
    feas_raw = feasibility_checker.evaluate(
        topics=topics_dict,
        availability_slots=effective_availability,
        num_days=max(
            1,
            min(
                60,
                max(
                    (
                        (datetime.strptime(subject["exam_date"], "%Y-%m-%d").date() - start_date).days
                        for subject in subjects_dict
                    ),
                    default=14,
                ),
            ),
        ),
        assume_default_when_empty=False,
    )
    feasibility = FeasibilityResult(**feas_raw)

    # 3. Generate LLM Rationale & Tips via Hybrid Engine
    explanations = hybrid_engine.generate_explanations(raw_sessions, subjects_dict)

    # Build response session objects
    response_sessions = []
    for s, db_s in zip(raw_sessions, db_sessions):
        db.refresh(db_s)
        response_sessions.append(PlanSessionResponse(
            id=db_s.id,
            topic_id=s["topic_id"],
            topic_name=s["topic_name"],
            subject_name=s["subject_name"],
            date=s["date"],
            start=s["start"],
            end=s["end"],
            kind=s["kind"],
            status=s["status"]
        ))

    return PlanGenerateResponse(
        sessions=response_sessions,
        feasibility=feasibility,
        rationale=explanations["rationale"],
        tips=explanations["tips"],
        prompt_applied=payload.prompt,
        prompt_notes=prompt_notes,
    )

@router.get("", response_model=List[PlanSessionResponse])
def get_plan(db: Session = Depends(get_db)):
    """Fetch current study plan."""
    db_sessions = db.query(PlanSession).join(Topic).join(Subject).order_by(PlanSession.date, PlanSession.start).all()
    
    res = []
    for s in db_sessions:
        res.append(PlanSessionResponse(
            id=s.id,
            topic_id=s.topic_id,
            topic_name=s.topic.name if s.topic else "Topic",
            subject_name=s.topic.subject.name if (s.topic and s.topic.subject) else "Subject",
            date=s.date,
            start=s.start,
            end=s.end,
            kind=s.kind,
            status=s.status
        ))
    return res

@router.post("/replan", response_model=ReplanResponse)
def replan_schedule(db: Session = Depends(get_db)):
    """Re-plans remaining work following missed sessions."""
    subjects_db = db.query(Subject).all()
    topics_db = db.query(Topic).all()
    availability_db = db.query(Availability).all()
    sessions_db = db.query(PlanSession).join(Topic).join(Subject).all()

    subjects_dict = [{"id": s.id, "name": s.name, "exam_date": s.exam_date, "weightage": s.weightage} for s in subjects_db]
    topics_dict = [{"id": t.id, "subject_id": t.subject_id, "name": t.name, "est_hours": t.est_hours, "difficulty": t.difficulty, "confidence": t.confidence} for t in topics_db]
    avail_dict = [{"weekday": a.weekday, "start": a.start, "end": a.end} for a in availability_db]

    existing_sessions = []
    for s in sessions_db:
        existing_sessions.append({
            "id": s.id,
            "topic_id": s.topic_id,
            "topic_name": s.topic.name if s.topic else "Topic",
            "subject_name": s.topic.subject.name if (s.topic and s.topic.subject) else "Subject",
            "date": s.date,
            "start": s.start,
            "end": s.end,
            "kind": s.kind,
            "status": s.status
        })

    # Execute adaptive replan
    updated_sessions = replanner.replan(
        existing_sessions=existing_sessions,
        subjects=subjects_dict,
        topics=topics_dict,
        availability=avail_dict,
        current_date=datetime.now().date()
    )

    # Sync database
    db.query(PlanSession).delete()
    db.commit()

    saved_response_sessions = []
    missed_topics = list(set([s["topic_name"] for s in existing_sessions if s["status"] == "missed"]))

    for s in updated_sessions:
        ps = PlanSession(
            topic_id=s["topic_id"],
            date=s["date"],
            start=s["start"],
            end=s["end"],
            kind=s["kind"],
            status=s["status"]
        )
        db.add(ps)
        db.flush()
        db.refresh(ps)
        saved_response_sessions.append(PlanSessionResponse(
            id=ps.id,
            topic_id=s["topic_id"],
            topic_name=s["topic_name"],
            subject_name=s["subject_name"],
            date=s["date"],
            start=s["start"],
            end=s["end"],
            kind=s["kind"],
            status=s["status"]
        ))

    db.commit()

    explanation = hybrid_engine.explain_replan(missed_topics, updated_sessions)
    feas_raw = feasibility_checker.evaluate(topics=topics_dict, availability_slots=avail_dict)

    return ReplanResponse(
        sessions=saved_response_sessions,
        explanation=explanation,
        feasibility=FeasibilityResult(**feas_raw)
    )

@router.get("/export.ics")
def export_ics(db: Session = Depends(get_db)):
    """Export current study plan as downloadable .ics calendar file."""
    sessions = get_plan(db=db)
    sessions_dict = [s.model_dump() for s in sessions]
    ics_content = ics_exporter.generate_ics(sessions_dict)

    return Response(
        content=ics_content,
        media_type="text/calendar",
        headers={"Content-Disposition": "attachment; filename=study_plan.ics"}
    )
