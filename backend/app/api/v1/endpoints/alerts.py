from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.api.deps import get_db, get_current_user
from app.core.security import AuthenticatedUser
from app.models.alert import StudentAlert
from app.models.student import StudentProfile, StudentPreference
from app.schemas.alert import (
    StudentAlertResponse,
    AlertPreferenceUpdate,
    AlertPreferenceResponse,
    MarkAlertReadRequest,
)
from app.schemas.common import StandardApiResponse

router = APIRouter()

@router.get("", response_model=StandardApiResponse[List[StudentAlertResponse]])
def get_student_alerts(
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """Retrieve personalized in-app notifications and alerts strictly for the authenticated student."""
    alerts = db.query(StudentAlert).filter(
        StudentAlert.student_id == current_user.id,
        StudentAlert.is_dismissed == False,
    ).order_by(desc(StudentAlert.created_at)).all()

    # Format created_at to ISO string
    results = [
        StudentAlertResponse(
            id=a.id,
            student_id=a.student_id,
            alert_type=a.alert_type,
            title=a.title,
            message=a.message,
            reference_id=a.reference_id,
            reference_type=a.reference_type or "exam",
            priority=a.priority,
            is_read=a.is_read,
            is_dismissed=a.is_dismissed,
            email_dispatched=a.email_dispatched,
            email_dispatched_at=a.email_dispatched_at,
            created_at=a.created_at.isoformat() if hasattr(a.created_at, "isoformat") else str(a.created_at),
        )
        for a in alerts
    ]
    return StandardApiResponse(data=results, message="Personalized alerts retrieved")

@router.put("/read", response_model=StandardApiResponse[bool])
def mark_alerts_as_read(
    payload: MarkAlertReadRequest,
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """Mark specific alert IDs or all alerts as read for the authenticated student."""
    query = db.query(StudentAlert).filter(StudentAlert.student_id == current_user.id)
    if not payload.mark_all and payload.alert_ids:
        query = query.filter(StudentAlert.id.in_(payload.alert_ids))

    query.update({StudentAlert.is_read: True}, synchronize_session=False)
    db.commit()
    return StandardApiResponse(data=True, message="Alerts marked as read")

@router.delete("/{alert_id}", response_model=StandardApiResponse[bool])
def dismiss_alert(
    alert_id: str,
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """Dismiss an alert from the student's notification panel."""
    alert = db.query(StudentAlert).filter(
        StudentAlert.id == alert_id,
        StudentAlert.student_id == current_user.id,
    ).first()
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")

    alert.is_dismissed = True
    db.commit()
    return StandardApiResponse(data=True, message="Alert dismissed")

@router.get("/preferences", response_model=StandardApiResponse[AlertPreferenceResponse])
def get_alert_preferences(
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """Retrieve notification and alert channel preferences."""
    prefs = db.query(StudentPreference).filter(StudentPreference.student_id == current_user.id).first()
    if not prefs:
        prefs = StudentPreference(
            student_id=current_user.id,
            alert_new_exams=True,
            alert_deadline_reminders=True,
            alert_exam_updates=True,
            alert_corrigendum=True,
            email_notification_opt_in=True,
        )
        db.add(prefs)
        db.commit()
        db.refresh(prefs)

    resp = AlertPreferenceResponse(
        alert_new_exams=prefs.alert_new_exams,
        alert_deadline_reminders=prefs.alert_deadline_reminders,
        alert_exam_updates=prefs.alert_exam_updates,
        alert_corrigendum=prefs.alert_corrigendum,
        email_notification_opt_in=prefs.email_notification_opt_in,
    )
    return StandardApiResponse(data=resp, message="Alert preferences retrieved")

@router.put("/preferences", response_model=StandardApiResponse[AlertPreferenceResponse])
def update_alert_preferences(
    payload: AlertPreferenceUpdate,
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """Update student alert and email opt-in preferences."""
    prefs = db.query(StudentPreference).filter(StudentPreference.student_id == current_user.id).first()
    if not prefs:
        prefs = StudentPreference(student_id=current_user.id)
        db.add(prefs)

    if payload.alert_new_exams is not None:
        prefs.alert_new_exams = payload.alert_new_exams
    if payload.alert_deadline_reminders is not None:
        prefs.alert_deadline_reminders = payload.alert_deadline_reminders
    if payload.alert_exam_updates is not None:
        prefs.alert_exam_updates = payload.alert_exam_updates
    if payload.alert_corrigendum is not None:
        prefs.alert_corrigendum = payload.alert_corrigendum
    if payload.email_notification_opt_in is not None:
        prefs.email_notification_opt_in = payload.email_notification_opt_in

    db.commit()
    db.refresh(prefs)

    resp = AlertPreferenceResponse(
        alert_new_exams=prefs.alert_new_exams,
        alert_deadline_reminders=prefs.alert_deadline_reminders,
        alert_exam_updates=prefs.alert_exam_updates,
        alert_corrigendum=prefs.alert_corrigendum,
        email_notification_opt_in=prefs.email_notification_opt_in,
    )
    return StandardApiResponse(data=resp, message="Alert preferences updated successfully")
