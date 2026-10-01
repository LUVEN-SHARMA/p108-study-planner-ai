from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from backend.app.db.session import get_db
from backend.app.domain.models import Availability
from backend.app.schemas import AvailabilityCreate, AvailabilityResponse

router = APIRouter(prefix="/availability", tags=["Availability"])

@router.post("", response_model=List[AvailabilityResponse])
def set_availability(payload: List[AvailabilityCreate], db: Session = Depends(get_db)):
    """Replace weekly study availability schedule."""
    db.query(Availability).delete()
    db.commit()

    created = []
    for item in payload:
        avail = Availability(
            weekday=item.weekday,
            start=item.start,
            end=item.end
        )
        db.add(avail)
        created.append(avail)

    db.commit()
    for c in created:
        db.refresh(c)
    return created

@router.get("", response_model=List[AvailabilityResponse])
def get_availability(db: Session = Depends(get_db)):
    """Retrieve configured weekly study availability."""
    slots = db.query(Availability).order_by(Availability.weekday, Availability.start).all()
    return slots
