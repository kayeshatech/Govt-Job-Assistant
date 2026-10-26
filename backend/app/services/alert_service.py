import logging
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.alert import StudentAlert
from app.models.student import StudentProfile, StudentPreference, SavedExam
from app.models.notification import RecruitmentNotification

logger = logging.getLogger(__name__)

class EmailDeliveryAdapter:
    """Provider-independent email delivery adapter with console/test fallback."""
    @staticmethod
    def send_email(to_email: str, subject: str, body: str) -> bool:
        if settings.EMAIL_PROVIDER == "console" or not settings.SMTP_HOST:
            logger.info(f"[Email Adapter: Console] TO: {to_email} | SUBJECT: {subject} | BODY: {body[:120]}...")
            return True
        # SMTP integration if configured
        try:
            import smtplib
            from email.mime.text import MIMEText
            from email.mime.multipart import MIMEMultipart

            msg = MIMEMultipart()
            msg["From"] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"
            msg["To"] = to_email
            msg["Subject"] = subject
            msg.attach(MIMEText(body, "plain"))

            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT or 587) as server:
                server.starttls()
                if settings.SMTP_USER and settings.SMTP_PASSWORD:
                    server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.send_message(msg)
            return True
        except Exception as e:
            logger.error(f"Failed to dispatch email via SMTP: {e}")
            return False

class AlertService:
    """
    Personalized alert generation and dispatch engine:
    Evaluates student preferences, saved applications, and sends deduplicated alerts.
    """

    @staticmethod
    def notify_students_of_notification_update(
        db: Session,
        notification: RecruitmentNotification,
        change_type: str,
        diff_summary: Optional[dict] = None,
    ) -> int:
        """
        Dispatches targeted alerts to students interested in this recruitment drive.
        Returns total alerts generated.
        """
        alerts_created = 0

        # Find students who saved an exam matching this notification or title
        saved_records = db.query(SavedExam).all()
        matching_student_ids = set()

        for s in saved_records:
            if s.exam_title and (
                s.exam_title.lower() in notification.title.lower()
                or notification.title.lower() in s.exam_title.lower()
            ):
                matching_student_ids.add(s.student_id)

        # Also find students whose target categories match
        all_students = db.query(StudentProfile).all()
        for student in all_students:
            prefs = student.preferences
            if prefs and prefs.target_categories:
                if any(cat.lower() in notification.category_name.lower() for cat in prefs.target_categories):
                    matching_student_ids.add(student.id)

        for student_id in matching_student_ids:
            student = db.query(StudentProfile).filter(StudentProfile.id == student_id).first()
            if not student:
                continue

            prefs = student.preferences or StudentPreference(student_id=student.id)

            # Determine alert content based on change type
            if change_type == "DEADLINE_EXTENSION":
                if not prefs.alert_deadline_reminders:
                    continue
                alert_type = "CLOSING_SOON"
                title = f"Deadline Extended: {notification.title}"
                new_deadline = notification.application_deadline
                message = f"Official closing date has been updated to {new_deadline}. Check your application tracker."
                priority = "HIGH"
            elif change_type == "CORRIGENDUM":
                if not prefs.alert_corrigendum:
                    continue
                alert_type = "CORRIGENDUM_ALERT"
                title = f"Corrigendum Notice: {notification.title}"
                message = "The commission has published an official amendment notice. Review updated vacancy and qualification terms."
                priority = "HIGH"
            else:
                if not prefs.alert_new_exams:
                    continue
                alert_type = "NEW_NOTIFICATION"
                title = f"Recruitment Published: {notification.title}"
                message = f"Official notice announced with {notification.total_vacancies} vacancies. Applications close on {notification.application_deadline}."
                priority = "MEDIUM"

            # Deduplication: Check if identical alert already exists
            existing_alert = db.query(StudentAlert).filter(
                StudentAlert.student_id == student.id,
                StudentAlert.alert_type == alert_type,
                StudentAlert.reference_id == notification.id,
                StudentAlert.is_dismissed == False,
            ).first()

            if existing_alert:
                continue

            alert = StudentAlert(
                student_id=student.id,
                alert_type=alert_type,
                title=title,
                message=message,
                reference_id=notification.id,
                reference_type="notification",
                priority=priority,
                is_read=False,
                is_dismissed=False,
            )

            # Optional email dispatch
            if prefs.email_notification_opt_in and student.email:
                email_sent = EmailDeliveryAdapter.send_email(
                    to_email=student.email,
                    subject=f"[Govexa Alert] {title}",
                    body=f"Dear {student.full_name},\n\n{message}\n\nOfficial Portal: {notification.official_portal}\n\nTeam Govexa",
                )
                if email_sent:
                    alert.email_dispatched = True
                    alert.email_dispatched_at = datetime.now(timezone.utc).isoformat()

            db.add(alert)
            alerts_created += 1

        db.commit()
        return alerts_created

    @staticmethod
    def generate_closing_soon_alerts(db: Session, target_date_iso: str) -> int:
        """
        Scans all active notifications closing on or before target_date_iso and alerts tracked students.
        """
        notifications = db.query(RecruitmentNotification).filter(
            RecruitmentNotification.status.in_(["Active", "Corrigendum"]),
            RecruitmentNotification.application_deadline <= target_date_iso,
        ).all()

        count = 0
        for notif in notifications:
            count += AlertService.notify_students_of_notification_update(
                db=db,
                notification=notif,
                change_type="DEADLINE_EXTENSION",
            )
        return count

alert_service = AlertService()
