import sys
import os
from datetime import datetime, timedelta

# Ensure parent directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.db.session import engine, Base, SessionLocal
from backend.app.db.models import Subject, Topic, Availability, PlanSession
from backend.app.services.scheduler import scheduler
from backend.app.services.effort_estimator import effort_estimator

def seed():
    print("🌱 Initializing Database schema and seeding sample data...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Clear existing data
    db.query(PlanSession).delete()
    db.query(Topic).delete()
    db.query(Subject).delete()
    db.query(Availability).delete()
    db.commit()

    today = datetime.now().date()

    # 1. Seed Availability (Mon-Sun 18:00 to 21:00)
    for i in range(7):
        db.add(Availability(weekday=i, start="18:00", end="21:00"))
    db.commit()
    print("✅ Seeded weekly availability schedule (18:00 - 21:00).")

    # 2. Seed Subjects & Topics
    subj1 = Subject(
        name="Physics",
        exam_date=(today + timedelta(days=12)).strftime("%Y-%m-%d"),
        weightage=8.5
    )
    subj2 = Subject(
        name="Mathematics",
        exam_date=(today + timedelta(days=18)).strftime("%Y-%m-%d"),
        weightage=9.0
    )
    db.add_all([subj1, subj2])
    db.flush()

    topics = [
        Topic(subject_id=subj1.id, name="Optics & Wave Motion", difficulty=4, confidence=2, est_hours=4.0),
        Topic(subject_id=subj1.id, name="Thermodynamics", difficulty=3, confidence=3, est_hours=3.0),
        Topic(subject_id=subj2.id, name="Calculus & Derivatives", difficulty=5, confidence=1, est_hours=6.0),
        Topic(subject_id=subj2.id, name="Linear Algebra", difficulty=2, confidence=4, est_hours=2.0),
    ]
    db.add_all(topics)
    db.commit()
    print(f"✅ Seeded {len([subj1, subj2])} subjects and {len(topics)} topics.")

    # 3. Generate initial sample study plan
    subjects_db = db.query(Subject).all()
    topics_db = db.query(Topic).all()
    avail_db = db.query(Availability).all()

    subjects_dict = [{"id": s.id, "name": s.name, "exam_date": s.exam_date, "weightage": s.weightage} for s in subjects_db]
    topics_dict = [{"id": t.id, "subject_id": t.subject_id, "name": t.name, "est_hours": t.est_hours, "difficulty": t.difficulty, "confidence": t.confidence} for t in topics_db]
    avail_dict = [{"weekday": a.weekday, "start": a.start, "end": a.end} for a in avail_db]

    raw_sessions = scheduler.schedule(
        subjects=subjects_dict,
        topics=topics_dict,
        availability=avail_dict,
        start_date=today
    )

    for s in raw_sessions:
        db.add(PlanSession(
            topic_id=s["topic_id"],
            date=s["date"],
            start=s["start"],
            end=s["end"],
            kind=s["kind"],
            status=s["status"]
        ))
    db.commit()
    print(f"✅ Generated and saved {len(raw_sessions)} study & revision sessions.")

    db.close()
    print("🎉 Seed completed successfully!")

if __name__ == "__main__":
    seed()
