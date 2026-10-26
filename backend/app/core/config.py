import os
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Govexa Government Exam Intelligence API"
    VERSION: str = "2.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "https://govexa.vercel.app",
    ]
    
    # Database (Supabase PostgreSQL in production, SQLite fallback in local test/dev)
    DATABASE_URL: str = "sqlite:///./govexa.db"
    
    # Supabase Configuration
    SUPABASE_URL: Optional[str] = "https://your-project.supabase.co"
    SUPABASE_ANON_KEY: Optional[str] = "your-anon-key"
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = None  # Never exposed to frontend
    SUPABASE_JWT_SECRET: str = "govexa-super-secret-jwt-key-for-local-dev-and-auth-signing-min-32-chars"
    SUPABASE_JWT_ALGORITHM: str = "HS256"

    # Admin verification token / override for testing
    ADMIN_EMAILS: List[str] = ["admin@govexa.gov.in", "officer@govexa.gov.in"]

    model_config = SettingsConfigDict(
        case_sensitive=True,
        env_file=".env",
        extra="ignore",
    )

settings = Settings()
