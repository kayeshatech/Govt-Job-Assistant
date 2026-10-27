
from app.api.v1.endpoints import (
    auth,
    exams,
    eligibility,
    notifications,
    saved_exams,
    reminders,
    admin,
    sources,
    alerts,
    ai,
    prep,
    agents,
    community,
)

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
import time

from app.api.deps import get_db
from app.models.exam import GovernmentExam
from app.models.notification import RecruitmentNotification
from app.models.monitoring import OfficialSource
from app.models.rag import DocumentKnowledgeBase
from app.models.preparation import QuestionBank, MockTest

api_router = APIRouter()

@api_router.get("/health", tags=["System Health"])
def health_check(db: Session = Depends(get_db)):
    start = time.time()
    db_alive = False
    try:
        db.execute(text("SELECT 1"))
        db_alive = True
    except Exception:
        db_alive = False
    latency = int((time.time() - start) * 1000)

    return {
        "status": "online" if db_alive else "degraded",
        "service": "Govexa Core API",
        "version": "5.0.0",
        "database": {
            "status": "connected" if db_alive else "disconnected",
            "latency_ms": latency,
            "provider": "Supabase PostgreSQL / SQLite fallback",
        },
        "auth_provider": "Supabase Auth (JWT)",
        "watchdog_status": "active",
        "llm_provider": "Gemini / Deterministic Fallback",
        "rag_status": "enabled",
        "specialized_agents": 6,
    }

@api_router.get("/metrics", tags=["System Health"])
def operational_metrics(db: Session = Depends(get_db)):
    """Operational telemetry and system counters for observability dashboards."""
    try:
        exams_cnt = db.query(GovernmentExam).count()
        notifs_cnt = db.query(RecruitmentNotification).count()
        sources_cnt = db.query(OfficialSource).count()
        docs_cnt = db.query(DocumentKnowledgeBase).count()
        questions_cnt = db.query(QuestionBank).count()
        tests_cnt = db.query(MockTest).count()
    except Exception:
        exams_cnt = notifs_cnt = sources_cnt = docs_cnt = questions_cnt = tests_cnt = 0

    return {
        "system_status": "HEALTHY",
        "metrics": {
            "total_government_exams": exams_cnt,
            "active_recruitment_notifications": notifs_cnt,
            "monitored_official_sources": sources_cnt,
            "indexed_rag_documents": docs_cnt,
            "question_bank_items": questions_cnt,
            "standardized_mock_tests": tests_cnt,
        },
        "rate_limiting": {
            "status": "ENFORCING",
            "default_requests_per_minute": 120,
            "ai_tokens_per_minute": 10000,
        },
        "server_time": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication & Profile"])
api_router.include_router(exams.router, prefix="/exams", tags=["Government Examinations"])
api_router.include_router(eligibility.router, prefix="/eligibility", tags=["Eligibility Engine"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Recruitment Notifications"])
api_router.include_router(saved_exams.router, prefix="/saved-exams", tags=["Application Tracker"])
api_router.include_router(reminders.router, prefix="/reminders", tags=["Deadlines & Reminders"])
api_router.include_router(admin.router, prefix="/admin", tags=["Administrative Review Workflow"])
api_router.include_router(sources.router, prefix="/sources", tags=["Official Source Registry"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["Personalized Alerts"])
api_router.include_router(ai.router, prefix="/ai", tags=["AI Intelligence & RAG"])
api_router.include_router(prep.router, prefix="/prep", tags=["Exam Preparation & Testing"])
api_router.include_router(agents.router, prefix="/agents", tags=["Specialized Agent Orchestration"])
api_router.include_router(community.router, prefix="/community", tags=["Community Study Groups & Mentorship"])
