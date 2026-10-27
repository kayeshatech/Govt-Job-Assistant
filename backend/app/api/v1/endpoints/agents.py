from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.api.deps import get_db, get_current_user
from app.models.student import StudentProfile
from app.models.orchestration import AgentExecutionAudit
from app.services.orchestrator import AgentOrchestrator, AgentRequest, AgentResponse

router = APIRouter()

@router.post("/run", response_model=AgentResponse)
def execute_specialized_agent(
    req: AgentRequest,
    db: Session = Depends(get_db),
    current_user: Optional[StudentProfile] = Depends(get_current_user),
):
    """
    Execute one of the six specialized government career agents:
    1. CandidateProfileAgent
    2. GovernmentJobEligibilityAgent
    3. GovernmentExamRecommendationAgent
    4. ExamPreparationAgent
    5. NotificationAndApplicationAgent
    6. GovernmentCareerPlanningAgent

    Enforces step bounds, token budgets, and audit logging.
    """
    if current_user and not req.student_id:
        req.student_id = current_user.id

    orchestrator = AgentOrchestrator(db)
    return orchestrator.execute_agent(req)


@router.get("/audit")
def list_agent_audits(
    limit: int = Query(20, le=50),
    db: Session = Depends(get_db),
):
    """List recent agent execution audits tracking token usage and source citations."""
    logs = db.query(AgentExecutionAudit).order_by(desc(AgentExecutionAudit.created_at)).limit(limit).all()
    return {
        "success": True,
        "total": len(logs),
        "audits": [
            {
                "id": a.id,
                "session_id": a.session_id,
                "agent_name": a.agent_name,
                "input_summary": a.input_summary,
                "output_summary": a.output_summary,
                "tokens_used": a.tokens_used,
                "execution_time_ms": a.execution_time_ms,
                "supporting_sources": a.supporting_sources,
                "created_at": a.created_at.isoformat() if a.created_at else None,
            }
            for a in logs
        ],
    }
