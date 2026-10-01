from datetime import date
from typing import List, Optional

from sqlalchemy.orm import Session

from backend.app.domain.models import DailyTask


class DailyTaskRepository:
    @staticmethod
    def list_for_date(db: Session, task_date: Optional[date] = None) -> List[DailyTask]:
        query = db.query(DailyTask)
        if task_date:
            query = query.filter(DailyTask.task_date == task_date.isoformat())
        return query.order_by(DailyTask.task_date, DailyTask.start, DailyTask.id).all()

    @staticmethod
    def get(db: Session, task_id: int) -> Optional[DailyTask]:
        return db.query(DailyTask).filter(DailyTask.id == task_id).first()

    @staticmethod
    def create(
        db: Session,
        title: str,
        task_date: date,
        start: Optional[str] = None,
        note: Optional[str] = None,
    ) -> DailyTask:
        task = DailyTask(
            title=title,
            task_date=task_date.isoformat(),
            start=start,
            note=note,
        )
        db.add(task)
        db.commit()
        db.refresh(task)
        return task

    @staticmethod
    def save(db: Session, task: DailyTask) -> DailyTask:
        db.commit()
        db.refresh(task)
        return task

    @staticmethod
    def delete(db: Session, task: DailyTask) -> None:
        db.delete(task)
        db.commit()


daily_task_repository = DailyTaskRepository()