from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from backend.app.db.session import get_db
from backend.app.domain.models import PlanSession, ProgressLog
from backend.app.schemas import SessionUpdateStatusRequest, PlanSessionResponse

router = APIRouter(prefix="/sessions", tags=["Sessions & Progress"])

@router.patch("/{session_id}", response_model=PlanSessionResponse)
def update_session_status(
    session_id: int,
    payload: SessionUpdateStatusRequest,
    db: Session = Depends(get_db)
):
    """Mark session as completed, missed, or pending and log time spent."""
    session = db.query(PlanSession).filter(PlanSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Plan session not found")

    session.status = payload.status
    
    if payload.status == "completed" and payload.minutes_spent is not None:
        log = ProgressLog(
            session_id=session.id,
            completed_at=datetime.utcnow(),
            minutes_spent=payload.minutes_spent,
            note=payload.note
        )
        db.add(log)

    db.commit()
    db.refresh(session)

    return PlanSessionResponse(
        id=session.id,
        topic_id=session.topic_id,
        topic_name=session.topic.name if session.topic else "Topic",
        subject_name=session.topic.subject.name if (session.topic and session.topic.subject) else "Subject",
        date=session.date,
        start=session.start,
        end=session.end,
        kind=session.kind,
        status=session.status
    )
