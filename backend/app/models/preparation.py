from datetime import datetime, date, timezone
from typing import Optional, List, Dict, Any
from sqlalchemy import String, Integer, Float, Boolean, Text, ForeignKey, JSON, Date, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import UUIDModel

class QuestionBank(UUIDModel):
    """
    Verified question bank items for PYQs, topic quizzes, and mock tests.
    """
    __tablename__ = "question_banks"

    exam_code: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    paper_type: Mapped[str] = mapped_column(String(32), default="PAPER_1", nullable=False) # PAPER_1, PAPER_2, PRELIMS_GS, TIER_1, TECHNICAL
    subject: Mapped[str] = mapped_column(String(128), nullable=False, index=True)
    topic: Mapped[str] = mapped_column(String(128), nullable=False, index=True)
    question_text: Mapped[str] = mapped_column(Text, nullable=False)
    options: Mapped[List[str]] = mapped_column(JSON, nullable=False) # list of 4 options
    correct_option_index: Mapped[int] = mapped_column(Integer, nullable=False) # 0, 1, 2, or 3
    explanation: Mapped[str] = mapped_column(Text, nullable=False)
    difficulty: Mapped[str] = mapped_column(String(16), default="MEDIUM", nullable=False) # EASY, MEDIUM, HARD
    question_source: Mapped[str] = mapped_column(String(32), default="OFFICIAL_PYQ", nullable=False) # OFFICIAL_PYQ, AI_GENERATED_PRACTICE, CURATED_MODEL
    pyq_year: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    source_citation: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class MockTest(UUIDModel):
    """
    Standardized or adaptive test papers with exact commission marking schemes.
    """
    __tablename__ = "mock_tests"

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    exam_code: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    test_type: Mapped[str] = mapped_column(String(32), default="FULL_LENGTH", nullable=False) # FULL_LENGTH, TOPIC_WISE, MISTAKE_BASED, PYQ_SIMULATION
    total_questions: Mapped[int] = mapped_column(Integer, nullable=False)
    duration_minutes: Mapped[int] = mapped_column(Integer, nullable=False)
    positive_marks_per_q: Mapped[float] = mapped_column(Float, default=2.0, nullable=False)
    negative_marks_per_q: Mapped[float] = mapped_column(Float, default=0.66, nullable=False)
    question_ids: Mapped[List[str]] = mapped_column(JSON, nullable=False) # List of QuestionBank IDs
    instructions: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_published: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class MockTestAttempt(UUIDModel):
    """
    A student's completed or active mock test attempt evaluated by backend code.
    """
    __tablename__ = "mock_test_attempts"

    student_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("student_profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    mock_test_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("mock_tests.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    exam_code: Mapped[str] = mapped_column(String(64), nullable=False)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    submitted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    time_spent_seconds: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    answers: Mapped[Dict[str, int]] = mapped_column(JSON, default=dict, nullable=False) # {question_id: chosen_index}
    total_attempted: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    correct_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    incorrect_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    unanswered_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    total_marks: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    accuracy_percentage: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    percentile_rank: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    weak_topics: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    strong_topics: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)

    # Relationships
    mistakes: Mapped[List["StudentMistake"]] = relationship(
        "StudentMistake",
        back_populates="attempt",
        cascade="all, delete-orphan",
    )


class StudentMistake(UUIDModel):
    """
    Aspirant's mistake notebook for spaced repetition and mistake-based test generation.
    """
    __tablename__ = "student_mistakes"

    student_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("student_profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    question_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("question_banks.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    attempt_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey("mock_test_attempts.id", ondelete="SET NULL"),
        nullable=True,
    )
    chosen_option_index: Mapped[int] = mapped_column(Integer, nullable=False)
    correct_option_index: Mapped[int] = mapped_column(Integer, nullable=False)
    topic: Mapped[str] = mapped_column(String(128), nullable=False, index=True)
    subject: Mapped[str] = mapped_column(String(128), nullable=False)
    review_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_resolved: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    attempt: Mapped[Optional["MockTestAttempt"]] = relationship(
        "MockTestAttempt",
        back_populates="mistakes",
    )
    question: Mapped["QuestionBank"] = relationship("QuestionBank")


class StudentStudyGoal(UUIDModel):
    """Daily study goal and completion tracking."""
    __tablename__ = "student_study_goals"

    student_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("student_profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    target_date: Mapped[date] = mapped_column(Date, default=date.today, nullable=False, index=True)
    goal_hours: Mapped[float] = mapped_column(Float, default=6.0, nullable=False)
    completed_hours: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)


class PomodoroSession(UUIDModel):
    """Productivity focus intervals."""
    __tablename__ = "pomodoro_sessions"

    student_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("student_profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    duration_minutes: Mapped[int] = mapped_column(Integer, default=25, nullable=False)
    topic: Mapped[str] = mapped_column(String(128), default="General Study", nullable=False)
    completed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )


class StudyStreak(UUIDModel):
    """Daily habit streak tracking."""
    __tablename__ = "study_streaks"

    student_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("student_profiles.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )
    current_streak_days: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    longest_streak_days: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    last_active_date: Mapped[date] = mapped_column(Date, default=date.today, nullable=False)
