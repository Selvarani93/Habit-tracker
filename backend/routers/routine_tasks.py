from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import any_
from typing import List
from uuid import UUID

from database import get_db
from models import RoutineTask
from schemas import RoutineTaskCreate, RoutineTaskUpdate, RoutineTaskResponse

router = APIRouter(prefix="/routine-tasks", tags=["Routine Tasks"])

@router.post("/", response_model=RoutineTaskResponse)
def create_routine_task(task: RoutineTaskCreate, db: Session = Depends(get_db)):
    """Create a new routine task"""
    new_task = RoutineTask(**task.model_dump())
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task

@router.get("/", response_model=List[RoutineTaskResponse])
def get_all_routine_tasks(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all routine tasks"""
    tasks = db.query(RoutineTask).offset(skip).limit(limit).all()
    return tasks

@router.get("/user/{user_id}", response_model=List[RoutineTaskResponse])
def get_routine_tasks_by_user(user_id: UUID, db: Session = Depends(get_db)):
    """Get all routine tasks for a specific user"""
    tasks = db.query(RoutineTask).filter(RoutineTask.user_id == user_id).all()
    return tasks

@router.get("/user/{user_id}/day/{day_name}", response_model=List[RoutineTaskResponse])
def get_routine_tasks_by_day(user_id: UUID, day_name: str, db: Session = Depends(get_db)):
    """Get all routine tasks for a specific user on a specific day

    day_name should be: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday
    """
    # Validate day name
    valid_days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    if day_name not in valid_days:
        raise HTTPException(status_code=400, detail=f"Invalid day name. Must be one of: {', '.join(valid_days)}")

    tasks = db.query(RoutineTask).filter(
        RoutineTask.user_id == user_id,
        day_name == any_(RoutineTask.active_days)
    ).all()
    return tasks

@router.get("/{task_id}", response_model=RoutineTaskResponse)
def get_routine_task(task_id: UUID, db: Session = Depends(get_db)):
    """Get a specific routine task by ID"""
    task = db.query(RoutineTask).filter(RoutineTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Routine task not found")
    return task

@router.put("/{task_id}", response_model=RoutineTaskResponse)
def update_routine_task(task_id: UUID, task_update: RoutineTaskUpdate, db: Session = Depends(get_db)):
    """Update a routine task"""
    task = db.query(RoutineTask).filter(RoutineTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Routine task not found")

    update_data = task_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(task, key, value)

    db.commit()
    db.refresh(task)
    return task

@router.delete("/{task_id}")
def delete_routine_task(task_id: UUID, db: Session = Depends(get_db)):
    """Delete a routine task (and all its associated daily logs due to CASCADE)"""
    task = db.query(RoutineTask).filter(RoutineTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Routine task not found")
    db.delete(task)
    db.commit()
    return {"message": "Routine task deleted successfully"}
