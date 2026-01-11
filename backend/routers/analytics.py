from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from uuid import UUID
from datetime import date, timedelta
from typing import Dict, List

from database import get_db
from models import DailyLog, RoutineTask, UserGoal

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/weekly/{user_id}")
def get_weekly_analytics(user_id: UUID, db: Session = Depends(get_db)):
    """Get weekly analytics for a user (last 7 days)"""
    today = date.today()
    week_ago = today - timedelta(days=7)

    # Get all logs for the week
    logs = db.query(DailyLog).filter(
        DailyLog.user_id == user_id,
        DailyLog.date >= week_ago,
        DailyLog.date <= today
    ).all()

    # Calculate statistics
    total_tasks = len(logs)
    completed_tasks = len([log for log in logs if log.status == 'done'])
    partial_tasks = len([log for log in logs if log.status == 'partial'])
    missed_tasks = len([log for log in logs if log.status == 'missed'])
    skipped_tasks = len([log for log in logs if log.status == 'skipped'])
    pending_tasks = len([log for log in logs if log.status == 'pending'])

    completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0

    # Time analysis
    total_planned_minutes = sum([log.routine_task.planned_minutes for log in logs if log.routine_task])
    total_actual_minutes = sum([log.actual_minutes for log in logs])

    # Category breakdown
    category_stats = {}
    for log in logs:
        if log.routine_task:
            category = log.routine_task.category
            if category not in category_stats:
                category_stats[category] = {'total': 0, 'completed': 0}
            category_stats[category]['total'] += 1
            if log.status == 'done':
                category_stats[category]['completed'] += 1

    # Get user goal
    user_goal = db.query(UserGoal).filter(
        UserGoal.user_id == user_id,
        UserGoal.goal_type == 'weekly'
    ).first()
    target_percentage = user_goal.target_percentage if user_goal else 80

    # Calculate gap to goal
    gap_to_goal = max(0, (target_percentage - completion_rate) / 100 * total_tasks) if total_tasks > 0 else 0

    return {
        "period": "weekly",
        "date_range": {"start": week_ago.isoformat(), "end": today.isoformat()},
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "partial_tasks": partial_tasks,
        "missed_tasks": missed_tasks,
        "skipped_tasks": skipped_tasks,
        "pending_tasks": pending_tasks,
        "completion_rate": round(completion_rate, 2),
        "target_percentage": target_percentage,
        "gap_to_goal": round(gap_to_goal, 1),
        "time_analysis": {
            "total_planned_minutes": total_planned_minutes,
            "total_actual_minutes": total_actual_minutes,
            "efficiency": round((total_actual_minutes / total_planned_minutes * 100) if total_planned_minutes > 0 else 0, 2)
        },
        "category_breakdown": {
            cat: {
                "total": stats['total'],
                "completed": stats['completed'],
                "completion_rate": round((stats['completed'] / stats['total'] * 100) if stats['total'] > 0 else 0, 2)
            }
            for cat, stats in category_stats.items()
        }
    }

@router.get("/monthly/{user_id}")
def get_monthly_analytics(user_id: UUID, db: Session = Depends(get_db)):
    """Get monthly analytics for a user (last 30 days)"""
    today = date.today()
    month_ago = today - timedelta(days=30)

    # Get all logs for the month
    logs = db.query(DailyLog).filter(
        DailyLog.user_id == user_id,
        DailyLog.date >= month_ago,
        DailyLog.date <= today
    ).all()

    # Calculate statistics
    total_tasks = len(logs)
    completed_tasks = len([log for log in logs if log.status == 'done'])
    partial_tasks = len([log for log in logs if log.status == 'partial'])
    missed_tasks = len([log for log in logs if log.status == 'missed'])
    skipped_tasks = len([log for log in logs if log.status == 'skipped'])
    pending_tasks = len([log for log in logs if log.status == 'pending'])

    completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0

    # Time analysis
    total_planned_minutes = sum([log.routine_task.planned_minutes for log in logs if log.routine_task])
    total_actual_minutes = sum([log.actual_minutes for log in logs])

    # Category breakdown
    category_stats = {}
    for log in logs:
        if log.routine_task:
            category = log.routine_task.category
            if category not in category_stats:
                category_stats[category] = {'total': 0, 'completed': 0}
            category_stats[category]['total'] += 1
            if log.status == 'done':
                category_stats[category]['completed'] += 1

    # Daily trend (last 30 days)
    daily_completion = {}
    for log in logs:
        date_str = log.date.isoformat()
        if date_str not in daily_completion:
            daily_completion[date_str] = {'total': 0, 'completed': 0}
        daily_completion[date_str]['total'] += 1
        if log.status == 'done':
            daily_completion[date_str]['completed'] += 1

    # Get user goal
    user_goal = db.query(UserGoal).filter(
        UserGoal.user_id == user_id,
        UserGoal.goal_type == 'monthly'
    ).first()
    target_percentage = user_goal.target_percentage if user_goal else 80

    # Calculate gap to goal
    gap_to_goal = max(0, (target_percentage - completion_rate) / 100 * total_tasks) if total_tasks > 0 else 0

    return {
        "period": "monthly",
        "date_range": {"start": month_ago.isoformat(), "end": today.isoformat()},
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "partial_tasks": partial_tasks,
        "missed_tasks": missed_tasks,
        "skipped_tasks": skipped_tasks,
        "pending_tasks": pending_tasks,
        "completion_rate": round(completion_rate, 2),
        "target_percentage": target_percentage,
        "gap_to_goal": round(gap_to_goal, 1),
        "time_analysis": {
            "total_planned_minutes": total_planned_minutes,
            "total_actual_minutes": total_actual_minutes,
            "total_planned_hours": round(total_planned_minutes / 60, 2),
            "total_actual_hours": round(total_actual_minutes / 60, 2),
            "efficiency": round((total_actual_minutes / total_planned_minutes * 100) if total_planned_minutes > 0 else 0, 2)
        },
        "category_breakdown": {
            cat: {
                "total": stats['total'],
                "completed": stats['completed'],
                "completion_rate": round((stats['completed'] / stats['total'] * 100) if stats['total'] > 0 else 0, 2)
            }
            for cat, stats in category_stats.items()
        },
        "daily_trend": [
            {
                "date": date_str,
                "total": data['total'],
                "completed": data['completed'],
                "completion_rate": round((data['completed'] / data['total'] * 100) if data['total'] > 0 else 0, 2)
            }
            for date_str, data in sorted(daily_completion.items())
        ]
    }

@router.get("/streak/{user_id}")
def get_user_streak(user_id: UUID, db: Session = Depends(get_db)):
    """Calculate current streak (consecutive days with >0 completed tasks)"""
    today = date.today()
    streak = 0
    current_date = today

    while True:
        logs = db.query(DailyLog).filter(
            DailyLog.user_id == user_id,
            DailyLog.date == current_date,
            DailyLog.status == 'done'
        ).first()

        if logs:
            streak += 1
            current_date -= timedelta(days=1)
        else:
            break

    return {
        "current_streak": streak,
        "last_completed_date": (today if streak > 0 else None)
    }
