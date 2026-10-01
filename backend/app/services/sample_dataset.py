from datetime import date, timedelta

from sqlalchemy.orm import Session

from backend.app.db.models import Subject, Topic


def add_sample_dataset(db: Session) -> list[Subject]:
    today = date.today()
    sample_subjects = [
        {
            "name": "Physics",
            "exam_date": today + timedelta(days=12),
            "weightage": 8.5,
            "topics": [
                ("Optics & Wave Motion", 4, 2, 4.0),
                ("Thermodynamics", 3, 3, 3.0),
            ],
        },
        {
            "name": "Mathematics",
            "exam_date": today + timedelta(days=18),
            "weightage": 9.0,
            "topics": [
                ("Calculus & Derivatives", 5, 1, 6.0),
                ("Linear Algebra", 2, 4, 2.0),
            ],
        },
        {
            "name": "Biology",
            "exam_date": today + timedelta(days=24),
            "weightage": 7.5,
            "topics": [
                ("Cell Biology", 3, 2, 4.0),
                ("Genetics", 4, 2, 3.0),
            ],
        },
        {
            "name": "Chemistry",
            "exam_date": today + timedelta(days=28),
            "weightage": 8.0,
            "topics": [
                ("Organic Chemistry", 5, 1, 5.0),
                ("Chemical Equilibrium", 3, 3, 3.0),
            ],
        },
    ]

    sample_names = [sample["name"] for sample in sample_subjects]
    existing_names = {
        name
        for (name,) in db.query(Subject.name).filter(Subject.name.in_(sample_names)).all()
    }
    added_subjects = []

    for sample in sample_subjects:
        if sample["name"] in existing_names:
            continue

        subject = Subject(
            name=sample["name"],
            exam_date=sample["exam_date"].strftime("%Y-%m-%d"),
            weightage=sample["weightage"],
        )
        db.add(subject)
        db.flush()

        for name, difficulty, confidence, est_hours in sample["topics"]:
            db.add(Topic(
                subject_id=subject.id,
                name=name,
                difficulty=difficulty,
                confidence=confidence,
                est_hours=est_hours,
            ))

        added_subjects.append(subject)

    db.commit()
    return added_subjects