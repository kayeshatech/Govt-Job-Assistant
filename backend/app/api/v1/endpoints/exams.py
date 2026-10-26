from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc

from app.api.deps import get_db
from app.models.exam import GovernmentExam, ExamAuthority, ExamCategory, ExamStage, SyllabusTopic, PayScale
from app.schemas.exam import (
    GovernmentExamListResponse,
    GovernmentExamDetailResponse,
    ExamStageSchema,
    PayScaleSchema,
    AgeLimitSchema,
    ExamComparisonResponse,
    SyllabusOverlapResponse,
)
from app.schemas.common import StandardApiResponse, PaginatedResponse, PaginationMetadata

router = APIRouter()

def serialize_exam_list_item(e: GovernmentExam) -> GovernmentExamListResponse:
    age_crit = e.age_criteria[0] if e.age_criteria else None
    min_age = age_crit.min_age if age_crit else 21
    max_gen = age_crit.max_age_general if age_crit else 32
    max_obc = max_gen + 3
    max_scst = max_gen + 5
    max_pwd = max_gen + 10

    pay = e.pay_scales[0] if e.pay_scales else None
    pay_lvl = pay.pay_level if pay else "Level 7"
    salary = pay.gross_approx_metro if pay else "₹75,000/month"

    return GovernmentExamListResponse(
        id=e.slug,  # use slug as public identifier
        slug=e.slug,
        title=e.title,
        code=e.code,
        level=e.level,
        category=e.category.name if e.category else "Civil Services",
        conducting_body=e.authority.name if e.authority else "Commission",
        posts=e.posts_summary,
        vacancies=e.vacancies_count,
        min_qualification=e.min_qualification_summary,
        eligible_streams=e.eligible_streams or [],
        age_limit=AgeLimitSchema(
            min=min_age,
            maxGeneral=max_gen,
            maxOBC=max_obc,
            maxSCST=max_scst,
            maxPwD=max_pwd,
        ),
        pay_level=pay_lvl,
        salary_gross=salary,
        application_fee="₹100 (Exemptions apply)",
        last_date_to_apply="2026-03-25",
        prelims_date="2026-05-24",
        status=e.status,
        official_website=e.official_website,
        ai_match_score=90,
    )

def serialize_exam_detail(e: GovernmentExam) -> GovernmentExamDetailResponse:
    base_item = serialize_exam_list_item(e)
    
    stages_schema = []
    syllabus_map: dict = {"prelims": [], "mainsGS": []}

    for stg in sorted(e.stages, key=lambda s: s.stage_order):
        stages_schema.append(
            ExamStageSchema(
                id=stg.id,
                stage_order=stg.stage_order,
                name=stg.name,
                stage_type=stg.stage_type,
                details=stg.details,
                total_marks=stg.total_marks,
                duration_minutes=stg.duration_minutes,
                is_qualifying_only=stg.is_qualifying_only,
            )
        )
        for top in stg.syllabus_topics:
            if stg.stage_order == 1:
                syllabus_map["prelims"].append(f"{top.subject_area}: {top.topic_name}")
            else:
                syllabus_map["mainsGS"].append(f"{top.subject_area}: {top.topic_name}")

    pay = e.pay_scales[0] if e.pay_scales else None
    pay_schema = None
    if pay:
        pay_schema = PayScaleSchema(
            post_name=pay.post_name,
            pay_level=pay.pay_level,
            basic_pay_min=pay.basic_pay_min,
            basic_pay_max=pay.basic_pay_max,
            gross_approx_metro=pay.gross_approx_metro,
            source_clause=pay.source_clause,
            official_source_url=pay.official_source_url,
        )

    return GovernmentExamDetailResponse(
        **base_item.model_dump(),
        negative_marking=e.negative_marking,
        duration=e.duration_info,
        relevance_for_tech=e.relevance_for_tech,
        attempts=e.attempts_info or {},
        stages=stages_schema,
        syllabus_overview=syllabus_map,
        pay_scale_details=pay_schema,
    )

