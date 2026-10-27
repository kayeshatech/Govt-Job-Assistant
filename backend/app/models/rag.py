import uuid
from typing import Optional, List, Dict, Any
from sqlalchemy import String, Integer, Float, Boolean, Text, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import UUIDModel

class DocumentKnowledgeBase(UUIDModel):
    """
    Registry of verified official gazettes, syllabuses, PYQs, and study documents for RAG.
    """
    __tablename__ = "document_knowledge_bases"

    title: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    doc_type: Mapped[str] = mapped_column(String(64), nullable=False, index=True) # OFFICIAL_NOTIFICATION, OFFICIAL_SYLLABUS, PREVIOUS_YEAR_PAPER, STUDY_NOTE, USER_UPLOAD
    authority_code: Mapped[Optional[str]] = mapped_column(String(32), nullable=True, index=True)
    exam_code: Mapped[Optional[str]] = mapped_column(String(64), nullable=True, index=True)
    version_label: Mapped[str] = mapped_column(String(64), default="1.0", nullable=False)
    file_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    storage_path: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    total_pages: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    content_hash: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    is_verified_source: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    source_reference: Mapped[str] = mapped_column(String(255), nullable=False)

    # Relationships
    chunks: Mapped[List["DocumentChunk"]] = relationship(
        "DocumentChunk",
        back_populates="document",
        cascade="all, delete-orphan",
        order_by="DocumentChunk.chunk_index",
    )


class DocumentChunk(UUIDModel):
    """
    Individual searchable passage chunk derived from an official document.
    Preserves exact provenance (source, page, section heading).
    """
    __tablename__ = "document_chunks"

    document_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("document_knowledge_bases.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    chunk_index: Mapped[int] = mapped_column(Integer, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    page_number: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    section_heading: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    token_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    chunk_metadata: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)

    # Relationships
    document: Mapped["DocumentKnowledgeBase"] = relationship(
        "DocumentKnowledgeBase",
        back_populates="chunks",
    )
