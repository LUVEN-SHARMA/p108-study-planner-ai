from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from backend.app.db.models import DailyTask
from backend.app.db.session import get_db
from backend.app.schemas import DailyTaskCreate, DailyTaskResponse, DailyTaskUpdate

router = APIRouter(prefix="/daily-tasks", tags=["Daily Tasks"])


@router.get("", response_model=List[DailyTaskResponse])
def get_daily_tasks(
    task_date: Optional[date] = Query(default=None),
    db: Session = Depends(get_db),
):
    query = db.query(DailyTask)
    if task_date:
        query = query.filter(DailyTask.task_date == task_date.isoformat())
    return query.order_by(DailyTask.task_date, DailyTask.start, DailyTask.id).all()


@router.post("", response_model=DailyTaskResponse, status_code=status.HTTP_201_CREATED)
def create_daily_task(payload: DailyTaskCreate, db: Session = Depends(get_db)):
    task = DailyTask(
        title=payload.title.strip(),
        task_date=payload.task_date.isoformat(),
        start=payload.start,
        note=payload.note,
    )
    if not task.title:
        raise HTTPException(status_code=422, detail="Task title cannot be empty")
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.patch("/{task_id}", response_model=DailyTaskResponse)
def update_daily_task(
    task_id: int,
    payload: DailyTaskUpdate,
    db: Session = Depends(get_db),
):
    task = db.query(DailyTask).filter(DailyTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Daily task not found")
    task.status = payload.status
    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_daily_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(DailyTask).filter(DailyTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Daily task not found")
    db.delete(task)
    db.commit()