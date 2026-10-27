from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user, get_or_create_student_profile
from app.core.security import AuthenticatedUser
from app.models.student import StudentProfile, StudentPreference
from app.schemas.auth import (
    StudentProfileResponse,
    StudentProfileUpdate,
    AuthSessionResponse,
)
from app.schemas.common import StandardApiResponse

router = APIRouter()

@router.get("/me", response_model=StandardApiResponse[StudentProfileResponse])
def get_current_profile(
    profile: StudentProfile = Depends(get_or_create_student_profile),
):
    """Retrieve verified profile of the authenticated student."""
    target_cats = profile.preferences.target_categories if profile.preferences else []
    target_codes = profile.preferences.target_exam_codes if profile.preferences else []

    response_data = StudentProfileResponse(
        id=profile.id,
        email=profile.email,
        full_name=profile.full_name,
        date_of_birth=profile.date_of_birth,
        age=profile.age,
        gender=profile.gender,
        category=profile.category,
        domicile_state=profile.domicile_state,
        is_pwd=profile.is_pwd,
        pwd_percentage=profile.pwd_percentage,
        education_level=profile.education_level,
        major_stream=profile.major_stream,
        graduation_year=profile.graduation_year,
        graduation_percentage=profile.graduation_percentage,
        preferred_daily_study_hours=profile.preferred_daily_study_hours,
        is_onboarded=profile.is_onboarded,
        role=profile.role,
        target_categories=target_cats,
        target_exam_codes=target_codes,
    )
    return StandardApiResponse(data=response_data, message="Student profile loaded successfully")

@router.put("/profile", response_model=StandardApiResponse[StudentProfileResponse])
def update_profile(
    update_data: StudentProfileUpdate,
    db: Session = Depends(get_db),
    profile: StudentProfile = Depends(get_or_create_student_profile),
):
    """Update profile parameters and target exam preferences."""
    update_dict = update_data.model_dump(exclude_unset=True)

    # Separate target preferences
    target_categories = update_dict.pop("target_categories", None)
    target_exam_codes = update_dict.pop("target_exam_codes", None)

    for field, val in update_dict.items():
        if hasattr(profile, field):
            setattr(profile, field, val)

    # Update preferences
    if target_categories is not None or target_exam_codes is not None:
        if not profile.preferences:
            profile.preferences = StudentPreference(student_id=profile.id)
            db.add(profile.preferences)
        if target_categories is not None:
            profile.preferences.target_categories = target_categories
        if target_exam_codes is not None:
            profile.preferences.target_exam_codes = target_exam_codes

    db.commit()
    db.refresh(profile)

    return get_current_profile(profile)

@router.get("/session", response_model=StandardApiResponse[AuthSessionResponse])
def verify_session(
    current_user: AuthenticatedUser = Depends(get_current_user),
    profile: StudentProfile = Depends(get_or_create_student_profile),
):
    """Validates Supabase JWT signature and returns verified cryptographic claims."""
    target_cats = profile.preferences.target_categories if profile.preferences else []
    target_codes = profile.preferences.target_exam_codes if profile.preferences else []

    profile_resp = StudentProfileResponse(
        id=profile.id,
        email=profile.email,
        full_name=profile.full_name,
        date_of_birth=profile.date_of_birth,
        age=profile.age,
        gender=profile.gender,
        category=profile.category,
        domicile_state=profile.domicile_state,
        is_pwd=profile.is_pwd,
        pwd_percentage=profile.pwd_percentage,
        education_level=profile.education_level,
        major_stream=profile.major_stream,
        graduation_year=profile.graduation_year,
        graduation_percentage=profile.graduation_percentage,
        preferred_daily_study_hours=profile.preferred_daily_study_hours,
        is_onboarded=profile.is_onboarded,
        role=profile.role,
        target_categories=target_cats,
        target_exam_codes=target_codes,
    )

    session_data = AuthSessionResponse(
        user_id=current_user.id,
        email=current_user.email,
        role=current_user.role,
        is_admin=current_user.is_admin,
        profile=profile_resp,
    )
    return StandardApiResponse(data=session_data, message="Authenticated claims verified successfully")

@router.delete("/account", response_model=StandardApiResponse[dict])
def delete_student_account(
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user),
    profile: StudentProfile = Depends(get_or_create_student_profile),
):
    """
    DPDP Act 2023 & GDPR Compliant Account Deletion:
    Permanently deletes all student personal data, preferences, alerts,
    saved applications, test attempts, mistake logs, and study streaks.
    """
    from app.models.alert import StudentAlert
    from app.models.student import SavedExam, StudentReminder, StudyPlan, DailyStudyTask
    from app.models.preparation import MockTestAttempt, StudentMistake, StudentStudyGoal, PomodoroSession, StudyStreak

    student_id = profile.id

    # 1. Delete student preferences & alerts
    if profile.preferences:
        db.delete(profile.preferences)
    db.query(StudentAlert).filter(StudentAlert.student_id == student_id).delete(synchronize_session=False)

    # 2. Delete application tracker & reminders
    db.query(SavedExam).filter(SavedExam.student_id == student_id).delete(synchronize_session=False)
    db.query(StudentReminder).filter(StudentReminder.student_id == student_id).delete(synchronize_session=False)

    # 3. Delete study plans & tasks
    db.query(DailyStudyTask).filter(DailyStudyTask.student_id == student_id).delete(synchronize_session=False)
    db.query(StudyPlan).filter(StudyPlan.student_id == student_id).delete(synchronize_session=False)

    # 4. Delete test attempts, mistakes, and productivity logs
    db.query(MockTestAttempt).filter(MockTestAttempt.student_id == student_id).delete(synchronize_session=False)
    db.query(StudentMistake).filter(StudentMistake.student_id == student_id).delete(synchronize_session=False)
    db.query(StudentStudyGoal).filter(StudentStudyGoal.student_id == student_id).delete(synchronize_session=False)
    db.query(PomodoroSession).filter(PomodoroSession.student_id == student_id).delete(synchronize_session=False)
    db.query(StudyStreak).filter(StudyStreak.student_id == student_id).delete(synchronize_session=False)

    # 5. Delete profile record
    db.delete(profile)
    db.commit()

    return StandardApiResponse(
        data={"deleted_student_id": student_id, "status": "PURGED"},
        message="All student data and account records permanently purged in compliance with DPDP standards.",
    )
