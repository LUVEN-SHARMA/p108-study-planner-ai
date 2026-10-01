import sys
import os
from datetime import datetime, timedelta

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.services.scheduler import scheduler
from backend.app.services.feasibility import feasibility_checker
from backend.app.services.priority_scorer import priority_scorer

def run_evaluation():
    print("============== AI STUDY PLANNER ENGINE EVALUATION ==============\n")
    today = datetime.now().date()

    # Scenario 1: Normal Workload
    print("--- SCENARIO 1: Standard Workload ---")
    subjects_s1 = [{"id": 1, "name": "Physics", "exam_date": (today + timedelta(days=14)).strftime("%Y-%m-%d"), "weightage": 8.0}]
    topics_s1 = [
        {"id": 101, "subject_id": 1, "name": "Mechanics", "est_hours": 3.0, "difficulty": 3, "confidence": 3},
        {"id": 102, "subject_id": 1, "name": "Electromagnetism", "est_hours": 4.0, "difficulty": 4, "confidence": 2}
    ]
    avail_s1 = [{"weekday": i, "start": "18:00", "end": "21:00"} for i in range(7)]

    sessions_s1 = scheduler.schedule(subjects_s1, topics_s1, avail_s1, start_date=today)
    feas_s1 = feasibility_checker.evaluate(topics_s1, avail_s1, num_days=14)

    print(f"Total Sessions Scheduled: {len(sessions_s1)}")
    print(f"Is Feasible: {feas_s1['is_feasible']}")
    print(f"Required Hours: {feas_s1['total_required_hours']} hrs | Available: {feas_s1['total_available_hours']} hrs\n")

    # Scenario 2: Stress-Test / Overload Scenario (Too Many Topics)
    print("--- SCENARIO 2: Overload Stress Test ---")
    topics_s2 = [{"id": 200+i, "subject_id": 1, "name": f"Heavy Topic {i}", "est_hours": 8.0, "difficulty": 5, "confidence": 1} for i in range(10)]
    avail_s2 = [{"weekday": i, "start": "18:00", "end": "19:00"} for i in range(7)] # Only 1 hr/day

    feas_s2 = feasibility_checker.evaluate(topics_s2, avail_s2, num_days=7)
    print(f"Is Feasible: {feas_s2['is_feasible']} (Expected False)")
    print(f"Shortfall Hours: {feas_s2['shortfall_hours']} hrs")
    print("Trade-off Suggestions Flagged:")
    for sug in feas_s2["suggestions"]:
        print(f"  - {sug}")

    # Scenario 3: Mixed subjects, deadlines, and weekday/weekend availability
    print("\n--- SCENARIO 3: Mixed Subjects and Availability ---")
    subjects_s3 = [
        {"id": 3, "name": "Biology", "exam_date": (today + timedelta(days=12)).strftime("%Y-%m-%d"), "weightage": 7.5},
        {"id": 4, "name": "Chemistry", "exam_date": (today + timedelta(days=19)).strftime("%Y-%m-%d"), "weightage": 8.5},
        {"id": 5, "name": "Mathematics", "exam_date": (today + timedelta(days=26)).strftime("%Y-%m-%d"), "weightage": 9.0},
    ]
    topics_s3 = [
        {"id": 301, "subject_id": 3, "name": "Cell Biology", "est_hours": 3.0, "difficulty": 3, "confidence": 2},
        {"id": 302, "subject_id": 3, "name": "Genetics", "est_hours": 4.0, "difficulty": 4, "confidence": 2},
        {"id": 401, "subject_id": 4, "name": "Organic Chemistry", "est_hours": 4.0, "difficulty": 5, "confidence": 1},
        {"id": 402, "subject_id": 4, "name": "Chemical Equilibrium", "est_hours": 2.0, "difficulty": 3, "confidence": 3},
        {"id": 501, "subject_id": 5, "name": "Calculus", "est_hours": 5.0, "difficulty": 4, "confidence": 2},
        {"id": 502, "subject_id": 5, "name": "Linear Algebra", "est_hours": 3.0, "difficulty": 2, "confidence": 4},
    ]
    avail_s3 = [
        {"weekday": i, "start": "18:00", "end": "20:00"} for i in range(5)
    ] + [
        {"weekday": i, "start": "10:00", "end": "14:00"} for i in (5, 6)
    ]

    sessions_s3 = scheduler.schedule(subjects_s3, topics_s3, avail_s3, start_date=today)
    feas_s3 = feasibility_checker.evaluate(topics_s3, avail_s3, num_days=26)
    study_sessions_s3 = [session for session in sessions_s3 if session["kind"] == "study"]
    revision_sessions_s3 = [session for session in sessions_s3 if session["kind"] == "revision"]

    print(f"Subjects: {len(subjects_s3)} | Topics: {len(topics_s3)}")
    print(f"Study Sessions: {len(study_sessions_s3)} | Revision Sessions: {len(revision_sessions_s3)}")
    print(f"Is Feasible: {feas_s3['is_feasible']}")
    print(f"Required Hours: {feas_s3['total_required_hours']} hrs | Available: {feas_s3['total_available_hours']} hrs")

    print("\n================ EVALUATION RUN COMPLETE ================")

if __name__ == "__main__":
    run_evaluation()
