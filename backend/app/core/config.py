import os
import json
from typing import List, Optional, Union, Any
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Govexa Government Exam Intelligence API"
    VERSION: str = "5.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    
    # CORS (Supports list, comma-separated string, JSON string, or empty string)
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "https://govexa.vercel.app",
        "https://govt-job-assistant.vercel.app",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Any) -> List[str]:
        default_origins = [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:3000",
            "https://govexa.vercel.app",
            "https://govt-job-assistant.vercel.app",
        ]
        if isinstance(v, str):
            v = v.strip()
            if not v:
                return default_origins
            if v.startswith("[") and v.endswith("]"):
                try:
                    parsed = json.loads(v)
                    if isinstance(parsed, list):
                        result = []
                        for item in parsed:
                            clean = str(item).strip().rstrip("/")
                            if clean:
                                result.append(clean)
                        return result or default_origins
                except Exception:
                    pass
            # Also handle single quotes: "['https://...']"
            if v.startswith("['") or v.startswith('["'):
                cleaned = v.replace("'", '"')
                try:
                    parsed = json.loads(cleaned)
                    if isinstance(parsed, list):
                        result = []
                        for item in parsed:
                            clean = str(item).strip().rstrip("/")
                            if clean:
                                result.append(clean)
                        return result or default_origins
                except Exception:
                    pass
            # Split comma-separated string: "https://foo.com, https://bar.com"
            raw_items = [origin.strip() for origin in v.split(",") if origin.strip()]
            result = []
            for item in raw_items:
                clean = item.rstrip("/")
                if clean:
                    result.append(clean)
            return result or default_origins
        elif isinstance(v, (list, tuple, set)):
            result = []
            for item in v:
                clean = str(item).strip().rstrip("/")
                if clean:
                    result.append(clean)
            return result or default_origins
        return default_origins
    
    # Database (Supabase PostgreSQL in production, SQLite fallback in local test/dev)
    DATABASE_URL: str = "sqlite:///./govexa.db"

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def fix_database_url(cls, v: Any) -> str:
        if isinstance(v, str):
            v = v.strip()
            if not v:
                return "sqlite:///./govexa.db"
            if v.startswith("postgres://"):
                return v.replace("postgres://", "postgresql://", 1)
            return v
        return "sqlite:///./govexa.db"
    
    # Supabase Configuration
    SUPABASE_URL: Optional[str] = "https://your-project.supabase.co"
    SUPABASE_ANON_KEY: Optional[str] = "your-anon-key"
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = None  # Never exposed to frontend
    SUPABASE_JWT_SECRET: str = "govexa-super-secret-jwt-key-for-local-dev-and-auth-signing-min-32-chars"
    SUPABASE_JWT_ALGORITHM: str = "HS256"

    # Admin verification token / override for testing
    ADMIN_EMAILS: Union[List[str], str] = ["admin@govexa.gov.in", "officer@govexa.gov.in"]

    @field_validator("ADMIN_EMAILS", mode="before")
    @classmethod
    def assemble_admin_emails(cls, v: Any) -> List[str]:
        if isinstance(v, str):
            v = v.strip()
            if not v:
                return ["admin@govexa.gov.in"]
            if v.startswith("[") and v.endswith("]"):
                try:
                    parsed = json.loads(v)
                    if isinstance(parsed, list):
                        return [str(item).strip() for item in parsed if str(item).strip()]
                except Exception:
                    pass
            return [email.strip() for email in v.split(",") if email.strip()]
        elif isinstance(v, (list, tuple, set)):
            return [str(item).strip() for item in v if str(item).strip()]
        return ["admin@govexa.gov.in"]

    # ==========================================
    # Part 3: AI & LLM Provider Configuration
    # ==========================================
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-2.0-flash"
    LLM_PROVIDER: str = "gemini"  # "gemini" | "synthetic_fallback"

    # ==========================================
    # Part 3: Storage & Scraper Safety Config
    # ==========================================
    SUPABASE_STORAGE_BUCKET: str = "recruitment-documents"
    STORAGE_LOCAL_FALLBACK_DIR: str = "./storage_docs"
    SCRAPER_USER_AGENT: str = "Govexa-Watchdog/3.0 (+https://govexa.vercel.app/bot-info)"
    SCRAPER_REQUEST_TIMEOUT_SECONDS: int = 15
    SCRAPER_MAX_RETRIES: int = 3
    SCRAPER_MAX_PDF_SIZE_MB: int = 15
    SCRAPER_RATE_LIMIT_DELAY_SECONDS: float = 2.0

    # ==========================================
    # Part 3: Notification & Email Delivery Config
    # ==========================================
    EMAIL_PROVIDER: str = "console"  # "console" | "smtp" | "sendgrid" | "resend"
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: Optional[int] = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    EMAILS_FROM_EMAIL: str = "alerts@govexa.gov.in"
    EMAILS_FROM_NAME: str = "Govexa Official Watchdog"

    # ==========================================
    # Part 3: Automated Review & Validation Policies
    # ==========================================
    AUTO_APPROVE_CONFIDENCE_THRESHOLD: float = 0.92
    AUTO_APPROVE_HIGH_IMPACT_ALLOWED: bool = False  # High impact changes require review

    # ==========================================
    # Part 4: LLM, RAG & Agent Orchestration Config
    # ==========================================
    GEMINI_EMBEDDING_MODEL: str = "text-embedding-004"
    LLM_TIMEOUT_SECONDS: int = 30
    LLM_MAX_RETRIES: int = 3
    RAG_MAX_CHUNKS_PER_QUERY: int = 5
    RAG_CHUNK_SIZE_TOKENS: int = 400
    RAG_CHUNK_OVERLAP_TOKENS: int = 80
    AGENT_MAX_EXECUTION_STEPS: int = 5
    AGENT_DEFAULT_TOKEN_BUDGET: int = 4000
    KSET_UGC_NET_DEFAULT_EXAM_CODE: str = "UGC-NET-PAPER1"

    model_config = SettingsConfigDict(
        case_sensitive=True,
        env_file=".env",
        extra="ignore",
    )

settings = Settings()
