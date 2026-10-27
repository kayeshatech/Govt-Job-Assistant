import os
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Govexa Government Exam Intelligence API"
    VERSION: str = "3.0.0"
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

    # ==========================================
    # Part 3: AI & LLM Provider Configuration
    # ==========================================
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-1.5-flash"
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
