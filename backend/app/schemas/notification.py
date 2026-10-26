from typing import Optional, List
from pydantic import BaseModel, ConfigDict

class RecruitmentPostSchema(BaseModel):
    id: str
    post_title: str
    department: Optional[str] = None
    pay_level: str
    vacancies_breakdown: dict = {}
    total_post_vacancies: int = 0

    model_config = ConfigDict(from_attributes=True)

class NotificationVersionSchema(BaseModel):
    version_number: int
    corrigendum_number: Optional[str] = None
    change_summary: str
    diff_details: dict = {}
    effective_date: str

    model_config = ConfigDict(from_attributes=True)

class RecruitmentNotificationResponse(BaseModel):
    id: str
    advertisement_number: str
    title: str
    agency_name: str
    category_name: str
    release_date: str
    application_deadline: str
    tentative_exam_date: Optional[str] = None
    total_vacancies: int
    official_pdf_url: Optional[str] = None
    official_portal: str
    status: str
    highlights: List[str] = []
    eligibility_snippet: str
    fee_structure: str
    is_verified_official: bool
    verification_status: str
    source_portal_name: str
    tags: List[str] = []

    model_config = ConfigDict(from_attributes=True)

class NotificationDetailResponse(RecruitmentNotificationResponse):
    posts: List[RecruitmentPostSchema] = []
    versions: List[NotificationVersionSchema] = []
    verified_by: Optional[str] = None

class NotificationReviewUpdate(BaseModel):
    verification_status: str  # "Verified", "Pending Review", "Flagged"
    notes: Optional[str] = None
