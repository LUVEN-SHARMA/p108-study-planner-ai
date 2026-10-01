from datetime import datetime, timedelta
from backend.app.services.scheduler import scheduler
from backend.app.services.plan_prompt import (
    apply_plan_prompt,
    extract_prompt_exam_date,
    select_prompt_subjects,
)

def test_greedy_scheduler_generation():
    today = datetime.now().date()
    exam_d = (today + timedelta(days=10)).strftime("%Y-%m-%d")

    subjects = [{"id": 1, "name": "Physics", "exam_date": exam_d, "weightage": 8.0}]
    topics = [{"id": 101, "subject_id": 1, "name": "Optics", "est_hours": 2.0, "difficulty": 4, "confidence": 2}]
    availability = [{"weekday": i, "start": "18:00", "end": "21:00"} for i in range(7)]

    sessions = scheduler.schedule(subjects, topics, availability, start_date=today)

    assert len(sessions) > 0
    # Should include study and revision sessions
    kinds = [s["kind"] for s in sessions]
    assert "study" in kinds
    assert "revision" in kinds

def test_plan_prompt_applies_weekday_evening_and_subject_priority():
    subjects = [
        {"id": 1, "name": "Physics", "exam_date": "2026-11-01", "weightage": 5.0},
        {"id": 2, "name": "Biology", "exam_date": "2026-11-05", "weightage": 5.0},
    ]
    topics = [
        {"id": 1, "subject_id": 1, "name": "Optics", "est_hours": 2.0, "difficulty": 3, "confidence": 3},
        {"id": 2, "subject_id": 2, "name": "Cells", "est_hours": 2.0, "difficulty": 3, "confidence": 3},
    ]
    availability = [{"weekday": day, "start": "16:00", "end": "21:00"} for day in range(7)]
    filtered, preferred_subject_ids, notes = apply_plan_prompt(
        "Weekdays only, evenings, prioritize Biology",
        availability,
        subjects,
    )

    sessions = scheduler.schedule(
        subjects,
        topics,
        filtered,
        start_date=datetime(2026, 10, 1).date(),
        preferred_subject_ids=preferred_subject_ids,
    )

    assert set(slot["weekday"] for slot in filtered) == {0, 1, 2, 3, 4}
    assert sessions[0]["subject_name"] == "Biology"
    assert all(int(session["start"].split(":")[0]) >= 17 for session in sessions)
    assert "Scheduled on weekdays only." in notes

def test_empty_availability_does_not_create_default_sessions():
    sessions = scheduler.schedule(
        subjects=[{"id": 1, "name": "Physics", "exam_date": "2026-11-01", "weightage": 5.0}],
        topics=[{"id": 1, "subject_id": 1, "name": "Optics", "est_hours": 1.0, "difficulty": 3, "confidence": 3}],
        availability=[],
        start_date=datetime(2026, 10, 1).date(),
    )

    assert sessions == []

def test_gate_prompt_selects_matching_saved_subjects():
    subjects = [
        {"id": 1, "name": "Engineering Mathematics"},
        {"id": 2, "name": "Engineering Physics"},
        {"id": 3, "name": "World History"},
        {"id": 4, "name": "DBMS"},
    ]

    selected_ids, notes = select_prompt_subjects("Make a time table for my GATE exam", subjects)

    assert selected_ids == [1, 2, 4]
    assert "GATE exam detected" in notes[0]

def test_gate_prompt_without_matching_subjects_returns_actionable_guidance():
    selected_ids, notes = select_prompt_subjects(
        "Make a timetable for my GATE exam",
        [{"id": 1, "name": "World History"}],
    )

    assert selected_ids == []
    assert "Add your GATE paper subjects and topics first" in notes[0]

def test_prompt_extracts_month_year_exam_date_and_daily_hours():
    prompt = "GATE exam on Feb 2027, prepare 4 hours per day"
    exam_date = extract_prompt_exam_date(prompt, datetime(2026, 10, 1).date())
    availability = [
        {"weekday": day, "start": "16:00", "end": "21:00"}
        for day in range(7)
    ]
    adjusted_availability, _, notes = apply_plan_prompt(
        prompt,
        availability,
        [{"id": 1, "name": "DBMS"}],
    )

    assert exam_date == datetime(2027, 2, 28).date()
    assert all(
        (int(slot["end"][:2]) * 60 + int(slot["end"][3:]))
        - (int(slot["start"][:2]) * 60 + int(slot["start"][3:]))
        == 240
        for slot in adjusted_availability
    )
    assert "Using 4 study hours per available day as requested." in notes
