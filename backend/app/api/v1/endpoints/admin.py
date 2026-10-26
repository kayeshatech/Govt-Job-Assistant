from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.api.deps import get_db, get_current_admin
from app.core.security import AuthenticatedUser
from app.models.notification import RecruitmentNotification
from app.models.audit import AuditLog
from app.schemas.notification import NotificationReviewUpdate, RecruitmentNotificationResponse
from app.schemas.common import StandardApiResponse

router = APIRouter()

@router.put("/notifications/{id}/review", response_model=StandardApiResponse[RecruitmentNotificationResponse])
def review_recruitment_notification(
    id: str,
    review_data: NotificationReviewUpdate,
    db: Session = Depends(get_db),
    admin_user: AuthenticatedUser = Depends(get_current_admin),
):
    """
    Administrative review workflow to approve, verify, or flag gazetted notices.
    Strictly restricted to users with verified admin claims.
    """
    notif = db.query(RecruitmentNotification).filter(RecruitmentNotification.id == id).first()
    if not notif:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Recruitment notice '{id}' does not exist.",
        )

    old_status = notif.verification_status
    notif.verification_status = review_data.verification_status
    notif.verified_by = admin_user.email
    notif.is_verified_official = (review_data.verification_status == "Verified")

    # Record audit log entry
    audit = AuditLog(
        user_id=admin_user.id,
        user_email=admin_user.email,
        action="VERIFY" if review_data.verification_status == "Verified" else "FLAG",
        entity_type="RecruitmentNotification",
        entity_id=notif.id,
        summary=f"Changed verification status from '{old_status}' to '{review_data.verification_status}'. Notes: {review_data.notes or 'None'}",
        changes_diff={"old_status": old_status, "new_status": review_data.verification_status, "notes": review_data.notes},
    )
    db.add(audit)
    db.commit()
    db.refresh(notif)

    return StandardApiResponse(data=notif, message="Recruitment notice review recorded successfully")

@router.get("/audit-logs", response_model=StandardApiResponse[List[dict]])
def get_audit_trail(
    limit: int = 50,
    db: Session = Depends(get_db),
    admin_user: AuthenticatedUser = Depends(get_current_admin),
):
    """Retrieve system administrative audit logs."""
    logs = db.query(AuditLog).order_by(desc(AuditLog.created_at)).limit(limit).all()
    records = [
        {
            "id": log.id,
            "user_email": log.user_email,
            "action": log.action,
            "entity_type": log.entity_type,
            "entity_id": log.entity_id,
            "summary": log.summary,
            "changes_diff": log.changes_diff,
            "created_at": log.created_at.isoformat(),
        }
        for log in logs
    ]
    return StandardApiResponse(data=records, message="Audit logs retrieved")
