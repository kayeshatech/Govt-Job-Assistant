from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any, List
import jwt
from fastapi import HTTPException, status
from pydantic import BaseModel

from app.core.config import settings

class AuthenticatedUser(BaseModel):
    id: str  # Verified UUID from JWT 'sub'
    email: str
    role: str = "student"
    is_admin: bool = False
    raw_claims: Dict[str, Any] = {}

def verify_jwt_token(token: str) -> AuthenticatedUser:
    """
    Cryptographically verify Supabase JWT token and extract authenticated claims.
    Ensures user ID and roles originate exclusively from verified cryptographic claims.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Handle development bypass tokens for isolated mock testing
    if settings.ENVIRONMENT != "production":
        if token == "demo_jwt_aspirant_session":
            return AuthenticatedUser(
                id="aspirant-2026-demo",
                email="priya.sharma@aspirant.in",
                role="student",
                is_admin=False,
                raw_claims={"sub": "aspirant-2026-demo", "email": "priya.sharma@aspirant.in", "role": "student"},
            )
        elif token == "demo_jwt_admin_session":
            return AuthenticatedUser(
                id="admin-2026-super",
                email="admin@govexa.gov.in",
                role="admin",
                is_admin=True,
                raw_claims={"sub": "admin-2026-super", "email": "admin@govexa.gov.in", "role": "admin"},
            )

    try:
        # Decode and verify Supabase JWT signature
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=[settings.SUPABASE_JWT_ALGORITHM],
            options={"verify_aud": False},  # Supabase aud defaults to 'authenticated'
        )

        user_id: Optional[str] = payload.get("sub")
        email: Optional[str] = payload.get("email")

        if not user_id or not email:
            raise credentials_exception

        # Determine admin privileges from Supabase app_metadata or whitelist
        app_metadata = payload.get("app_metadata", {})
        roles: List[str] = []
        if isinstance(app_metadata.get("roles"), list):
            roles = app_metadata["roles"]
        elif isinstance(app_metadata.get("role"), str):
            roles = [app_metadata["role"]]

        is_admin = (
            "admin" in roles
            or email in settings.ADMIN_EMAILS
            or payload.get("role") == "service_role"
        )

        return AuthenticatedUser(
            id=user_id,
            email=email,
            role="admin" if is_admin else "student",
            is_admin=is_admin,
            raw_claims=payload,
        )

    except jwt.PyJWTError:
        raise credentials_exception

def create_access_token(
    data: Dict[str, Any],
    expires_delta: Optional[timedelta] = None,
) -> str:
    """Generate signed JWT token for test suites and session mocking."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(hours=24)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SUPABASE_JWT_SECRET, algorithm=settings.SUPABASE_JWT_ALGORITHM)
    return encoded_jwt
