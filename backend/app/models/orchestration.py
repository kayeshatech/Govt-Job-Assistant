from typing import Optional, List, Dict, Any
from sqlalchemy import String, Integer, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import UUIDModel

class AgentExecutionAudit(UUIDModel):
    """
    Audit log of specialized agent executions tracking inputs, outputs, token usage,
    and supporting official source citations.
    """
    __tablename__ = "agent_execution_audits"

    student_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True, index=True)
    session_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    agent_name: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    # Valid agents: CandidateProfileAgent, GovernmentJobEligibilityAgent, GovernmentExamRecommendationAgent,
    #               ExamPreparationAgent, NotificationAndApplicationAgent, GovernmentCareerPlanningAgent
    input_summary: Mapped[str] = mapped_column(Text, nullable=False)
    output_summary: Mapped[str] = mapped_column(Text, nullable=False)
    tokens_used: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    execution_time_ms: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    supporting_sources: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    step_number: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
