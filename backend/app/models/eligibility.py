from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, Integer, Float, Boolean, ForeignKey, JSON, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import UUIDModel

if TYPE_CHECKING:
    from app.models.exam import GovernmentExam

class QualificationRule(UUIDModel):
    """Educational qualification requirements for an examination or post."""
    __tablename__ = "qualification_rules"

    exam_id: Mapped[str] = mapped_column(String(36), ForeignKey("government_exams.id"), nullable=False)
    min_degree_level: Mapped[str] = mapped_column(String(100), nullable=False)  # Bachelor / Master / 10+2
    allowed_streams: Mapped[Optional[dict]] = mapped_column(JSON, default=list)  # ["Engineering", "Science", "Any"]
    min_aggregate_percentage: Mapped[float] = mapped_column(Float, default=0.0)
    final_year_eligible: Mapped[bool] = mapped_column(Boolean, default=True)
    mandatory_subjects: Mapped[Optional[dict]] = mapped_column(JSON, default=list)
    official_clause_reference: Mapped[str] = mapped_column(String(255), default="Notification Rule 3")

    exam: Mapped["GovernmentExam"] = relationship("GovernmentExam", back_populates="qualification_rules")

class AgeCriteria(UUIDModel):
    """Age criteria with official cut-off date reference."""
    __tablename__ = "age_criteria"

    exam_id: Mapped[str] = mapped_column(String(36), ForeignKey("government_exams.id"), nullable=False)
    min_age: Mapped[int] = mapped_column(Integer, nullable=False)  # e.g. 21
    max_age_general: Mapped[int] = mapped_column(Integer, nullable=False)  # e.g. 32
    cutoff_reference_date: Mapped[str] = mapped_column(String(50), nullable=False)  # "2026-08-01"
    official_clause: Mapped[str] = mapped_column(String(255), default="Rule 4(b) Age Limits")

    exam: Mapped["GovernmentExam"] = relationship("GovernmentExam", back_populates="age_criteria")
    relaxations: Mapped[List["AgeRelaxationRule"]] = relationship(
        "AgeRelaxationRule", back_populates="age_criteria", cascade="all, delete-orphan"
    )

class AgeRelaxationRule(UUIDModel):
    """Statutory category-based age relaxation rules (OBC +3, SC/ST +5, PwD +10)."""
    __tablename__ = "age_relaxation_rules"

    age_criteria_id: Mapped[str] = mapped_column(String(36), ForeignKey("age_criteria.id"), nullable=False)
    community_category: Mapped[str] = mapped_column(String(50), nullable=False)  # OBC-NCL, SC, ST, PwD, EWS
    relaxation_years: Mapped[int] = mapped_column(Integer, nullable=False)  # 3, 5, 10
    max_age_relaxed: Mapped[int] = mapped_column(Integer, nullable=False)  # calculated 35, 37, 42
    applicable_conditions: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    age_criteria: Mapped["AgeCriteria"] = relationship("AgeCriteria", back_populates="relaxations")

class CommunityDomicileRule(UUIDModel):
    """Domicile and citizenship constraints."""
    __tablename__ = "community_domicile_rules"

    exam_id: Mapped[str] = mapped_column(String(36), ForeignKey("government_exams.id"), nullable=False)
    target_state: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)  # "Karnataka" for KPSC
    requires_domicile: Mapped[bool] = mapped_column(Boolean, default=False)
    allows_all_india_candidates: Mapped[bool] = mapped_column(Boolean, default=True)
    reservation_quota_rules: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    exam: Mapped["GovernmentExam"] = relationship("GovernmentExam", back_populates="domicile_rules")
