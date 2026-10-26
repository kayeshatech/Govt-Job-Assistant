from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict, Field

class ExtractedRecruitmentData(BaseModel):
    """
    Structured recruitment data extracted from official gazettes & PDFs.
    Keeps factual verified fields separate from model-generated summaries.
    """
    authority_name: str = Field(description="Name of the issuing commission (e.g. UPSC, SSC, ISRO)")
    advertisement_number: str = Field(description="Official gazette or notice number")
    examination_name: str = Field(description="Full official title of the examination")
    posts: List[str] = Field(default_factory=list, description="Cadres / posts announced")
    total_vacancies: Optional[int] = Field(default=None, description="Total vacancy count across all posts")
    vacancies_breakdown: Dict[str, int] = Field(default_factory=dict, description="Community reservation quotas")

    # Educational Qualifications & Streams
    minimum_education_level: Optional[str] = Field(default=None, description="Prescribed degree level")
    eligible_disciplines_or_streams: List[str] = Field(default_factory=list, description="Whitelisted engineering or academic streams")
    minimum_percentage_required: Optional[float] = Field(default=None, description="Minimum aggregate cut-off marks")
    qualification_excerpt: Optional[str] = Field(default=None, description="Exact verbatim citation from gazette")

    # Age Limits & Statutory Relaxations
    minimum_age: Optional[int] = Field(default=None, description="Minimum prescribed age")
    maximum_age_general: Optional[int] = Field(default=None, description="Unreserved general upper age limit")
    age_cutoff_date: Optional[str] = Field(default=None, description="Reference date for calculating age (YYYY-MM-DD)")
    age_relaxations: Dict[str, int] = Field(default_factory=dict, description="Category-wise relaxations in years (OBC: 3, SC/ST: 5, PwD: 10)")
    age_clause_excerpt: Optional[str] = Field(default=None, description="Verbatim citation of age relaxation rules")

    # Key Dates & Deadlines
    application_opening_date: Optional[str] = Field(default=None, description="Start date of online registrations (YYYY-MM-DD)")
    application_closing_date: Optional[str] = Field(default=None, description="Final closing date and time (YYYY-MM-DD)")
    preliminary_exam_date: Optional[str] = Field(default=None, description="Tentative or confirmed preliminary exam date (YYYY-MM-DD)")
    mains_exam_date: Optional[str] = Field(default=None, description="Mains or written test date if specified (YYYY-MM-DD)")

    # Financial & Selection Process
    application_fee_details: Optional[str] = Field(default=None, description="Fee structure including exemptions for SC/ST/Female/PwD")
    salary_or_pay_level: Optional[str] = Field(default=None, description="7th CPC Pay Matrix Level or basic pay scale")
    selection_stages: List[str] = Field(default_factory=list, description="Ordered stages: Preliminary MCQ, Mains, Interview")
    syllabus_summary: List[str] = Field(default_factory=list, description="Core subjects and question patterns")

    # Source & Corrigendum References
    official_application_url: Optional[str] = Field(default=None, description="Direct URL to apply online on commission portal")
    is_corrigendum: bool = Field(default=False, description="True if this document is a corrigendum / amendment notice")
    corrigendum_references: Optional[str] = Field(default=None, description="Reference to earlier notification superseded or amended")

    # Safety & Parsing Confidence
    confidence_score: float = Field(default=0.95, ge=0.0, le=1.0)
    unresolved_or_unknown_fields: List[str] = Field(default_factory=list, description="Fields that could not be authoritatively verified")

    model_config = ConfigDict(from_attributes=True)

class OfficialSourceCreate(BaseModel):
    authority_code: str
    authority_name: str
    official_domain: str
    listing_url: str
    source_type: str = "recruitment_listing"
    polling_frequency_minutes: int = 60
    is_active: bool = True
    fetch_method: str = "GET_HTML"
    source_config: Dict[str, Any] = {}
    terms_url: Optional[str] = None
    rate_limit_delay_seconds: float = 2.0

class OfficialSourceUpdate(BaseModel):
    authority_name: Optional[str] = None
    listing_url: Optional[str] = None
    polling_frequency_minutes: Optional[int] = None
    is_active: Optional[bool] = None
    fetch_method: Optional[str] = None
    source_config: Optional[Dict[str, Any]] = None
    rate_limit_delay_seconds: Optional[float] = None

class OfficialSourceResponse(BaseModel):
    id: str
    authority_code: str
    authority_name: str
    official_domain: str
    listing_url: str
    source_type: str
    polling_frequency_minutes: int
    is_active: bool
    fetch_method: str
    source_config: Dict[str, Any] = {}
    terms_url: Optional[str] = None
    rate_limit_delay_seconds: float
    last_crawled_at: Optional[str] = None
    last_success_at: Optional[str] = None
    last_failure_at: Optional[str] = None
    last_error_message: Optional[str] = None
    last_content_hash: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class ExtractionReviewItemResponse(BaseModel):
    id: str
    source_id: str
    source_url: str
    content_hash: str
    document_title: str
    document_type: str
    storage_path: Optional[str] = None
    parser_version: str
    extracted_data: Dict[str, Any] = {}
    confidence_score: float
    change_type: str
    previous_notification_id: Optional[str] = None
    diff_summary: Dict[str, Any] = {}
    high_impact_flags: List[str] = []
    status: str
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[str] = None
    review_notes: Optional[str] = None
    published_notification_id: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class CandidateApprovalRequest(BaseModel):
    approval_notes: Optional[str] = "Approved after manual gazette cross-verification"
    auto_publish_exam: bool = True
    override_fields: Optional[Dict[str, Any]] = None

class CandidateRejectionRequest(BaseModel):
    rejection_reason: str

class CrawlExecutionReport(BaseModel):
    source_id: str
    authority_code: str
    items_discovered: int
    new_candidates_created: int
    corrigenda_detected: int
    auto_approved_count: int
    pending_review_count: int
    errors_encountered: List[str] = []
