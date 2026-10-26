from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import String, Integer, Text, ForeignKey, Boolean, JSON, Index, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import UUIDModel

if TYPE_CHECKING:
    from app.models.eligibility import QualificationRule, AgeCriteria, CommunityDomicileRule
    from app.models.notification import RecruitmentNotification, RecruitmentPost
    from app.models.student import SavedExam, StudyPlan

class ExamAuthority(UUIDModel):
    """Issuing Commission or Board (e.g. UPSC, SSC, NTA, ISRO ICRB, KPSC)."""
    __tablename__ = "exam_authorities"

    code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    portal_type: Mapped[str] = mapped_column(String(50), default="Central")  # Central / State / PSU
    website_url: Mapped[str] = mapped_column(String(500), nullable=False)
    state_jurisdiction: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    exams: Mapped[List["GovernmentExam"]] = relationship("GovernmentExam", back_populates="authority")

class ExamCategory(UUIDModel):
    """Category Sector (Civil Services, Staff Selection, Engineering & PSU, etc.)."""
    __tablename__ = "exam_categories"

    code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    exams: Mapped[List["GovernmentExam"]] = relationship("GovernmentExam", back_populates="category")

class GovernmentExam(UUIDModel):
    """Central or State Government Examination Specification."""
    __tablename__ = "government_exams"

    slug: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    code: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    level: Mapped[str] = mapped_column(String(50), nullable=False)  # Central / State / PSU
    posts_summary: Mapped[str] = mapped_column(Text, nullable=False)
    vacancies_count: Mapped[int] = mapped_column(Integer, default=0)
    min_qualification_summary: Mapped[str] = mapped_column(Text, nullable=False)
    eligible_streams: Mapped[Optional[dict]] = mapped_column(JSON, default=list)
    attempts_info: Mapped[Optional[dict]] = mapped_column(JSON, default=dict)
    negative_marking: Mapped[str] = mapped_column(String(150), default="No negative marking")
    duration_info: Mapped[str] = mapped_column(String(150), default="120 Minutes")
    relevance_for_tech: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    official_website: Mapped[str] = mapped_column(String(500), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="Upcoming")  # Active / Upcoming / Closed
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Relationships
    authority_id: Mapped[str] = mapped_column(String(36), ForeignKey("exam_authorities.id"), nullable=False)
    authority: Mapped["ExamAuthority"] = relationship("ExamAuthority", back_populates="exams")

    category_id: Mapped[str] = mapped_column(String(36), ForeignKey("exam_categories.id"), nullable=False)
    category: Mapped["ExamCategory"] = relationship("ExamCategory", back_populates="exams")

    stages: Mapped[List["ExamStage"]] = relationship("ExamStage", back_populates="exam", cascade="all, delete-orphan")
    pay_scales: Mapped[List["PayScale"]] = relationship("PayScale", back_populates="exam", cascade="all, delete-orphan")
    qualification_rules: Mapped[List["QualificationRule"]] = relationship("QualificationRule", back_populates="exam", cascade="all, delete-orphan")
    age_criteria: Mapped[List["AgeCriteria"]] = relationship("AgeCriteria", back_populates="exam", cascade="all, delete-orphan")
    domicile_rules: Mapped[List["CommunityDomicileRule"]] = relationship("CommunityDomicileRule", back_populates="exam", cascade="all, delete-orphan")
    saved_by: Mapped[List["SavedExam"]] = relationship("SavedExam", back_populates="exam")

    __table_args__ = (
        Index("ix_gov_exams_level_category", "level", "category_id"),
    )

class ExamStage(UUIDModel):
    """Stages in the selection process (Prelims, Mains, Interview/CBE)."""
    __tablename__ = "exam_stages"

    exam_id: Mapped[str] = mapped_column(String(36), ForeignKey("government_exams.id"), nullable=False)
    stage_order: Mapped[int] = mapped_column(Integer, default=1)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    stage_type: Mapped[str] = mapped_column(String(50), default="Objective MCQ")  # MCQ / Written Descriptive / Interview
    details: Mapped[str] = mapped_column(Text, nullable=False)
    total_marks: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    duration_minutes: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    is_qualifying_only: Mapped[bool] = mapped_column(Boolean, default=False)

    exam: Mapped["GovernmentExam"] = relationship("GovernmentExam", back_populates="stages")
    syllabus_topics: Mapped[List["SyllabusTopic"]] = relationship("SyllabusTopic", back_populates="stage", cascade="all, delete-orphan")

class SyllabusTopic(UUIDModel):
    """Granular syllabus topic mapped to exam stages for overlap analysis."""
    __tablename__ = "syllabus_topics"

    stage_id: Mapped[str] = mapped_column(String(36), ForeignKey("exam_stages.id"), nullable=False)
    exam_id: Mapped[str] = mapped_column(String(36), ForeignKey("government_exams.id"), nullable=False)
    subject_area: Mapped[str] = mapped_column(String(150), index=True, nullable=False)  # History, Quantitative, GS-1, etc.
    topic_name: Mapped[str] = mapped_column(String(255), nullable=False)
    topic_details: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_core_overlap: Mapped[bool] = mapped_column(Boolean, default=False)
    overlap_keywords: Mapped[Optional[dict]] = mapped_column(JSON, default=list)

    stage: Mapped["ExamStage"] = relationship("ExamStage", back_populates="syllabus_topics")

class PayScale(UUIDModel):
    """Official 7th CPC / State / UGC Pay Scale information with gazetted source."""
    __tablename__ = "pay_scales"

    exam_id: Mapped[str] = mapped_column(String(36), ForeignKey("government_exams.id"), nullable=False)
    post_name: Mapped[str] = mapped_column(String(200), nullable=False)
    pay_level: Mapped[str] = mapped_column(String(50), nullable=False)  # Level 10, Level 7, Academic Level 10
    basic_pay_min: Mapped[int] = mapped_column(Integer, nullable=False)  # e.g. 56100
    basic_pay_max: Mapped[int] = mapped_column(Integer, nullable=False)  # e.g. 177500
    gross_approx_metro: Mapped[str] = mapped_column(String(100), nullable=False)  # e.g. ₹98,500/month
    source_clause: Mapped[str] = mapped_column(String(255), nullable=False)  # Gazette Notification Para 4
    official_source_url: Mapped[str] = mapped_column(String(500), nullable=False)
    effective_date: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    exam: Mapped["GovernmentExam"] = relationship("GovernmentExam", back_populates="pay_scales")
