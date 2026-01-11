from sqlalchemy import Column, String, Date, ForeignKey, DateTime, Integer, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, nullable=False, unique=True)

    # Relationships
    routine_tasks = relationship("RoutineTask", back_populates="user", cascade="all, delete-orphan")
    daily_logs = relationship("DailyLog", back_populates="user", cascade="all, delete-orphan")
    interviews = relationship("Interview", back_populates="user", cascade="all, delete-orphan")
    user_goals = relationship("UserGoal", back_populates="user", cascade="all, delete-orphan")

class RoutineTask(Base):
    __tablename__ = "routine_tasks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)  # Learning, Fitness, Rest, Other
    planned_minutes = Column(Integer, default=0)
    active_days = Column(ARRAY(String), default=[])  # ['Monday', 'Tuesday']
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="routine_tasks")
    daily_logs = relationship("DailyLog", back_populates="routine_task", cascade="all, delete-orphan")

class DailyLog(Base):
    __tablename__ = "daily_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    routine_task_id = Column(UUID(as_uuid=True), ForeignKey("routine_tasks.id", ondelete="CASCADE"), nullable=False)
    date = Column(Date, nullable=False)
    status = Column(String, default='pending')  # done, missed, partial, skipped, pending
    actual_minutes = Column(Integer, default=0)
    notes = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="daily_logs")
    routine_task = relationship("RoutineTask", back_populates="daily_logs")

class Interview(Base):
    __tablename__ = "interviews"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    company_name = Column(String, nullable=False)
    role = Column(String, nullable=False)
    date_applied = Column(Date)
    status = Column(String, default='applied')  # applied, replied, interview_scheduled, interview_done, offer, rejected
    interview_rounds = Column(String)  # 'Round 2/3'
    priority = Column(String, default='medium')  # high, medium, low
    notes = Column(String)
    follow_up_date = Column(Date)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="interviews")

class UserGoal(Base):
    __tablename__ = "user_goals"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    goal_type = Column(String, default='weekly')  # weekly, monthly
    target_percentage = Column(Integer, default=80)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="user_goals")