from typing import Optional, List
from pydantic import BaseModel, ConfigDict

class SavedExamCreate(BaseModel):
    exam_id: str
    status: Optional[str] = "Draft / Planning"
    registration_number: Optional[str] = None
    roll_number: Optional[str] = None
    notes: Optional[str] = None

class SavedExamUpdate(BaseModel):
    status: Optional[str] = None
    registration_number: Optional[str] = None
    roll_number: Optional[str] = None
    notes: Optional[str] = None

class SavedExamResponse(BaseModel):
    id: str
    student_id: str
    exam_id: str
    exam_title: str
    conducting_body: str
    status: str
    registration_number: Optional[str] = None
    roll_number: Optional[str] = None
    application_date: Optional[str] = None
    exam_date: Optional[str] = None
    notes: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class StudentReminderCreate(BaseModel):
    title: str
    reminder_date: str
    exam_id: Optional[str] = None

class StudentReminderResponse(BaseModel):
    id: str
    title: str
    reminder_date: str
    is_completed: bool
    exam_id: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class DailyTaskResponse(BaseModel):
    id: str
    subject: str
    topic: str
    duration_minutes: int
    status: str
    priority: str

    model_config = ConfigDict(from_attributes=True)

class StudyPlanResponse(BaseModel):
    id: str
    exam_id: str
    exam_title: str
    target_year: int
    total_weeks: int
    current_week: int
    progress_percentage: int
    tasks: List[DailyTaskResponse] = []

    model_config = ConfigDict(from_attributes=True)
