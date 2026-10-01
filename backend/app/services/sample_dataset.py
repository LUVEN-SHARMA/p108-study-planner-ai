import json
from datetime import date, timedelta
from pathlib import Path

from sqlalchemy.orm import Session

from backend.app.domain.models import Subject, Topic


def add_sample_dataset(db: Session) -> list[Subject]:
    today = date.today()
    sample_path = Path(__file__).resolve().parents[3] / "data" / "sample" / "subjects.json"
    sample_subjects = json.loads(sample_path.read_text(encoding="utf-8"))
    for sample in sample_subjects:
        sample["exam_date"] = today + timedelta(days=sample.pop("exam_days_from_today"))

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

        for topic_data in sample["topics"]:
            db.add(Topic(
                subject_id=subject.id,
                name=topic_data["name"],
                difficulty=topic_data["difficulty"],
                confidence=topic_data["confidence"],
                est_hours=topic_data["est_hours"],
            ))

        added_subjects.append(subject)

    db.commit()
    return added_subjects