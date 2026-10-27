from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class StudyGroupCreate(BaseModel):
    name: str = Field(..., min_length=3, max_length=200)
    exam_code: str = Field(..., max_length=50)
    description: str = Field(..., min_length=10)
    category: str = "General Studies"

class MessageCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=2000)

class MessageResponse(BaseModel):
    id: str
    group_id: str
    user_id: str
    author_name: str
    content: str
    is_verified_mentor_answer: bool
    likes_count: int
    created_at: datetime

    class Config:
        from_attributes = True

class StudyGroupResponse(BaseModel):
    id: str
    name: str
    exam_code: str
    description: str
    category: str
    member_count: int
    is_active: bool
    created_by: str
    created_at: datetime
    recent_messages: Optional[List[MessageResponse]] = []

    class Config:
        from_attributes = True

class MentorProfileCreate(BaseModel):
    full_name: str
    designation: str
    specialization: str
    institution: str

class MentorProfileResponse(BaseModel):
    id: str
    user_id: str
    full_name: str
    designation: str
    specialization: str
    institution: str
    is_verified: bool
    total_answers_resolved: int
    rating: float

    class Config:
        from_attributes = True

class MentorDashboardResponse(BaseModel):
    mentor_profile: MentorProfileResponse
    assigned_study_groups: List[StudyGroupResponse]
    unresolved_questions_count: int
    recent_student_queries: List[MessageResponse]
