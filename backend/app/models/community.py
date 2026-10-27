import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Text,
    Integer,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    JSON,
    Index,
)
from sqlalchemy.orm import relationship

from app.core.database import Base

class StudyGroup(Base):
    """
    Peer collaboration and competitive exam study circles (Feature 88).
    Groups organized by target examination and syllabus streams.
    """
    __tablename__ = "study_groups"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(200), nullable=False)
    exam_code = Column(String(50), nullable=False, index=True)
    description = Column(Text, nullable=False)
    category = Column(String(100), default="General Studies")
    member_count = Column(Integer, default=1)
    is_active = Column(Boolean, default=True)
    created_by = Column(String(36), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    messages = relationship("GroupDiscussionMessage", back_populates="group", cascade="all, delete-orphan")


class GroupDiscussionMessage(Base):
    """
    Real-time topic doubts and discussion threads within a study group (Feature 88).
    Supports verified answers by certified faculty/mentors (Feature 89).
    """
    __tablename__ = "group_discussion_messages"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    group_id = Column(String(36), ForeignKey("study_groups.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), nullable=False, index=True)
    author_name = Column(String(150), nullable=False)
    content = Column(Text, nullable=False)
    is_verified_mentor_answer = Column(Boolean, default=False)
    likes_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)

    group = relationship("StudyGroup", back_populates="messages")


class MentorProfile(Base):
    """
    Faculty and mentor verification profile (Feature 89).
    Enables educator answer verification and cohort tracking.
    """
    __tablename__ = "mentor_profiles"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), nullable=False, unique=True, index=True)
    full_name = Column(String(150), nullable=False)
    designation = Column(String(150), nullable=False)
    specialization = Column(String(200), nullable=False)
    institution = Column(String(200), nullable=False)
    is_verified = Column(Boolean, default=True)
    total_answers_resolved = Column(Integer, default=0)
    rating = Column(Float, default=4.9)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
