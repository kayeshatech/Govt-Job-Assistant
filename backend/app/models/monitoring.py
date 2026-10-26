from typing import Optional, List, Dict, Any
from sqlalchemy import String, Integer, Float, Text, Boolean, ForeignKey, JSON, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import UUIDModel

class OfficialSource(UUIDModel):
    """
    Administrative Source Registry:
    Tracks permitted official government portals, gazette feeds, and crawling policies.
    """
    __tablename__ = "official_sources"

    authority_code: Mapped[str] = mapped_column(String(50), index=True, nullable=False)  # UPSC, SSC, ISRO-ICRB, KPSC
    authority_name: Mapped[str] = mapped_column(String(200), nullable=False)
    official_domain: Mapped[str] = mapped_column(String(200), nullable=False)  # upsc.gov.in
    listing_url: Mapped[str] = mapped_column(String(500), nullable=False)       # https://upsc.gov.in/examinations/active-examinations
    source_type: Mapped[str] = mapped_column(String(50), default="recruitment_listing")  # recruitment_listing, notice_board, pdf_archive, json_feed
    polling_frequency_minutes: Mapped[int] = mapped_column(Integer, default=60)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    fetch_method: Mapped[str] = mapped_column(String(50), default="GET_HTML")   # GET_HTML, JSON_API, PDF_FEED
    source_config: Mapped[Optional[dict]] = mapped_column(JSON, default=dict)   # CSS selectors, headers, link regex
    terms_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    rate_limit_delay_seconds: Mapped[float] = mapped_column(Float, default=2.0)
    last_crawled_at: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    last_success_at: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    last_failure_at: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    last_error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    last_content_hash: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)

    candidates: Mapped[List["ExtractionReviewItem"]] = relationship(
        "ExtractionReviewItem", back_populates="source", cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("ix_source_active_polling", "is_active", "polling_frequency_minutes"),
    )

class ExtractionReviewItem(UUIDModel):
    """
    Staging / Candidate Changes & Review Queue:
    Captures raw document hashes, extracted structured recruitment fields,
    detected diffs against previous versions, and human-in-the-loop approval state.
    """
    __tablename__ = "extraction_review_items"

    source_id: Mapped[str] = mapped_column(String(36), ForeignKey("official_sources.id"), nullable=False)
    source_url: Mapped[str] = mapped_column(String(500), nullable=False)
    content_hash: Mapped[str] = mapped_column(String(64), index=True, nullable=False)  # SHA-256
    document_title: Mapped[str] = mapped_column(String(300), nullable=False)
    document_type: Mapped[str] = mapped_column(String(50), default="PDF")  # PDF, HTML
    raw_text_excerpt: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    storage_path: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    parser_version: Mapped[str] = mapped_column(String(50), default="v3-hybrid")

    # Structured fields extracted by LLM / deterministic parser
    extracted_data: Mapped[Optional[dict]] = mapped_column(JSON, default=dict)
    confidence_score: Mapped[float] = mapped_column(Float, default=0.95)
    
    # Change detection metadata
    change_type: Mapped[str] = mapped_column(String(50), default="NEW_NOTICE")  # NEW_NOTICE, CORRIGENDUM, DEADLINE_EXTENSION, VACANCY_REVISION, NO_CHANGE
    previous_notification_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("recruitment_notifications.id"), nullable=True)
    diff_summary: Mapped[Optional[dict]] = mapped_column(JSON, default=dict)
    high_impact_flags: Mapped[Optional[dict]] = mapped_column(JSON, default=list)  # ["DEADLINE_CHANGED", "QUALIFICATION_CHANGED"]

    # Review & Lifecycle state
    status: Mapped[str] = mapped_column(String(50), default="PENDING_REVIEW")  # PENDING_REVIEW, AUTO_APPROVED, MANUALLY_APPROVED, REJECTED
    reviewed_by: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    reviewed_at: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    review_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    published_notification_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)

    source: Mapped["OfficialSource"] = relationship("OfficialSource", back_populates="candidates")

    __table_args__ = (
        Index("ix_candidate_status_impact", "status", "change_type"),
        Index("ix_candidate_source_hash", "source_id", "content_hash"),
    )
