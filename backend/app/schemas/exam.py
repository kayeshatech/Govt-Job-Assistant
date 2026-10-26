from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict

class ExamStageSchema(BaseModel):
    id: str
    stage_order: int
    name: str
    stage_type: str
    details: str
    total_marks: Optional[int] = None
    duration_minutes: Optional[int] = None
    is_qualifying_only: bool = False

    model_config = ConfigDict(from_attributes=True)

class SyllabusTopicSchema(BaseModel):
    id: str
    subject_area: str
    topic_name: str
    topic_details: Optional[str] = None
    is_core_overlap: bool = False
    overlap_keywords: List[str] = []

    model_config = ConfigDict(from_attributes=True)

class PayScaleSchema(BaseModel):
    post_name: str
    pay_level: str
    basic_pay_min: int
    basic_pay_max: int
    gross_approx_metro: str
    source_clause: str
    official_source_url: str

    model_config = ConfigDict(from_attributes=True)

class AgeLimitSchema(BaseModel):
    min: int
    maxGeneral: int
    maxOBC: int
    maxSCST: int
    maxPwD: int

class GovernmentExamListResponse(BaseModel):
    id: str
    slug: str
    title: str
    code: str
    level: str
    category: str
    conducting_body: str
    posts: str
    vacancies: int
    min_qualification: str
    eligible_streams: List[str] = []
    age_limit: AgeLimitSchema
    pay_level: str
    salary_gross: str
    application_fee: str = "₹100"
    last_date_to_apply: str
    prelims_date: str
    status: str
    official_website: str
    ai_match_score: Optional[int] = 88

    model_config = ConfigDict(from_attributes=True)

class GovernmentExamDetailResponse(GovernmentExamListResponse):
    negative_marking: str
    duration: str
    relevance_for_tech: Optional[str] = None
    attempts: Dict[str, Any] = {}
    stages: List[ExamStageSchema] = []
    syllabus_overview: Dict[str, List[str]] = {}
    pay_scale_details: Optional[PayScaleSchema] = None

class ExamFilterParams(BaseModel):
    q: Optional[str] = None
    category: Optional[str] = None
    level: Optional[str] = None
    authority: Optional[str] = None
    stream: Optional[str] = None
    page: int = 1
    limit: int = 10
    sort_by: Optional[str] = "relevance"  # relevance / deadline / vacancies / salary

class ExamComparisonResponse(BaseModel):
    exam_1: GovernmentExamDetailResponse
    exam_2: GovernmentExamDetailResponse
    overlap_percentage: float
    common_topics: List[str]
    distinct_topics_exam_1: List[str]
    distinct_topics_exam_2: List[str]
    strategic_advice: str

class SyllabusOverlapResponse(BaseModel):
    exam_code_1: str
    exam_code_2: str
    similarity_score: float
    shared_subject_areas: List[str]
    common_syllabus_topics: List[str]
