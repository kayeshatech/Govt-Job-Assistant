from fastapi import APIRouter

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
)

api_router = APIRouter()

@api_router.get("/health", tags=["System Health"])
def health_check():
    return {
        "status": "online",
        "service": "Govexa Core API",
        "version": "3.0.0",
        "database": "Supabase PostgreSQL / SQLite fallback",
        "auth_provider": "Supabase Auth (JWT)",
        "watchdog_status": "active",
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
