from typing import List, Dict, Any
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.core.security import AuthenticatedUser
from app.models.student import StudentReminder
from app.models.notification import RecruitmentNotification
from app.schemas.student import StudentReminderCreate, StudentReminderResponse
from app.schemas.common import StandardApiResponse

router = APIRouter()

@router.get("/calendar", response_model=StandardApiResponse[List[Dict[str, Any]]])
def get_national_exam_calendar(db: Session = Depends(get_db)):
    """Retrieve chronologically organized national examination deadlines and upcoming exam days."""
    notifs = db.query(RecruitmentNotification).filter(RecruitmentNotification.status.in_(["Active", "Upcoming", "Corrigendum"])).all()
    events = []
    today = date.today()

    for n in notifs:
        # 1. Application Deadline event
        try:
            dead_date = datetime.strptime(n.application_deadline, "%Y-%m-%d").date()
            days_left = (dead_date - today).days
        except Exception:
            days_left = 30

        events.append({
            "id": f"dl-{n.id}",
            "title": f"{n.agency_name} — {n.title} Application Deadline",
            "examCode": n.tags[0] if n.tags else "GOV-EXAM",
            "conductingBody": n.agency_name,
            "date": n.application_deadline,
            "type": "Deadline",
            "daysLeft": max(0, days_left),
            "officialPortal": n.official_portal,
        })

        # 2. Exam Day event if known
        if n.tentative_exam_date:
            try:
                ex_date = datetime.strptime(n.tentative_exam_date, "%Y-%m-%d").date()
                ex_days_left = (ex_date - today).days
            except Exception:
                ex_days_left = 60

            events.append({
                "id": f"ex-{n.id}",
                "title": f"{n.agency_name} Preliminary Examination Day",
                "examCode": n.tags[0] if n.tags else "GOV-EXAM",
                "conductingBody": n.agency_name,
                "date": n.tentative_exam_date,
                "type": "Exam Day",
                "daysLeft": max(0, ex_days_left),
                "officialPortal": n.official_portal,
            })

    # Sort chronologically by date
    events.sort(key=lambda x: x["date"])
    return StandardApiResponse(data=events, message="National examination calendar loaded")

@router.get("", response_model=StandardApiResponse[List[StudentReminderResponse]])
def get_student_reminders(
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """Retrieve authenticated student's personalized deadline reminders."""
    reminders = db.query(StudentReminder).filter(StudentReminder.student_id == current_user.id).all()
    return StandardApiResponse(data=reminders)

@router.post("", response_model=StandardApiResponse[StudentReminderResponse], status_code=status.HTTP_201_CREATED)
def create_student_reminder(
    data: StudentReminderCreate,
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """Create a new custom reminder for the authenticated student."""
    reminder = StudentReminder(
        student_id=current_user.id,
        exam_id=data.exam_id,
        title=data.title,
        reminder_date=data.reminder_date,
    )
    db.add(reminder)
    db.commit()
    db.refresh(reminder)
    return StandardApiResponse(data=reminder, message="Reminder set successfully")
