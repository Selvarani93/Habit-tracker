from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date, datetime
from uuid import UUID

# User Schemas
class UserCreate(BaseModel):
    email: EmailStr

class UserResponse(BaseModel):
    id: UUID
    email: str

    class Config:
        from_attributes = True

# Habit Schemas
class HabitCreate(BaseModel):
    user_id: UUID
    name: str
    category: Optional[str] = None
    frequency: Optional[str] = None

class HabitResponse(BaseModel):
    id: UUID
    user_id: UUID
    name: str
    category: Optional[str]
    frequency: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

# Daily Log Schemas
class DailyLogCreate(BaseModel):
    user_id: UUID
    habit_id: UUID
    date: date
    status: str  # done, missed, partial
    notes: Optional[str] = None

class DailyLogResponse(BaseModel):
    id: UUID
    user_id: UUID
    habit_id: UUID
    date: date
    status: str
    notes: Optional[str]

    class Config:
        from_attributes = True