from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from database import get_db
from models import Interview
from schemas import InterviewCreate, InterviewUpdate, InterviewResponse

router = APIRouter(prefix="/interviews", tags=["Interviews"])

@router.post("/", response_model=InterviewResponse)
def create_interview(interview: InterviewCreate, db: Session = Depends(get_db)):
    """Create a new interview tracking entry"""
    new_interview = Interview(**interview.model_dump())
    db.add(new_interview)
    db.commit()
    db.refresh(new_interview)
    return new_interview

@router.get("/", response_model=List[InterviewResponse])
def get_all_interviews(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all interviews"""
    interviews = db.query(Interview).offset(skip).limit(limit).all()
    return interviews

@router.get("/user/{user_id}", response_model=List[InterviewResponse])
def get_interviews_by_user(
    user_id: UUID,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all interviews for a specific user, optionally filtered by status and/or priority"""
    query = db.query(Interview).filter(Interview.user_id == user_id)

    if status:
        query = query.filter(Interview.status == status)

    if priority:
        query = query.filter(Interview.priority == priority)

    interviews = query.all()
    return interviews

@router.get("/{interview_id}", response_model=InterviewResponse)
def get_interview(interview_id: UUID, db: Session = Depends(get_db)):
    """Get a specific interview by ID"""
    interview = db.query(Interview).filter(Interview.id == interview_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    return interview

@router.put("/{interview_id}", response_model=InterviewResponse)
def update_interview(interview_id: UUID, interview_update: InterviewUpdate, db: Session = Depends(get_db)):
    """Update an interview"""
    interview = db.query(Interview).filter(Interview.id == interview_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    update_data = interview_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(interview, key, value)

    db.commit()
    db.refresh(interview)
    return interview

@router.delete("/{interview_id}")
def delete_interview(interview_id: UUID, db: Session = Depends(get_db)):
    """Delete an interview"""
    interview = db.query(Interview).filter(Interview.id == interview_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    db.delete(interview)
    db.commit()
    return {"message": "Interview deleted successfully"}
