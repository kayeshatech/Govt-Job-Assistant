from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.api.deps import get_db, get_current_admin
from app.core.security import AuthenticatedUser
from app.models.notification import RecruitmentNotification
from app.models.monitoring import ExtractionReviewItem
from app.models.audit import AuditLog
from app.schemas.notification import NotificationReviewUpdate, RecruitmentNotificationResponse
from app.schemas.monitoring import (
    ExtractionReviewItemResponse,
    CandidateApprovalRequest,
    CandidateRejectionRequest,
)
from app.schemas.common import StandardApiResponse
from app.services.change_detector import change_detector
from app.services.alert_service import alert_service

router = APIRouter()

@router.put("/notifications/{id}/review", response_model=StandardApiResponse[RecruitmentNotificationResponse])
def review_recruitment_notification(
    id: str,
    review_data: NotificationReviewUpdate,
    db: Session = Depends(get_db),
    admin_user: AuthenticatedUser = Depends(get_current_admin),
):
    """Administrative review workflow to approve, verify, or flag gazetted notices."""
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

@router.get("/candidates", response_model=StandardApiResponse[List[ExtractionReviewItemResponse]])
def list_extraction_review_queue(
    status_filter: Optional[str] = "PENDING_REVIEW",
    db: Session = Depends(get_db),
    admin_user: AuthenticatedUser = Depends(get_current_admin),
):
    """Retrieve staging queue of extracted candidate changes awaiting review or audit."""
    query = db.query(ExtractionReviewItem)
    if status_filter and status_filter != "ALL":
        query = query.filter(ExtractionReviewItem.status == status_filter)
    candidates = query.order_by(desc(ExtractionReviewItem.created_at)).all()
    return StandardApiResponse(data=candidates, message="Candidate review items retrieved")

@router.post("/candidates/{candidate_id}/approve", response_model=StandardApiResponse[ExtractionReviewItemResponse])
def approve_candidate_change(
    candidate_id: str,
    payload: CandidateApprovalRequest,
    db: Session = Depends(get_db),
    admin_user: AuthenticatedUser = Depends(get_current_admin),
):
    """
    Approve an extracted recruitment notice or corrigendum from the review queue:
    1. Updates or creates active authoritative RecruitmentNotification.
    2. Records version history.
    3. Dispatches targeted student alerts for deadline extensions, vacancies, or new posts.
    4. Logs administrative audit trail.
    """
    candidate = db.query(ExtractionReviewItem).filter(ExtractionReviewItem.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate item not found")

    if candidate.status in ["MANUALLY_APPROVED", "AUTO_APPROVED"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Candidate is already approved")

    # Apply override fields if provided by admin reviewer
    extracted_data = candidate.extracted_data or {}
    if payload.override_fields:
        extracted_data.update(payload.override_fields)

    # Apply approved change to database
    published = change_detector.apply_approved_change(
        db=db,
        candidate_extracted_data=extracted_data,
        previous_notification_id=candidate.previous_notification_id,
        reviewed_by=admin_user.email,
        review_notes=payload.approval_notes,
    )

    now_iso = datetime.now(timezone.utc).isoformat()
    candidate.status = "MANUALLY_APPROVED"
    candidate.reviewed_by = admin_user.email
    candidate.reviewed_at = now_iso
    candidate.review_notes = payload.approval_notes
    candidate.published_notification_id = published.id

    # Record audit log
    audit = AuditLog(
        user_id=admin_user.id,
        user_email=admin_user.email,
        action="APPROVE_CANDIDATE",
        entity_type="ExtractionReviewItem",
        entity_id=candidate.id,
        summary=f"Approved candidate '{candidate.document_title}' (Type: {candidate.change_type}) for publication.",
        changes_diff=candidate.diff_summary,
    )
    db.add(audit)
    db.commit()
    db.refresh(candidate)

    # Dispatch alerts to interested students
    alert_service.notify_students_of_notification_update(
        db=db,
        notification=published,
        change_type=candidate.change_type,
        diff_summary=candidate.diff_summary,
    )

    return StandardApiResponse(data=candidate, message="Candidate change approved, published, and alerts dispatched")

@router.post("/candidates/{candidate_id}/reject", response_model=StandardApiResponse[ExtractionReviewItemResponse])
def reject_candidate_change(
    candidate_id: str,
    payload: CandidateRejectionRequest,
    db: Session = Depends(get_db),
    admin_user: AuthenticatedUser = Depends(get_current_admin),
):
    """Reject an invalid or unauthoritative candidate notice from publication."""
    candidate = db.query(ExtractionReviewItem).filter(ExtractionReviewItem.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate item not found")

    candidate.status = "REJECTED"
    candidate.reviewed_by = admin_user.email
    candidate.reviewed_at = datetime.now(timezone.utc).isoformat()
    candidate.review_notes = f"REJECTED: {payload.rejection_reason}"

    audit = AuditLog(
        user_id=admin_user.id,
        user_email=admin_user.email,
        action="REJECT_CANDIDATE",
        entity_type="ExtractionReviewItem",
        entity_id=candidate.id,
        summary=f"Rejected candidate '{candidate.document_title}'. Reason: {payload.rejection_reason}",
        changes_diff={"rejection_reason": payload.rejection_reason},
    )
    db.add(audit)
    db.commit()
    db.refresh(candidate)

    return StandardApiResponse(data=candidate, message="Candidate notice rejected successfully")

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
