from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.api.deps import get_db, get_current_user
from app.core.security import AuthenticatedUser
from app.models.student import SavedExam, StudentProfile
from app.models.exam import GovernmentExam
from app.schemas.student import SavedExamCreate, SavedExamUpdate, SavedExamResponse
from app.schemas.common import StandardApiResponse

router = APIRouter()

@router.get("", response_model=StandardApiResponse[List[SavedExamResponse]])
def get_student_saved_exams(
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """Retrieve all saved exams and application records strictly for the current authenticated student."""
    saved_list = db.query(SavedExam).filter(SavedExam.student_id == current_user.id).all()
    return StandardApiResponse(data=saved_list, message="Saved examinations retrieved")

@router.post("", response_model=StandardApiResponse[SavedExamResponse], status_code=status.HTTP_201_CREATED)
def save_exam(
    data: SavedExamCreate,
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """Save an examination to the authenticated student's application tracking workspace."""
    # Ensure profile row exists
    profile = db.query(StudentProfile).filter(StudentProfile.id == current_user.id).first()
    if not profile:
        profile = StudentProfile(id=current_user.id, email=current_user.email, full_name=current_user.email.split("@")[0].capitalize())
        db.add(profile)
        db.flush()

    # Find exam by ID, slug, or code
    exam = db.query(GovernmentExam).filter(
        or_(
            GovernmentExam.id == data.exam_id,
            GovernmentExam.slug == data.exam_id,
            GovernmentExam.code.ilike(data.exam_id),
            GovernmentExam.slug.ilike(f"{data.exam_id}%"),
        )
    ).first()

    if not exam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Examination '{data.exam_id}' does not exist.",
        )

    # Check if already saved
    existing = db.query(SavedExam).filter(
        SavedExam.student_id == current_user.id,
        SavedExam.exam_id == exam.id,
    ).first()

    if existing:
        existing.status = data.status or existing.status
        existing.notes = data.notes if data.notes is not None else existing.notes
        db.commit()
        db.refresh(existing)
        return StandardApiResponse(data=existing, message="Application record updated")

    saved = SavedExam(
        student_id=current_user.id,
        exam_id=exam.id,
        exam_title=exam.title,
        conducting_body=exam.authority.name if exam.authority else "Commission",
        status=data.status or "Draft / Planning",
        registration_number=data.registration_number,
        roll_number=data.roll_number,
        notes=data.notes,
    )
    db.add(saved)
    db.commit()
    db.refresh(saved)

    return StandardApiResponse(data=saved, message="Examination saved to application tracker")

@router.put("/{id_or_exam_id}", response_model=StandardApiResponse[SavedExamResponse])
def update_saved_exam(
    id_or_exam_id: str,
    update_data: SavedExamUpdate,
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """Update application tracking stage, roll number, or notes. Enforces student row ownership."""
    record = db.query(SavedExam).filter(
        or_(SavedExam.id == id_or_exam_id, SavedExam.exam_id == id_or_exam_id)
    ).first()

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application tracking record not found.",
        )

    # Authorization Check: Verify student owns this record
    if record.student_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You do not have permission to modify another student's application records.",
        )

    if update_data.status is not None:
        record.status = update_data.status
    if update_data.registration_number is not None:
        record.registration_number = update_data.registration_number
    if update_data.roll_number is not None:
        record.roll_number = update_data.roll_number
    if update_data.notes is not None:
        record.notes = update_data.notes

    db.commit()
    db.refresh(record)
    return StandardApiResponse(data=record, message="Application status updated")

@router.delete("/{id_or_exam_id}", response_model=StandardApiResponse[bool])
def remove_saved_exam(
    id_or_exam_id: str,
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """Remove an examination from the student's tracker. Enforces student row ownership."""
    record = db.query(SavedExam).filter(
        or_(SavedExam.id == id_or_exam_id, SavedExam.exam_id == id_or_exam_id)
    ).first()

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application tracking record not found.",
        )

    # Authorization Check: Verify student owns this record
    if record.student_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You do not have permission to delete another student's application records.",
        )

    db.delete(record)
    db.commit()
    return StandardApiResponse(data=True, message="Application removed from tracking board")
