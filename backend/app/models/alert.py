from typing import Optional
from sqlalchemy import String, Boolean, ForeignKey, Index, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import UUIDModel

class StudentAlert(UUIDModel):
    """
    Database-backed personalized alerts for students:
    - New matching examinations
    - Newly published recruitment notices
    - Closing-soon deadlines
    - Changes / corrigenda to saved examinations
    - Admit card and examination date announcements
    """
    __tablename__ = "student_alerts"

    student_id: Mapped[str] = mapped_column(String(36), ForeignKey("student_profiles.id"), nullable=False)
    alert_type: Mapped[str] = mapped_column(String(50), nullable=False)  # MATCHING_EXAM, NEW_NOTIFICATION, CLOSING_SOON, CORRIGENDUM_ALERT, ADMIT_CARD
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    reference_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)  # exam slug or notification id
    reference_type: Mapped[Optional[str]] = mapped_column(String(50), default="exam")  # exam, notification, application
    priority: Mapped[str] = mapped_column(String(50), default="MEDIUM")  # LOW, MEDIUM, HIGH, CRITICAL

    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    is_dismissed: Mapped[bool] = mapped_column(Boolean, default=False)
    email_dispatched: Mapped[bool] = mapped_column(Boolean, default=False)
    email_dispatched_at: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    student: Mapped["StudentProfile"] = relationship("StudentProfile", back_populates="alerts")

    __table_args__ = (
        Index("ix_student_alert_unread", "student_id", "is_read", "is_dismissed"),
        Index("ix_student_alert_type", "student_id", "alert_type"),
    )
