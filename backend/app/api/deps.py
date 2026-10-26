from typing import Generator
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.core.security import verify_jwt_token, AuthenticatedUser
from app.models.student import StudentProfile

security_scheme = HTTPBearer(auto_error=False)

def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
) -> AuthenticatedUser:
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token required in Authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return verify_jwt_token(credentials.credentials)

def get_current_admin(
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> AuthenticatedUser:
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrative privileges required to access this resource",
        )
    return current_user

def get_or_create_student_profile(
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> StudentProfile:
    """Load or initialize student profile row matching the verified user UUID."""
    profile = db.query(StudentProfile).filter(StudentProfile.id == current_user.id).first()
    if not profile:
        profile = StudentProfile(
            id=current_user.id,
            email=current_user.email,
            full_name=current_user.raw_claims.get("user_metadata", {}).get("full_name") or current_user.email.split("@")[0].capitalize(),
            role=current_user.role,
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile
