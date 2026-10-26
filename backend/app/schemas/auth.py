from typing import Optional, List
from pydantic import BaseModel, EmailStr, ConfigDict

class StudentProfileBase(BaseModel):
    full_name: str
    email: EmailStr
    date_of_birth: str  # YYYY-MM-DD
    gender: str = "Female"
    category: str = "General / UR"
    domicile_state: str = "Karnataka"
    is_pwd: bool = False
    pwd_percentage: Optional[float] = None
    education_level: str = "Bachelor of Engineering / B.Tech"
    major_stream: str = "Computer Science & Engineering"
    graduation_year: int = 2024
    graduation_percentage: float = 74.5
    preferred_daily_study_hours: int = 6
    is_onboarded: bool = True

class StudentProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    category: Optional[str] = None
    domicile_state: Optional[str] = None
    is_pwd: Optional[bool] = None
    pwd_percentage: Optional[float] = None
    education_level: Optional[str] = None
    major_stream: Optional[str] = None
    graduation_year: Optional[int] = None
    graduation_percentage: Optional[float] = None
    preferred_daily_study_hours: Optional[int] = None
    is_onboarded: Optional[bool] = None
    target_categories: Optional[List[str]] = None
    target_exam_codes: Optional[List[str]] = None

class StudentProfileResponse(StudentProfileBase):
    id: str
    age: int
    role: str
    target_categories: List[str] = []
    target_exam_codes: List[str] = []

    model_config = ConfigDict(from_attributes=True)

class AuthSessionResponse(BaseModel):
    user_id: str
    email: str
    role: str
    is_admin: bool
    profile: Optional[StudentProfileResponse] = None
