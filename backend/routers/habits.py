from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from database import get_db
from models import Habit
from schemas import HabitCreate, HabitResponse

router = APIRouter(prefix="/habits", tags=["Habits"])

@router.post("/", response_model=HabitResponse)
def create_habit(habit: HabitCreate, db: Session = Depends(get_db)):
    """Create a new habit"""
    new_habit = Habit(**habit.model_dump())
    db.add(new_habit)
    db.commit()
    db.refresh(new_habit)
    return new_habit

@router.get("/", response_model=List[HabitResponse])
def get_all_habits(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all habits"""
    habits = db.query(Habit).offset(skip).limit(limit).all()
    return habits

@router.get("/user/{user_id}", response_model=List[HabitResponse])
def get_habits_by_user(user_id: UUID, db: Session = Depends(get_db)):
    """Get all habits for a specific user"""
    habits = db.query(Habit).filter(Habit.user_id == user_id).all()
    return habits

@router.get("/{habit_id}", response_model=HabitResponse)
def get_habit(habit_id: UUID, db: Session = Depends(get_db)):
    """Get a specific habit by ID"""
    habit = db.query(Habit).filter(Habit.id == habit_id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    return habit

@router.put("/{habit_id}", response_model=HabitResponse)
def update_habit(habit_id: UUID, habit_update: HabitCreate, db: Session = Depends(get_db)):
    """Update a habit"""
    habit = db.query(Habit).filter(Habit.id == habit_id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")

    for key, value in habit_update.model_dump().items():
        setattr(habit, key, value)

    db.commit()
    db.refresh(habit)
    return habit

@router.delete("/{habit_id}")
def delete_habit(habit_id: UUID, db: Session = Depends(get_db)):
    """Delete a habit"""
    habit = db.query(Habit).filter(Habit.id == habit_id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    db.delete(habit)
    db.commit()
    return {"message": "Habit deleted successfully"}
