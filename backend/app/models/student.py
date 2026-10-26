from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, Integer, Float, Boolean, ForeignKey, JSON, Text, UniqueConstraint, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import UUIDModel

if TYPE_CHECKING:
    from app.models.exam import GovernmentExam

class StudentProfile(UUIDModel):
    """Student Profile linked 1-to-1 with Supabase Auth verified UUID."""
    __tablename__ = "student_profiles"

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    date_of_birth: Mapped[str] = mapped_column(String(50), default="2001-01-01", nullable=False)  # "2001-08-15"
    age: Mapped[int] = mapped_column(Integer, default=24)
    gender: Mapped[str] = mapped_column(String(50), default="Female")
    category: Mapped[str] = mapped_column(String(50), default="General / UR")
    domicile_state: Mapped[str] = mapped_column(String(100), default="Karnataka")
    is_pwd: Mapped[bool] = mapped_column(Boolean, default=False)
    pwd_percentage: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    education_level: Mapped[str] = mapped_column(String(100), default="Bachelor of Engineering / B.Tech")
    major_stream: Mapped[str] = mapped_column(String(150), default="Computer Science & Engineering")
    graduation_year: Mapped[int] = mapped_column(Integer, default=2024)
    graduation_percentage: Mapped[float] = mapped_column(Float, default=74.5)
    preferred_daily_study_hours: Mapped[int] = mapped_column(Integer, default=6)
    is_onboarded: Mapped[bool] = mapped_column(Boolean, default=True)
    role: Mapped[str] = mapped_column(String(50), default="student")  # student / admin

    # Relationships
    preferences: Mapped[Optional["StudentPreference"]] = relationship(
        "StudentPreference", back_populates="student", uselist=False, cascade="all, delete-orphan"
    )
    saved_exams: Mapped[List["SavedExam"]] = relationship(
        "SavedExam", back_populates="student", cascade="all, delete-orphan"
    )
    reminders: Mapped[List["StudentReminder"]] = relationship(
        "StudentReminder", back_populates="student", cascade="all, delete-orphan"
    )
    study_plans: Mapped[List["StudyPlan"]] = relationship(
        "StudyPlan", back_populates="student", cascade="all, delete-orphan"
    )

class StudentPreference(UUIDModel):
    """Student examination preferences & target sectors."""
    __tablename__ = "student_preferences"

    student_id: Mapped[str] = mapped_column(String(36), ForeignKey("student_profiles.id"), unique=True, nullable=False)
    target_categories: Mapped[Optional[dict]] = mapped_column(JSON, default=list)  # ["Civil Services", "Engineering & PSU"]
    target_exam_codes: Mapped[Optional[dict]] = mapped_column(JSON, default=list)
    email_notification_opt_in: Mapped[bool] = mapped_column(Boolean, default=True)

    student: Mapped["StudentProfile"] = relationship("StudentProfile", back_populates="preferences")

class SavedExam(UUIDModel):
    """Student saved exam and application tracking pipeline."""
    __tablename__ = "saved_exams"

    student_id: Mapped[str] = mapped_column(String(36), ForeignKey("student_profiles.id"), nullable=False)
    exam_id: Mapped[str] = mapped_column(String(36), ForeignKey("government_exams.id"), nullable=False)
    exam_title: Mapped[str] = mapped_column(String(255), nullable=False)
    conducting_body: Mapped[str] = mapped_column(String(200), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="Draft / Planning")
    registration_number: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    roll_number: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    application_date: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    exam_date: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    student: Mapped["StudentProfile"] = relationship("StudentProfile", back_populates="saved_exams")
    exam: Mapped["GovernmentExam"] = relationship("GovernmentExam", back_populates="saved_by")

    __table_args__ = (
        UniqueConstraint("student_id", "exam_id", name="uq_student_saved_exam"),
        Index("ix_saved_exam_student_status", "student_id", "status"),
    )

class StudentReminder(UUIDModel):
    """Student personal reminders and deadlines."""
    __tablename__ = "student_reminders"

    student_id: Mapped[str] = mapped_column(String(36), ForeignKey("student_profiles.id"), nullable=False)
    exam_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("government_exams.id"), nullable=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    reminder_date: Mapped[str] = mapped_column(String(50), nullable=False)
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False)

    student: Mapped["StudentProfile"] = relationship("StudentProfile", back_populates="reminders")

class StudyPlan(UUIDModel):
    """Student roadmap progress tracking."""
    __tablename__ = "study_plans"

    student_id: Mapped[str] = mapped_column(String(36), ForeignKey("student_profiles.id"), nullable=False)
    exam_id: Mapped[str] = mapped_column(String(36), ForeignKey("government_exams.id"), nullable=False)
    exam_title: Mapped[str] = mapped_column(String(255), nullable=False)
    target_year: Mapped[int] = mapped_column(Integer, default=2026)
    total_weeks: Mapped[int] = mapped_column(Integer, default=40)
    current_week: Mapped[int] = mapped_column(Integer, default=1)
    progress_percentage: Mapped[int] = mapped_column(Integer, default=0)

    student: Mapped["StudentProfile"] = relationship("StudentProfile", back_populates="study_plans")
    tasks: Mapped[List["DailyStudyTask"]] = relationship(
        "DailyStudyTask", back_populates="study_plan", cascade="all, delete-orphan"
    )

class DailyStudyTask(UUIDModel):
    """Individual study checklist task."""
    __tablename__ = "daily_study_tasks"

    study_plan_id: Mapped[str] = mapped_column(String(36), ForeignKey("study_plans.id"), nullable=False)
    student_id: Mapped[str] = mapped_column(String(36), nullable=False)
    subject: Mapped[str] = mapped_column(String(150), nullable=False)
    topic: Mapped[str] = mapped_column(String(255), nullable=False)
    duration_minutes: Mapped[int] = mapped_column(Integer, default=60)
    status: Mapped[str] = mapped_column(String(50), default="pending")  # pending / in-progress / completed
    priority: Mapped[str] = mapped_column(String(50), default="medium")  # high / medium / normal
    scheduled_date: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    study_plan: Mapped["StudyPlan"] = relationship("StudyPlan", back_populates="tasks")
