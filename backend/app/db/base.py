# Import all models here so Alembic can discover them for migrations
from app.core.database import Base
from app.models.base import TimestampMixin, UUIDModel
from app.models.exam import (
    ExamAuthority,
    ExamCategory,
    GovernmentExam,
    ExamStage,
    SyllabusTopic,
    PayScale,
)
from app.models.eligibility import (
    QualificationRule,
    AgeCriteria,
    AgeRelaxationRule,
    CommunityDomicileRule,
)
from app.models.notification import (
    RecruitmentNotification,
    RecruitmentPost,
    NotificationVersion,
    NotificationSource,
)
from app.models.student import (
    StudentProfile,
    StudentPreference,
    SavedExam,
    StudentReminder,
    StudyPlan,
    DailyStudyTask,
)
from app.models.audit import AuditLog
from app.models.monitoring import OfficialSource, ExtractionReviewItem
from app.models.alert import StudentAlert

__all__ = [
    "Base",
    "ExamAuthority",
    "ExamCategory",
    "GovernmentExam",
    "ExamStage",
    "SyllabusTopic",
    "PayScale",
    "QualificationRule",
    "AgeCriteria",
    "AgeRelaxationRule",
    "CommunityDomicileRule",
    "RecruitmentNotification",
    "RecruitmentPost",
    "NotificationVersion",
    "NotificationSource",
    "StudentProfile",
    "StudentPreference",
    "SavedExam",
    "StudentReminder",
    "StudyPlan",
    "DailyStudyTask",
    "AuditLog",
    "OfficialSource",
    "ExtractionReviewItem",
    "StudentAlert",
]
