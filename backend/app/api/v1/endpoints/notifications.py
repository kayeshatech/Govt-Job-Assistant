from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc

from app.api.deps import get_db
from app.models.notification import RecruitmentNotification, RecruitmentPost, NotificationVersion
from app.schemas.notification import (
    RecruitmentNotificationResponse,
    NotificationDetailResponse,
    RecruitmentPostSchema,
    NotificationVersionSchema,
)
from app.schemas.common import StandardApiResponse, PaginatedResponse, PaginationMetadata

router = APIRouter()

def serialize_notification_item(n: RecruitmentNotification) -> RecruitmentNotificationResponse:
    return RecruitmentNotificationResponse(
        id=n.id,
        advertisement_number=n.advertisement_number,
        title=n.title,
        agency_name=n.agency_name,
        category_name=n.category_name,
        release_date=n.release_date,
        application_deadline=n.application_deadline,
        tentative_exam_date=n.tentative_exam_date,
        total_vacancies=n.total_vacancies,
        official_pdf_url=n.official_pdf_url,
        official_portal=n.official_portal,
        status=n.status,
        highlights=n.highlights or [],
        eligibility_snippet=n.eligibility_snippet,
        fee_structure=n.fee_structure,
        is_verified_official=n.is_verified_official,
        verification_status=n.verification_status,
        source_portal_name=n.source_portal_name,
        tags=n.tags or [],
    )

def serialize_notification_detail(n: RecruitmentNotification) -> NotificationDetailResponse:
    base = serialize_notification_item(n)
    posts = [
        RecruitmentPostSchema(
            id=p.id,
            post_title=p.post_title,
            department=p.department,
            pay_level=p.pay_level,
            vacancies_breakdown=p.vacancies_breakdown or {},
            total_post_vacancies=p.total_post_vacancies,
        )
        for p in n.posts
    ]
    versions = [
        NotificationVersionSchema(
            version_number=v.version_number,
            corrigendum_number=v.corrigendum_number,
            change_summary=v.change_summary,
            diff_details=v.diff_details or {},
            effective_date=v.effective_date,
        )
        for v in n.versions
    ]
    return NotificationDetailResponse(
        **base.model_dump(),
        posts=posts,
        versions=versions,
        verified_by=n.verified_by,
    )

@router.get("", response_model=PaginatedResponse[RecruitmentNotificationResponse])
def list_notifications(
    status_filter: Optional[str] = Query(None, alias="status", description="Active / Corrigendum / Admit Card / Upcoming"),
    agency: Optional[str] = Query(None, description="Agency name filter"),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
):
    """Retrieve gazetted recruitment notifications feed with status filters and verification indicators."""
    query = db.query(RecruitmentNotification)

    if status_filter and status_filter.lower() != "all":
        query = query.filter(RecruitmentNotification.status.ilike(status_filter))

    if agency:
        query = query.filter(RecruitmentNotification.agency_name.ilike(f"%{agency}%"))

    query = query.order_by(desc(RecruitmentNotification.release_date))
    total = query.count()
    offset = (page - 1) * limit
    notifs = query.offset(offset).limit(limit).all()

    items = [serialize_notification_item(n) for n in notifs]
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

@router.get("/{id_or_advt}", response_model=StandardApiResponse[NotificationDetailResponse])
def get_notification_detail(
    id_or_advt: str,
    db: Session = Depends(get_db),
):
    """Retrieve full notification gazette record, corrigendum version history, and post vacancies."""
    notif = db.query(RecruitmentNotification).filter(
        or_(
            RecruitmentNotification.id == id_or_advt,
            RecruitmentNotification.advertisement_number == id_or_advt,
        )
    ).first()

    if not notif:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Recruitment notice '{id_or_advt}' was not found in the gazette repository.",
        )

    return StandardApiResponse(data=serialize_notification_detail(notif))
