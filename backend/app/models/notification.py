from typing import Optional, List
from sqlalchemy import String, Integer, Text, Boolean, ForeignKey, JSON, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import UUIDModel

class RecruitmentNotification(UUIDModel):
    """Official Gazetted Recruitment Notification Record."""
    __tablename__ = "recruitment_notifications"

    advertisement_number: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    agency_name: Mapped[str] = mapped_column(String(200), index=True, nullable=False)
    category_name: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    release_date: Mapped[str] = mapped_column(String(50), nullable=False)  # "2026-02-14"
    application_deadline: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    tentative_exam_date: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    total_vacancies: Mapped[int] = mapped_column(Integer, default=0)
    official_pdf_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    official_portal: Mapped[str] = mapped_column(String(500), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="Active")  # Active, Upcoming, Corrigendum, Admit Card, Closed
    highlights: Mapped[Optional[dict]] = mapped_column(JSON, default=list)
    eligibility_snippet: Mapped[str] = mapped_column(Text, nullable=False)
    fee_structure: Mapped[str] = mapped_column(String(255), nullable=False)
    is_verified_official: Mapped[bool] = mapped_column(Boolean, default=True)
    verification_status: Mapped[str] = mapped_column(String(50), default="Verified")  # Verified, Pending Review, Flagged
    verified_by: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    source_portal_name: Mapped[str] = mapped_column(String(200), nullable=False)
    tags: Mapped[Optional[dict]] = mapped_column(JSON, default=list)

    posts: Mapped[List["RecruitmentPost"]] = relationship(
        "RecruitmentPost", back_populates="notification", cascade="all, delete-orphan"
    )
    versions: Mapped[List["NotificationVersion"]] = relationship(
        "NotificationVersion", back_populates="notification", cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("ix_recruitment_status_deadline", "status", "application_deadline"),
    )

class RecruitmentPost(UUIDModel):
    """Specific role / cadre under an advertisement with reservation breakdown."""
    __tablename__ = "recruitment_posts"

    notification_id: Mapped[str] = mapped_column(String(36), ForeignKey("recruitment_notifications.id"), nullable=False)
    post_title: Mapped[str] = mapped_column(String(200), nullable=False)
    department: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    pay_level: Mapped[str] = mapped_column(String(50), default="Level 7")
    vacancies_breakdown: Mapped[Optional[dict]] = mapped_column(JSON, default=dict)  # {"UR": 50, "OBC": 27, "SC": 15, "ST": 8}
    total_post_vacancies: Mapped[int] = mapped_column(Integer, default=0)

    notification: Mapped["RecruitmentNotification"] = relationship("RecruitmentNotification", back_populates="posts")

class NotificationVersion(UUIDModel):
    """Corrigendum and revision change history for notices."""
    __tablename__ = "notification_versions"

    notification_id: Mapped[str] = mapped_column(String(36), ForeignKey("recruitment_notifications.id"), nullable=False)
    version_number: Mapped[int] = mapped_column(Integer, default=1)
    corrigendum_number: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    change_summary: Mapped[str] = mapped_column(Text, nullable=False)
    diff_details: Mapped[Optional[dict]] = mapped_column(JSON, default=dict)
    effective_date: Mapped[str] = mapped_column(String(50), nullable=False)

    notification: Mapped["RecruitmentNotification"] = relationship("RecruitmentNotification", back_populates="versions")

class NotificationSource(UUIDModel):
    """Monitored official government websites and gazette repositories."""
    __tablename__ = "notification_sources"

    portal_name: Mapped[str] = mapped_column(String(150), unique=True, nullable=False)
    portal_url: Mapped[str] = mapped_column(String(500), nullable=False)
    commission_type: Mapped[str] = mapped_column(String(50), default="Central")
    is_monitored: Mapped[bool] = mapped_column(Boolean, default=True)
    last_crawled_at: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    verification_level: Mapped[str] = mapped_column(String(50), default="Official Gazette")
