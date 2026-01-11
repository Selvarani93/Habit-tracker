from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import date, datetime
from uuid import UUID

# ============================================================================
# User Schemas
# ============================================================================
class UserCreate(BaseModel):
    id: Optional[UUID] = None  # Allow passing UUID from Supabase auth
    email: EmailStr

class UserResponse(BaseModel):
    id: UUID
    email: str

    class Config:
        from_attributes = True

# ============================================================================
# Routine Task Schemas
# ============================================================================
class RoutineTaskCreate(BaseModel):
    user_id: UUID
    name: str
    category: str = Field(..., pattern="^(Learning|Fitness|Rest|Other)$")
    planned_minutes: int = Field(default=0, ge=0)
    active_days: List[str] = Field(default=[])  # ['Monday', 'Tuesday']

class RoutineTaskUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = Field(None, pattern="^(Learning|Fitness|Rest|Other)$")
    planned_minutes: Optional[int] = Field(None, ge=0)
    active_days: Optional[List[str]] = None

class RoutineTaskResponse(BaseModel):
    id: UUID
    user_id: UUID
    name: str
    category: str
    planned_minutes: int
    active_days: List[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# ============================================================================
# Daily Log Schemas
# ============================================================================
class DailyLogCreate(BaseModel):
    user_id: UUID
    routine_task_id: UUID
    date: date
    status: str = Field(default='pending', pattern="^(done|missed|partial|skipped|pending)$")
    actual_minutes: int = Field(default=0, ge=0)
    notes: Optional[str] = None

class DailyLogUpdate(BaseModel):
    status: Optional[str] = Field(None, pattern="^(done|missed|partial|skipped|pending)$")
    actual_minutes: Optional[int] = Field(None, ge=0)
    notes: Optional[str] = None

class DailyLogResponse(BaseModel):
    id: UUID
    user_id: UUID
    routine_task_id: UUID
    date: date
    status: str
    actual_minutes: int
    notes: Optional[str]
    created_at: datetime
    routine_task: Optional['RoutineTaskResponse'] = None  # Include the related routine task

    class Config:
        from_attributes = True

# ============================================================================
# Interview Schemas
# ============================================================================
class InterviewCreate(BaseModel):
    user_id: UUID
    company_name: str
    role: str
    date_applied: Optional[date] = None
    status: str = Field(default='applied', pattern="^(applied|replied|interview_scheduled|interview_done|offer|rejected)$")
    interview_rounds: Optional[str] = None
    priority: str = Field(default='medium', pattern="^(high|medium|low)$")
    notes: Optional[str] = None
    follow_up_date: Optional[date] = None

class InterviewUpdate(BaseModel):
    company_name: Optional[str] = None
    role: Optional[str] = None
    date_applied: Optional[date] = None
    status: Optional[str] = Field(None, pattern="^(applied|replied|interview_scheduled|interview_done|offer|rejected)$")
    interview_rounds: Optional[str] = None
    priority: Optional[str] = Field(None, pattern="^(high|medium|low)$")
    notes: Optional[str] = None
    follow_up_date: Optional[date] = None

class InterviewResponse(BaseModel):
    id: UUID
    user_id: UUID
    company_name: str
    role: str
    date_applied: Optional[date]
    status: str
    interview_rounds: Optional[str]
    priority: str
    notes: Optional[str]
    follow_up_date: Optional[date]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# ============================================================================
# User Goal Schemas
# ============================================================================
class UserGoalCreate(BaseModel):
    user_id: UUID
    goal_type: str = Field(default='weekly', pattern="^(weekly|monthly)$")
    target_percentage: int = Field(default=80, ge=0, le=100)

class UserGoalUpdate(BaseModel):
    target_percentage: int = Field(..., ge=0, le=100)

class UserGoalResponse(BaseModel):
    id: UUID
    user_id: UUID
    goal_type: str
    target_percentage: int
    created_at: datetime

    class Config:
        from_attributes = True