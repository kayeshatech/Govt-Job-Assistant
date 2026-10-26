from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_admin, get_current_user
from app.core.security import AuthenticatedUser
from app.models.monitoring import OfficialSource
from app.schemas.monitoring import (
    OfficialSourceCreate,
    OfficialSourceUpdate,
    OfficialSourceResponse,
    CrawlExecutionReport,
)
from app.schemas.common import StandardApiResponse
from app.services.scraper_service import scraper_service

router = APIRouter()

@router.get("", response_model=StandardApiResponse[List[OfficialSourceResponse]])
def list_official_sources(
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """List monitored official recruitment authorities and gazette portals."""
    query = db.query(OfficialSource)
    if is_active is not None:
        query = query.filter(OfficialSource.is_active == is_active)
    sources = query.order_by(OfficialSource.authority_code).all()
    return StandardApiResponse(data=sources, message="Official sources retrieved")

@router.post("", response_model=StandardApiResponse[OfficialSourceResponse], status_code=status.HTTP_201_CREATED)
def create_official_source(
    payload: OfficialSourceCreate,
    db: Session = Depends(get_db),
    current_admin: AuthenticatedUser = Depends(get_current_admin),
):
    """Register a new official recruitment authority for monitoring (Administrative authorization required)."""
    existing = db.query(OfficialSource).filter(
        OfficialSource.authority_code == payload.authority_code,
        OfficialSource.listing_url == payload.listing_url,
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Source with code '{payload.authority_code}' and URL '{payload.listing_url}' already registered.",
        )

    source = OfficialSource(**payload.model_dump())
    db.add(source)
    db.commit()
    db.refresh(source)
    return StandardApiResponse(data=source, message="Official source registered for automated watchdog")

@router.put("/{source_id}", response_model=StandardApiResponse[OfficialSourceResponse])
def update_official_source(
    source_id: str,
    payload: OfficialSourceUpdate,
    db: Session = Depends(get_db),
    current_admin: AuthenticatedUser = Depends(get_current_admin),
):
    """Update source configuration, polling interval, or active state (Admin only)."""
    source = db.query(OfficialSource).filter(OfficialSource.id == source_id).first()
    if not source:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Official source not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(source, field, val)

    db.commit()
    db.refresh(source)
    return StandardApiResponse(data=source, message="Official source configuration updated")

@router.post("/{source_id}/crawl", response_model=StandardApiResponse[CrawlExecutionReport])
def trigger_immediate_crawl(
    source_id: str,
    db: Session = Depends(get_db),
    current_admin: AuthenticatedUser = Depends(get_current_admin),
):
    """Manually trigger immediate crawling and verification for an official source (Admin only)."""
    source = db.query(OfficialSource).filter(OfficialSource.id == source_id).first()
    if not source:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Official source not found")

    report = scraper_service.crawl_source(db, source)
    return StandardApiResponse(data=report, message=f"Watchdog crawl execution completed for {source.authority_code}")
