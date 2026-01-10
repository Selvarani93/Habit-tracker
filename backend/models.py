from sqlalchemy import Column, String, Date, ForeignKey, DateTime
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
    habits = relationship("Habit", back_populates="user")
    daily_logs = relationship("DailyLog", back_populates="user")

class Habit(Base):
    __tablename__ = "habits"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    category = Column(String)
    frequency = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="habits")
    daily_logs = relationship("DailyLog", back_populates="habit")

class DailyLog(Base):
    __tablename__ = "daily_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    habit_id = Column(UUID(as_uuid=True), ForeignKey("habits.id"), nullable=False)
    date = Column(Date, nullable=False)
    status = Column(String)  # done, missed, partial
    notes = Column(String)

    # Relationships
    user = relationship("User", back_populates="daily_logs")
    habit = relationship("Habit", back_populates="daily_logs")