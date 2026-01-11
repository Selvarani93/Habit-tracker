from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import any_
from typing import List
from uuid import UUID
from datetime import date, datetime

from database import get_db
from models import DailyLog, RoutineTask
from schemas import DailyLogCreate, DailyLogUpdate, DailyLogResponse

router = APIRouter(prefix="/logs", tags=["Daily Logs"])

@router.post("/", response_model=DailyLogResponse)
def create_daily_log(entry: DailyLogCreate, db: Session = Depends(get_db)):
    """Create a new daily log entry for a habit"""
    log = DailyLog(**entry.model_dump())
    db.add(log)
    db.commit()
    db.refresh(log)
    return log

@router.get("/", response_model=List[DailyLogResponse])
def get_all_logs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all daily logs"""
    logs = db.query(DailyLog).offset(skip).limit(limit).all()
    return logs

@router.get("/user/{user_id}", response_model=List[DailyLogResponse])
def get_logs_by_user(user_id: UUID, db: Session = Depends(get_db)):
    """Get all daily logs for a specific user"""
    logs = db.query(DailyLog).filter(DailyLog.user_id == user_id).all()
    return logs

@router.get("/routine-task/{routine_task_id}", response_model=List[DailyLogResponse])
def get_logs_by_routine_task(routine_task_id: UUID, db: Session = Depends(get_db)):
    """Get all daily logs for a specific routine task"""
    logs = db.query(DailyLog).filter(DailyLog.routine_task_id == routine_task_id).all()
    return logs

@router.get("/user/{user_id}/date/{log_date}", response_model=List[DailyLogResponse])
def get_logs_by_user_and_date(user_id: UUID, log_date: date, db: Session = Depends(get_db)):
    """Get all daily logs for a specific user on a specific date"""
    logs = db.query(DailyLog).options(joinedload(DailyLog.routine_task)).filter(
        DailyLog.user_id == user_id,
        DailyLog.date == log_date
    ).all()
    return logs

@router.get("/{log_id}", response_model=DailyLogResponse)
def get_log(log_id: UUID, db: Session = Depends(get_db)):
    """Get a specific daily log by ID"""
    log = db.query(DailyLog).filter(DailyLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Daily log not found")
    return log

@router.put("/{log_id}", response_model=DailyLogResponse)
def update_daily_log(log_id: UUID, log_update: DailyLogUpdate, db: Session = Depends(get_db)):
    """Update a daily log (status, actual_minutes, notes)"""
    log = db.query(DailyLog).filter(DailyLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Daily log not found")

    update_data = log_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(log, key, value)

    db.commit()

    # Return log with routine_task relationship loaded
    updated_log = db.query(DailyLog).options(joinedload(DailyLog.routine_task)).filter(
        DailyLog.id == log_id
    ).first()
    return updated_log

@router.post("/generate-today/{user_id}", response_model=List[DailyLogResponse])
def generate_today_logs(user_id: UUID, db: Session = Depends(get_db)):
    """Auto-generate today's daily logs based on routine tasks for today's day

    This creates log entries with status='pending' for all routine tasks
    that have today's day in their active_days array and don't already have logs.
    """
    today = date.today()
    day_name = today.strftime('%A')  # e.g., 'Monday', 'Tuesday'

    # Get all routine tasks for this day
    routine_tasks = db.query(RoutineTask).filter(
        RoutineTask.user_id == user_id,
        day_name == any_(RoutineTask.active_days)
    ).all()

    if not routine_tasks:
        return []

    # Get existing logs for today
    existing_logs = db.query(DailyLog).filter(
        DailyLog.user_id == user_id,
        DailyLog.date == today
    ).all()

    # Get routine_task_ids that already have logs
    existing_task_ids = {log.routine_task_id for log in existing_logs}

    # Create logs only for tasks that don't have logs yet
    created_logs = []
    for task in routine_tasks:
        if task.id not in existing_task_ids:
            log = DailyLog(
                user_id=user_id,
                routine_task_id=task.id,
                date=today,
                status='pending',
                actual_minutes=0,
                notes=None
            )
            db.add(log)
            created_logs.append(log)

    if created_logs:
        db.commit()
        # Refresh logs with the routine_task relationship loaded
        log_ids = [log.id for log in created_logs]
        refreshed_logs = db.query(DailyLog).options(joinedload(DailyLog.routine_task)).filter(
            DailyLog.id.in_(log_ids)
        ).all()
        return refreshed_logs

    # If no new logs were created, return empty list
    return []

@router.delete("/{log_id}")
def delete_log(log_id: UUID, db: Session = Depends(get_db)):
    """Delete a daily log"""
    log = db.query(DailyLog).filter(DailyLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Daily log not found")
    db.delete(log)
    db.commit()
    return {"message": "Daily log deleted successfully"}