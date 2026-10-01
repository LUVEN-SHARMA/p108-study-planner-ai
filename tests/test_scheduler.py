from datetime import datetime, timedelta
from backend.app.services.scheduler import scheduler

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
