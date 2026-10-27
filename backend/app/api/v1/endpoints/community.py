import html
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_optional_current_user, get_current_user
from app.core.security import AuthenticatedUser
from app.models.community import StudyGroup, GroupDiscussionMessage, MentorProfile
from app.models.student import StudentProfile
from app.schemas.community import (
    StudyGroupCreate,
    StudyGroupResponse,
    MessageCreate,
    MessageResponse,
    MentorProfileCreate,
    MentorProfileResponse,
    MentorDashboardResponse,
)

router = APIRouter()

@router.get("/groups", response_model=List[StudyGroupResponse])
def list_study_groups(
    exam_code: Optional[str] = Query(None, description="Filter groups by exam code (e.g. UPSC-CSE, KSET)"),
    db: Session = Depends(get_db),
):
    """
    List active peer study groups and discussion circles (Feature 88).
    """
    q = db.query(StudyGroup).filter(StudyGroup.is_active == True)
    if exam_code and exam_code != "all":
        q = q.filter(StudyGroup.exam_code == exam_code)

    groups = q.order_by(StudyGroup.member_count.desc()).all()
    return groups


@router.post("/groups", response_model=StudyGroupResponse)
def create_study_group(
    req: StudyGroupCreate,
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_optional_current_user),
):
    """
    Create a new student study circle for focused syllabus collaboration.
    """
    user_id = current_user.id if current_user else "guest-aspirant-id"
    # XSS Sanitization
    sanitized_name = html.escape(req.name.strip())
    sanitized_desc = html.escape(req.description.strip())

    group = StudyGroup(
        name=sanitized_name,
        exam_code=req.exam_code.strip().upper(),
        description=sanitized_desc,
        category=req.category,
        created_by=user_id,
        member_count=1,
    )
    db.add(group)
    db.commit()
    db.refresh(group)
    return group


@router.get("/groups/{group_id}/messages", response_model=List[MessageResponse])
def get_group_messages(
    group_id: str,
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    """
    Retrieve message thread for a study group (Feature 88).
    """
    group = db.query(StudyGroup).filter(StudyGroup.id == group_id).first()
    if not group:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Study group not found")

    messages = (
        db.query(GroupDiscussionMessage)
        .filter(GroupDiscussionMessage.group_id == group_id)
        .order_by(GroupDiscussionMessage.created_at.asc())
        .limit(limit)
        .all()
    )
    return messages


@router.post("/groups/{group_id}/messages", response_model=MessageResponse)
def post_group_message(
    group_id: str,
    req: MessageCreate,
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_optional_current_user),
):
    """
    Post a doubt, concept clarification, or discussion response.
    Sanitizes HTML against XSS and automatically flags verified mentor answers (Feature 89).
    """
    group = db.query(StudyGroup).filter(StudyGroup.id == group_id).first()
    if not group:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Study group not found")

    user_id = current_user.id if current_user else "guest-aspirant-id"
    author_name = current_user.email.split("@")[0].capitalize() if current_user else "Peer Aspirant"

    # Check if author is a verified mentor
    mentor = db.query(MentorProfile).filter(
        MentorProfile.user_id == user_id,
        MentorProfile.is_verified == True,
    ).first()

    # XSS Defense
    sanitized_content = html.escape(req.content.strip())

    msg = GroupDiscussionMessage(
        group_id=group_id,
        user_id=user_id,
        author_name=mentor.full_name if mentor else author_name,
        content=sanitized_content,
        is_verified_mentor_answer=bool(mentor),
    )
    db.add(msg)
    if mentor:
        mentor.total_answers_resolved += 1

    group.member_count = max(group.member_count, 1) + 1
    db.commit()
    db.refresh(msg)
    return msg


@router.get("/mentors", response_model=List[MentorProfileResponse])
def list_verified_mentors(
    specialization: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """
    List certified academic faculty, JRF researchers, and exam evaluators (Feature 89).
    """
    q = db.query(MentorProfile).filter(MentorProfile.is_verified == True)
    if specialization:
        q = q.filter(MentorProfile.specialization.ilike(f"%{specialization}%"))
    return q.all()


@router.post("/mentors/verify", response_model=MentorProfileResponse)
def apply_mentor_verification(
    req: MentorProfileCreate,
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_optional_current_user),
):
    """
    Apply for certified mentor status with academic credentials.
    """
    user_id = current_user.id if current_user else "mentor-applicant-uuid"
    existing = db.query(MentorProfile).filter(MentorProfile.user_id == user_id).first()
    if existing:
        return existing

    mentor = MentorProfile(
        user_id=user_id,
        full_name=html.escape(req.full_name),
        designation=html.escape(req.designation),
        specialization=html.escape(req.specialization),
        institution=html.escape(req.institution),
        is_verified=True, # Auto-verify for demonstrated prototype environment
    )
    db.add(mentor)
    db.commit()
    db.refresh(mentor)
    return mentor


@router.get("/mentor-dashboard", response_model=MentorDashboardResponse)
def get_mentor_dashboard(
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_optional_current_user),
):
    """
    Dedicated Teacher/Mentor Dashboard (Feature 89).
    Displays student cohort doubts, assigned groups, and verification stats.
    """
    user_id = current_user.id if current_user else "demo-mentor-id"
    mentor = db.query(MentorProfile).filter(MentorProfile.user_id == user_id).first()
    if not mentor:
        # Fallback to existing seeded mentor if available
        mentor = db.query(MentorProfile).first()
        if not mentor:
            mentor = MentorProfile(
                id=str(uuid.uuid4()),
                user_id=user_id,
                full_name="Prof. Anand Deshmukh, Ph.D.",
                designation="Senior Faculty & UGC-NET JRF Advisor",
                specialization="Teaching Aptitude & Higher Education Policies",
                institution="National Institute of Public Policy & Academic Research",
                is_verified=True,
                total_answers_resolved=48,
                rating=4.95,
            )
            db.add(mentor)
            db.commit()
            db.refresh(mentor)

    groups = db.query(StudyGroup).filter(StudyGroup.is_active == True).limit(5).all()
    recent_msgs = (
        db.query(GroupDiscussionMessage)
        .order_by(GroupDiscussionMessage.created_at.desc())
        .limit(10)
        .all()
    )

    return MentorDashboardResponse(
        mentor_profile=MentorProfileResponse.model_validate(mentor),
        assigned_study_groups=[StudyGroupResponse.model_validate(g) for g in groups],
        unresolved_questions_count=len([m for m in recent_msgs if not m.is_verified_mentor_answer]),
        recent_student_queries=[MessageResponse.model_validate(m) for m in recent_msgs],
    )
