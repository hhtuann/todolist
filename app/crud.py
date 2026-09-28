from sqlalchemy import select
from sqlalchemy.orm import Session

from . import models, schemas


def list_tasks(db: Session, completed: bool | None = None) -> list[models.Task]:
    statement = select(models.Task).order_by(models.Task.created_at.desc())
    if completed is not None:
        statement = statement.where(models.Task.completed == completed)
    return list(db.scalars(statement))


def get_task(db: Session, task_id: int) -> models.Task | None:
    return db.get(models.Task, task_id)


def create_task(db: Session, task_in: schemas.TaskCreate) -> models.Task:
    task = models.Task(**task_in.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def update_task(db: Session, task: models.Task, task_in: schemas.TaskUpdate) -> models.Task:
    for field, value in task_in.model_dump(exclude_unset=True).items():
        setattr(task, field, value)
    db.commit()
    db.refresh(task)
    return task


def complete_task(db: Session, task: models.Task) -> models.Task:
    task.completed = True
    db.commit()
    db.refresh(task)
    return task


def delete_task(db: Session, task: models.Task) -> None:
    db.delete(task)
    db.commit()
