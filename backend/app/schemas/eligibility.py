from enum import Enum
from typing import List, Optional
from pydantic import BaseModel

class EligibilityStatusEnum(str, Enum):
    MEETS_CRITERIA = "Meets the checked criteria"
    DOES_NOT_MEET = "Does not meet the checked criteria"
    INSUFFICIENT_DATA = "Cannot determine because information or authoritative rules are missing"

class CandidateEligibilityInput(BaseModel):
    age: Optional[int] = None
    date_of_birth: Optional[str] = None  # YYYY-MM-DD
    category: str = "General / UR"  # General / UR, OBC-NCL, SC, ST, EWS, PwD
    qualification: str = "Bachelor of Engineering / B.Tech"
    percentage: float = 60.0
    major_stream: str = "Computer Science & Engineering"
    domicile_state: str = "Karnataka"
    is_pwd: bool = False
    experience_years: Optional[int] = 0

class CriterionCheckDetail(BaseModel):
    criterion_name: str
    required_condition: str
    candidate_value: str
    passed: Optional[bool]  # True = passed, False = failed, None = indeterminate
    status: EligibilityStatusEnum
    reason: str
    official_rule_citation: str

class ExamEligibilityResult(BaseModel):
    exam_id: str
    exam_code: str
    exam_title: str
    conducting_body: str
    overall_status: EligibilityStatusEnum
    is_eligible: bool
    eligibility_score_percentage: int
    checks: List[CriterionCheckDetail]
    age_relaxation_applied: str
    official_source_url: str
    notification_version: str
    recommendation: str

class BatchEligibilityResponse(BaseModel):
    candidate_summary: CandidateEligibilityInput
    total_exams_evaluated: int
    eligible_exams_count: int
    results: List[ExamEligibilityResult]
