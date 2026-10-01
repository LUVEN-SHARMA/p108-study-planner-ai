from datetime import datetime, timedelta
from backend.app.services.replanner import replanner

def test_replanner_reallocates_missed():
    today = datetime.now().date()
    exam_d = (today + timedelta(days=14)).strftime("%Y-%m-%d")
    
    subjects = [{"id": 1, "name": "Physics", "exam_date": exam_d, "weightage": 8.0}]
    topics = [{"id": 101, "subject_id": 1, "name": "Optics", "est_hours": 2.0, "difficulty": 4, "confidence": 2}]
    availability = [{"weekday": i, "start": "18:00", "end": "21:00"} for i in range(7)]

    existing_sessions = [
        {"id": 1, "topic_id": 101, "topic_name": "Optics", "subject_name": "Physics", "date": today.strftime("%Y-%m-%d"), "start": "18:00", "end": "19:00", "kind": "study", "status": "missed"}
    ]

    updated = replanner.replan(existing_sessions, subjects, topics, availability, current_date=today)
    
    assert len(updated) > 0
    # Missed session should be re-allocated into future available slots
    future_dates = [s["date"] for s in updated if s["status"] == "pending"]
    assert len(future_dates) > 0
