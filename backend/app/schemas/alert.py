from typing import Optional, List
from pydantic import BaseModel, ConfigDict

class StudentAlertResponse(BaseModel):
    id: str
    student_id: str
    alert_type: str
    title: str
    message: str
    reference_id: Optional[str] = None
    reference_type: Optional[str] = "exam"
    priority: str
    is_read: bool
    is_dismissed: bool
    email_dispatched: bool
    email_dispatched_at: Optional[str] = None
    created_at: str

    model_config = ConfigDict(from_attributes=True)

class AlertPreferenceUpdate(BaseModel):
    alert_new_exams: Optional[bool] = None
    alert_deadline_reminders: Optional[bool] = None
    alert_exam_updates: Optional[bool] = None
    alert_corrigendum: Optional[bool] = None
    email_notification_opt_in: Optional[bool] = None

class AlertPreferenceResponse(BaseModel):
    alert_new_exams: bool
    alert_deadline_reminders: bool
    alert_exam_updates: bool
    alert_corrigendum: bool
    email_notification_opt_in: bool

    model_config = ConfigDict(from_attributes=True)

class MarkAlertReadRequest(BaseModel):
    alert_ids: Optional[List[str]] = None
    mark_all: bool = False
