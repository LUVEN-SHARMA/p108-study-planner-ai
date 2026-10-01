from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from backend.app.db.session import get_db
from backend.app.db.models import Subject, Topic
from backend.app.schemas import (
    GoalParseRequest, GoalParseResponse,
    SubjectCreate, SubjectResponse, TopicCreate, TopicResponse
)
from backend.app.services.goal_parser import goal_parser_service
from backend.app.services.effort_estimator import effort_estimator
from backend.app.services.sample_dataset import add_sample_dataset

router = APIRouter(tags=["Goals & Subjects"])

@router.post("/goals/parse", response_model=GoalParseResponse)
def parse_goals(payload: GoalParseRequest):
    """Convert free-text goal descriptions into structured subjects and topics."""
    result = goal_parser_service.parse_goals(payload.free_text)
    return result

@router.post("/subjects", response_model=SubjectResponse, status_code=status.HTTP_201_CREATED)
def create_subject(payload: SubjectCreate, db: Session = Depends(get_db)):
    """Create a new subject along with its topics."""
    subj = Subject(
        name=payload.name,
        exam_date=payload.exam_date,
        weightage=payload.weightage
    )
    db.add(subj)
    db.flush() # Populate subj.id

    for t in payload.topics:
        est = t.est_hours or effort_estimator.estimate_topic_effort(t.difficulty, t.confidence)
        topic = Topic(
            subject_id=subj.id,
            name=t.name,
            est_hours=est,
            difficulty=t.difficulty,
            confidence=t.confidence
        )
        db.add(topic)

    db.commit()
    db.refresh(subj)
    return subj

@router.post("/subjects/sample", response_model=List[SubjectResponse], status_code=status.HTTP_201_CREATED)
def create_sample_subjects(db: Session = Depends(get_db)):
    """Add sample subjects that are not already present."""
    return add_sample_dataset(db)

@router.get("/subjects", response_model=List[SubjectResponse])
def get_subjects(db: Session = Depends(get_db)):
    """Get all subjects and their topics."""
    subjects = db.query(Subject).all()
    return subjects

@router.delete("/subjects/{subject_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_subject(subject_id: int, db: Session = Depends(get_db)):
    """Delete a subject and its associated topics."""
    subj = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subj:
        raise HTTPException(status_code=404, detail="Subject not found")
    db.delete(subj)
    db.commit()
    return None
