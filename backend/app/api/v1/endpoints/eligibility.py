from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.api.deps import get_db
from app.models.exam import GovernmentExam
from app.schemas.eligibility import (
    CandidateEligibilityInput,
    ExamEligibilityResult,
    BatchEligibilityResponse,
)
from app.schemas.common import StandardApiResponse
from app.services.eligibility_engine import DeterministicEligibilityEngine

router = APIRouter()

@router.post("/check", response_model=StandardApiResponse[BatchEligibilityResponse])
def screen_all_examinations(
    candidate: CandidateEligibilityInput,
    db: Session = Depends(get_db),
):
    """
    Evaluates candidate parameters against all active government examinations in the database.
    Applies strict statutory rules: age boundary, community relaxations, degree, percentage, and domicile.
    """
    exams = db.query(GovernmentExam).all()
    results: List[ExamEligibilityResult] = []

    for exam in exams:
        res = DeterministicEligibilityEngine.evaluate_exam(exam, candidate, db)
        results.append(res)

    # Sort results: fully eligible first, then by score
    results.sort(key=lambda r: (r.is_eligible, r.eligibility_score_percentage), reverse=True)
    eligible_count = sum(1 for r in results if r.is_eligible)

    batch_resp = BatchEligibilityResponse(
        candidate_summary=candidate,
        total_exams_evaluated=len(results),
        eligible_exams_count=eligible_count,
        results=results,
    )

    return StandardApiResponse(
        data=batch_resp,
        message=f"Screened {len(results)} exams: {eligible_count} meet all statutory requirements.",
    )

@router.post("/check/{id_or_slug}", response_model=StandardApiResponse[ExamEligibilityResult])
def screen_single_examination(
    id_or_slug: str,
    candidate: CandidateEligibilityInput,
    db: Session = Depends(get_db),
):
    """Evaluates candidate parameters against a single specified government examination."""
    exam = db.query(GovernmentExam).filter(
        or_(GovernmentExam.slug == id_or_slug, GovernmentExam.code == id_or_slug)
    ).first()

    if not exam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Examination '{id_or_slug}' was not found in the eligibility rule database.",
        )

    result = DeterministicEligibilityEngine.evaluate_exam(exam, candidate, db)
    return StandardApiResponse(data=result, message="Eligibility evaluation completed")
