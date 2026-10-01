from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

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

    # Clear old plan sessions
    db.query(PlanSession).delete()
    db.commit()

    # 1. Run Greedy Scheduler
    raw_sessions = scheduler.schedule(
        subjects=subjects_dict,
        topics=topics_dict,
        availability=avail_dict,
        start_date=start_date
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
    feas_raw = feasibility_checker.evaluate(topics=topics_dict, availability_slots=avail_dict)
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
        tips=explanations["tips"]
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
