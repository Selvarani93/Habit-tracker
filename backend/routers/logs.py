from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from database import get_db
from models import DailyLog
from schemas import DailyLogCreate, DailyLogResponse

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

@router.get("/habit/{habit_id}", response_model=List[DailyLogResponse])
def get_logs_by_habit(habit_id: UUID, db: Session = Depends(get_db)):
    """Get all daily logs for a specific habit"""
    logs = db.query(DailyLog).filter(DailyLog.habit_id == habit_id).all()
    return logs

@router.get("/{log_id}", response_model=DailyLogResponse)
def get_log(log_id: UUID, db: Session = Depends(get_db)):
    """Get a specific daily log by ID"""
    log = db.query(DailyLog).filter(DailyLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Daily log not found")
    return log

@router.delete("/{log_id}")
def delete_log(log_id: UUID, db: Session = Depends(get_db)):
    """Delete a daily log"""
    log = db.query(DailyLog).filter(DailyLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Daily log not found")
    db.delete(log)
    db.commit()
    return {"message": "Daily log deleted successfully"}