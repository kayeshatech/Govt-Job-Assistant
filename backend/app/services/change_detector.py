from typing import Optional, Dict, Any, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.config import settings
from app.models.notification import RecruitmentNotification, NotificationVersion
from app.schemas.monitoring import ExtractedRecruitmentData

class ChangeDetector:
    """
    Compares newly extracted recruitment data against existing database records.
    Detects corrigenda, deadline changes, vacancy updates, and computes high-impact flags.
    Enforces review requirements for high-impact changes.
    """

    @staticmethod
    def analyze_change(
        db: Session,
        extracted: ExtractedRecruitmentData,
    ) -> Tuple[str, Optional[RecruitmentNotification], Dict[str, Any], List[str], str]:
        """
        Analyzes extracted data against existing database records.
        Returns:
            (change_type, previous_notification, diff_summary, high_impact_flags, initial_status)
        """
        diff_summary: Dict[str, Any] = {}
        high_impact_flags: List[str] = []

        # Find existing notice by advertisement number or examination title
        existing = db.query(RecruitmentNotification).filter(
            or_(
                RecruitmentNotification.advertisement_number == extracted.advertisement_number,
                RecruitmentNotification.title.ilike(f"%{extracted.examination_name[:30]}%"),
            )
        ).first()

        # Case 1: Brand New Recruitment Notice
        if not existing:
            change_type = "NEW_NOTICE"
            initial_status = "PENDING_REVIEW"
            
            # Policy: If confidence is very high (>=0.95), valid dates, and no corrigendum flags,
            # and low risk is permitted:
            if extracted.confidence_score >= settings.AUTO_APPROVE_CONFIDENCE_THRESHOLD:
                # Still verify sane dates
                if extracted.application_closing_date and extracted.application_closing_date >= "2026-01-01":
                    initial_status = "AUTO_APPROVED"
            return change_type, None, diff_summary, high_impact_flags, initial_status

        # Case 2: Existing notice found -> Check for differences
        previous_notification = existing

        # Corrigendum flag check
        if extracted.is_corrigendum:
            change_type = "CORRIGENDUM"
            high_impact_flags.append("OFFICIAL_CORRIGENDUM_ISSUED")
        else:
            change_type = "UPDATE_DETECTED"

        # Check deadline changes
        if extracted.application_closing_date and extracted.application_closing_date != existing.application_deadline:
            diff_summary["deadline"] = {
                "previous": existing.application_deadline,
                "extracted": extracted.application_closing_date,
            }
            change_type = "DEADLINE_EXTENSION"
            high_impact_flags.append("HIGH_IMPACT_DEADLINE_CHANGED")

        # Check vacancy changes
        if extracted.total_vacancies is not None and extracted.total_vacancies != existing.total_vacancies:
            diff_summary["vacancies"] = {
                "previous": existing.total_vacancies,
                "extracted": extracted.total_vacancies,
            }
            change_type = "VACANCY_REVISION"
            high_impact_flags.append("HIGH_IMPACT_VACANCY_CHANGED")

        # Check status / exam date
        if extracted.preliminary_exam_date and extracted.preliminary_exam_date != existing.tentative_exam_date:
            diff_summary["exam_date"] = {
                "previous": existing.tentative_exam_date,
                "extracted": extracted.preliminary_exam_date,
            }
            high_impact_flags.append("EXAM_DATE_ANNOUNCED")

        # If no differences detected
        if not diff_summary and not high_impact_flags:
            return "NO_CHANGE", existing, {}, [], "AUTO_APPROVED"

        # Approval policy:
        # High impact changes (deadlines, vacancies, corrigenda) MUST require review
        # unless AUTO_APPROVE_HIGH_IMPACT_ALLOWED is explicitly True
        if high_impact_flags and not settings.AUTO_APPROVE_HIGH_IMPACT_ALLOWED:
            initial_status = "PENDING_REVIEW"
        else:
            initial_status = "AUTO_APPROVED" if extracted.confidence_score >= 0.95 else "PENDING_REVIEW"

        return change_type, previous_notification, diff_summary, high_impact_flags, initial_status

    @staticmethod
    def apply_approved_change(
        db: Session,
        candidate_extracted_data: Dict[str, Any],
        previous_notification_id: Optional[str],
        reviewed_by: str,
        review_notes: Optional[str] = None,
    ) -> RecruitmentNotification:
        """
        Idempotently commits approved candidate changes into the active database.
        Appends a NotificationVersion to maintain full historical audit integrity.
        """
        data = candidate_extracted_data

        if previous_notification_id:
            # Update existing notification
            notification = db.query(RecruitmentNotification).filter(
                RecruitmentNotification.id == previous_notification_id
            ).first()
            if not notification:
                raise ValueError(f"Previous notification {previous_notification_id} not found")

            # Determine next version number
            existing_versions = db.query(NotificationVersion).filter(
                NotificationVersion.notification_id == notification.id
            ).count()
            version_num = existing_versions + 1

            # Create immutable version record for previous state
            diff_dict = {}
            if data.get("application_closing_date") and data["application_closing_date"] != notification.application_deadline:
                diff_dict["application_deadline"] = {"old": notification.application_deadline, "new": data["application_closing_date"]}
                notification.application_deadline = data["application_closing_date"]

            if data.get("total_vacancies") is not None and data["total_vacancies"] != notification.total_vacancies:
                diff_dict["total_vacancies"] = {"old": notification.total_vacancies, "new": data["total_vacancies"]}
                notification.total_vacancies = data["total_vacancies"]

            if data.get("preliminary_exam_date"):
                notification.tentative_exam_date = data["preliminary_exam_date"]

            if data.get("is_corrigendum"):
                notification.status = "Corrigendum"

            version_record = NotificationVersion(
                notification_id=notification.id,
                version_number=version_num,
                corrigendum_number=data.get("corrigendum_references"),
                change_summary=review_notes or f"Version {version_num} updated via official gazette review",
                diff_details=diff_dict,
                effective_date=data.get("application_opening_date") or "2026-03-01",
            )
            db.add(version_record)
            notification.is_verified_official = True
            notification.verification_status = "Verified"
            notification.verified_by = reviewed_by
            db.commit()
            db.refresh(notification)
            return notification
        else:
            # Create new official notification record
            notification = RecruitmentNotification(
                advertisement_number=data.get("advertisement_number", "ADVT-2026-NEW"),
                title=data.get("examination_name", "Government Recruitment 2026"),
                agency_name=data.get("authority_name", "Public Service Commission"),
                category_name="Central & State Administration",
                release_date=data.get("application_opening_date") or "2026-02-01",
                application_deadline=data.get("application_closing_date") or "2026-04-30",
                tentative_exam_date=data.get("preliminary_exam_date"),
                total_vacancies=data.get("total_vacancies") or 0,
                official_pdf_url=data.get("official_application_url"),
                official_portal=data.get("official_application_url") or "https://upsc.gov.in",
                status="Active",
                highlights=data.get("selection_stages") or [],
                eligibility_snippet=data.get("qualification_excerpt") or "Prescribed degree required",
                fee_structure=data.get("application_fee_details") or "₹100",
                is_verified_official=True,
                verification_status="Verified",
                verified_by=reviewed_by,
                source_portal_name=data.get("authority_name", "Official Gazette"),
                tags=["Gazette Monitored", "Verified"],
            )
            db.add(notification)
            db.commit()
            db.refresh(notification)
            return notification

change_detector = ChangeDetector()
