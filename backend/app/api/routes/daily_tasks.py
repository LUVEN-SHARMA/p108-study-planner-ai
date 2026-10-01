from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from backend.app.db.session import get_db
from backend.app.domain.models import DailyTask
from backend.app.repositories.daily_tasks import daily_task_repository
from backend.app.schemas import DailyTaskCreate, DailyTaskResponse, DailyTaskUpdate

router = APIRouter(prefix="/daily-tasks", tags=["Daily Tasks"])


@router.get("", response_model=List[DailyTaskResponse])
def get_daily_tasks(
    task_date: Optional[date] = Query(default=None),
    db: Session = Depends(get_db),
):
    return daily_task_repository.list_for_date(db, task_date)


@router.post("", response_model=DailyTaskResponse, status_code=status.HTTP_201_CREATED)
def create_daily_task(payload: DailyTaskCreate, db: Session = Depends(get_db)):
    title = payload.title.strip()
    if not title:
        raise HTTPException(status_code=422, detail="Task title cannot be empty")
    return daily_task_repository.create(
        db,
        title=title,
        task_date=payload.task_date,
        start=payload.start,
        note=payload.note,
    )


@router.patch("/{task_id}", response_model=DailyTaskResponse)
def update_daily_task(
    task_id: int,
    payload: DailyTaskUpdate,
    db: Session = Depends(get_db),
):
    task = daily_task_repository.get(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Daily task not found")
    task.status = payload.status
    return daily_task_repository.save(db, task)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_daily_task(task_id: int, db: Session = Depends(get_db)):
    task = daily_task_repository.get(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Daily task not found")
    daily_task_repository.delete(db, task)