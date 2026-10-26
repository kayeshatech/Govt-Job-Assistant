from typing import Optional
from sqlalchemy import String, Text, JSON, Index
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import UUIDModel

class AuditLog(UUIDModel):
    """Audit trail for administrative recruitment edits, verification changes, and security actions."""
    __tablename__ = "audit_logs"

    user_id: Mapped[Optional[str]] = mapped_column(String(36), index=True, nullable=True)
    user_email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    action: Mapped[str] = mapped_column(String(100), index=True, nullable=False)  # CREATE / UPDATE / VERIFY / FLAG / DELETE
    entity_type: Mapped[str] = mapped_column(String(100), index=True, nullable=False)  # GovernmentExam / RecruitmentNotification
    entity_id: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    changes_diff: Mapped[Optional[dict]] = mapped_column(JSON, default=dict)
    ip_address: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    __table_args__ = (
        Index("ix_audit_logs_entity_action", "entity_type", "action"),
    )