@router.get("", response_model=PaginatedResponse[GovernmentExamListResponse])
def list_examinations(
    q: Optional[str] = Query(None, description="Search query by exam title, code, or posts"),
    category: Optional[str] = Query(None, description="Exam category code or name"),
    level: Optional[str] = Query(None, description="Central / State / PSU"),
    authority: Optional[str] = Query(None, description="Authority code (e.g. UPSC, SSC, KPSC)"),
    sort_by: Optional[str] = Query("relevance", description="relevance / vacancies / deadline"),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
):
    """List government examinations with multi-criteria filtering, search and pagination."""
    query = db.query(GovernmentExam).join(GovernmentExam.authority).join(GovernmentExam.category)

    if q:
        search_fmt = f"%{q.strip().lower()}%"
        query = query.filter(
            or_(
                GovernmentExam.title.ilike(search_fmt),
                GovernmentExam.code.ilike(search_fmt),
                GovernmentExam.posts_summary.ilike(search_fmt),
                ExamAuthority.name.ilike(search_fmt),
            )
        )

    if category and category.lower() != "all":
        query = query.filter(
            or_(
                ExamCategory.code.ilike(category),
                ExamCategory.name.ilike(category),
            )
        )

    if level and level.lower() != "all":
        query = query.filter(GovernmentExam.level.ilike(level))

    if authority and authority.lower() != "all":
        query = query.filter(ExamAuthority.code.ilike(authority))

    if sort_by == "vacancies":
        query = query.order_by(desc(GovernmentExam.vacancies_count))
    else:
        query = query.order_by(asc(GovernmentExam.title))

    total = query.count()
    offset = (page - 1) * limit
    exams = query.offset(offset).limit(limit).all()

    items = [serialize_exam_list_item(e) for e in exams]
    total_pages = (total + limit - 1) // limit if total > 0 else 1

    pagination = PaginationMetadata(
        page=page,
        limit=limit,
        total_records=total,
        total_pages=total_pages,
        has_next=page < total_pages,
        has_previous=page > 1,
    )

    return PaginatedResponse(items=items, pagination=pagination)

@router.get("/{id_or_slug}", response_model=StandardApiResponse[GovernmentExamDetailResponse])
def get_exam_detail(
    id_or_slug: str,
    db: Session = Depends(get_db),
):
    """Retrieve complete official specifications, syllabus breakdown and selection stages."""
    exam = db.query(GovernmentExam).filter(
        or_(GovernmentExam.slug == id_or_slug, GovernmentExam.code == id_or_slug)
    ).first()

    if not exam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Examination '{id_or_slug}' was not found in the gazetted database.",
        )

    return StandardApiResponse(data=serialize_exam_detail(exam))

@router.get("/{exam_code_1}/overlap/{exam_code_2}", response_model=StandardApiResponse[SyllabusOverlapResponse])
def analyze_syllabus_overlap(
    exam_code_1: str,
    exam_code_2: str,
    db: Session = Depends(get_db),
):
    """Analyzes syllabus topic overlap and shared subject areas between two examinations."""
    e1 = db.query(GovernmentExam).filter(or_(GovernmentExam.slug == exam_code_1, GovernmentExam.code == exam_code_1)).first()
    e2 = db.query(GovernmentExam).filter(or_(GovernmentExam.slug == exam_code_2, GovernmentExam.code == exam_code_2)).first()

    if not e1 or not e2:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="One or both examination codes could not be located.",
        )

    # Collect topics
    topics_1 = {t.topic_name for stg in e1.stages for t in stg.syllabus_topics}
    topics_2 = {t.topic_name for stg in e2.stages for t in stg.syllabus_topics}

    common = list(topics_1.intersection(topics_2))
    all_topics = topics_1.union(topics_2)
    similarity = round((len(common) / len(all_topics)) * 100, 1) if all_topics else 0.0

    # Subject areas
    subs_1 = {t.subject_area for stg in e1.stages for t in stg.syllabus_topics}
    subs_2 = {t.subject_area for stg in e2.stages for t in stg.syllabus_topics}
    shared_subs = list(subs_1.intersection(subs_2))

    data = SyllabusOverlapResponse(
        exam_code_1=e1.code,
        exam_code_2=e2.code,
        similarity_score=similarity,
        shared_subject_areas=shared_subs,
        common_syllabus_topics=common,
    )
    return StandardApiResponse(data=data, message="Syllabus overlap calculated successfully")
