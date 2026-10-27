# Govexa Backend Service (FastAPI + Supabase PostgreSQL)

Enterprise-grade FastAPI backend for the **Govexa AI-Based Indian Government Exam Guidance and Preparation System**. Built with SQLAlchemy 2.x, Alembic, Pydantic v2, and Supabase Auth.

---

## 1. System Architecture

```
backend/
├── alembic/                    # Database migration scripts
│   ├── env.py                  # Alembic environment linked to SQLAlchemy Base
│   └── versions/               # Versioned migration revisions
│       └── 0001_initial_schema.py
├── app/
│   ├── api/
│   │   ├── deps.py             # Dependency injection: get_db, get_current_user, get_current_admin
│   │   └── v1/
│   │       ├── endpoints/
│   │       │   ├── admin.py          # Gazette review workflow & audit logs
│   │       │   ├── auth.py           # Supabase profile & session verification
│   │       │   ├── eligibility.py    # Deterministic eligibility engine endpoints
│   │       │   ├── exams.py          # Exam discovery, search, syllabus overlap
│   │       │   ├── notifications.py  # Gazette feeds & official verification
│   │       │   ├── reminders.py      # Deadlines & study calendar
│   │       │   └── saved_exams.py    # Isolated student application tracker
│   │       └── router.py             # Aggregated v1 routing
│   ├── core/
│   │   ├── config.py           # Pydantic v2 BaseSettings & environment variables
│   │   ├── database.py         # SQLAlchemy 2.0 engine & SessionLocal
│   │   └── security.py         # Supabase HS256 JWT claim verification
│   ├── db/
│   │   ├── base.py             # Base metadata combining all 16 normalized models
│   │   └── seed_data.py        # Authoritative gazette data (UPSC, SSC, ISRO, KPSC, etc.)
│   ├── models/                 # Normalized SQLAlchemy 2.0 ORM entities
│   │   ├── audit.py            # Administrative audit logs
│   │   ├── eligibility.py      # Qualification, age cut-off, relaxations, domicile rules
│   │   ├── exam.py             # Authorities, categories, exams, stages, syllabus, pay
│   │   ├── notification.py     # Recruitment notices, posts, versions, sources
│   │   └── student.py          # Profiles, preferences, saved applications, study plans
│   ├── schemas/                # Pydantic validation models
│   └── services/
│       └── eligibility_engine.py  # Standalone deterministic eligibility rules engine
├── tests/                      # Pytest test suite with isolated in-memory DB
│   ├── conftest.py             # In-memory SQLite fixtures & signed JWT tokens
│   ├── test_auth.py            # Token verification & 401/403 authorization
│   ├── test_eligibility.py     # Deterministic age, degree, stream, community rules
│   ├── test_exams.py           # Discovery, search, pagination, syllabus overlap
│   └── test_saved_exams.py     # Application tracker & cross-student data isolation
├── alembic.ini                 # Alembic configuration
├── render.yaml                 # Render cloud deployment blueprint
├── requirements.txt            # Python dependencies
├── supabase_rls.sql            # Supabase Row-Level Security policies
└── .env.example                # Configuration blueprint
```

---

## 2. Local Setup & Quickstart

### Prerequisites
- Python 3.10+ (Tested on Python 3.11 and 3.14)
- Git

### Installation
```bash
# 1. Open the backend directory
cd backend

# 2. Create and activate a virtual environment
python -m venv .venv

# On Windows:
.venv\Scripts\activate
# On Linux / macOS:
source .venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Copy environment configuration
cp .env.example .env

# 5. Start the development server
uvicorn app.main:app --reload --port 8000
```

- **Swagger UI Interactive Documentation:** [http://localhost:8000/api/v1/docs](http://localhost:8000/api/v1/docs)
- **ReDoc Interactive Documentation:** [http://localhost:8000/api/v1/redoc](http://localhost:8000/api/v1/redoc)
- **Health Check Endpoint:** [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)

---

## 3. Database Setup (Supabase PostgreSQL)

### Connecting to Supabase
1. Create a project in [Supabase](https://supabase.com).
2. Go to **Project Settings** -> **Database** -> **Connection string** -> Select **URI** (Transaction pooler, port 6543).
3. Set the `DATABASE_URL` in `.env`:
   ```env
   DATABASE_URL="postgresql+psycopg2://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"
   ```
4. Run Alembic migrations:
   ```bash
   alembic upgrade head
   ```
5. Apply PostgreSQL Row-Level Security (RLS) policies:
   - Open Supabase **SQL Editor**.
   - Copy the contents of [`supabase_rls.sql`](file:///d:/web%20projects/major%20project/Govt-Job-Assistant/backend/supabase_rls.sql).
   - Click **Run**. This enables RLS and enforces row ownership on `student_profiles`, `saved_exams`, `student_reminders`, and `study_plans`.

---

## 4. Authentication Integration (Supabase Auth)

The backend never trusts user IDs or roles supplied in request bodies. Identity claims are cryptographically verified using Supabase HS256 JWT tokens:
- **Authorization Header:** `Authorization: Bearer <supabase_jwt_token>`
- **Token Verification:** Checked against `SUPABASE_JWT_SECRET`. Claims decoded:
  - `sub`: Authenticated User UUID (mapped 1-to-1 with `student_profiles.id`).
  - `role`: Role (`authenticated`).
  - `app_metadata.role` or `app_metadata.roles`: Checks for `"admin"` privileges.
- **Cross-Student Row Isolation:** A student can only view, modify, or delete their own saved exams and reminders. Unauthorized access by another student returns `HTTP 403 Forbidden`.

---

## 5. Deterministic Eligibility Engine

Implemented as an independent pure Python rules engine (`app.services.eligibility_engine.DeterministicEligibilityEngine`). **No LLM may override rule evaluations.**

### Rule Criteria Evaluated:
1. **Age Boundary on Official Cut-off Date:** Computes exact age down to the day relative to notification reference dates (e.g., August 1 of exam year).
2. **Community Age Relaxation:**
   - General / UR: Maximum prescribed age (e.g., 32 for UPSC CSE).
   - OBC-NCL: +3 Years relaxation.
   - SC / ST: +5 Years statutory relaxation.
   - PwD (Persons with Benchmark Disabilities): +10 Years relaxation.
3. **Degree Hierarchy & Stream:**
   - Validates candidate's degree against required level (`Bachelor's Degree`, `Master's Degree`, `Ph.D`).
   - Validates technical stream whitelist (e.g., ISRO Scientist 'SC' requires Computer Science, Electronics, or Mechanical engineering).
4. **Aggregate Marks Threshold:** Validates minimum qualifying percentage (e.g., ISRO 65%, UGC-NET 55% / 50% reserved).
5. **State Domicile Quotas:** Evaluates state-specific domicile requirements (e.g., KPSC KAS state reservation clauses).

### Result Enum:
- `MEETS_CRITERIA`: Candidate satisfies 100% of required conditions.
- `DOES_NOT_MEET`: Candidate fails one or more conditions (reasons and clauses returned).
- `INSUFFICIENT_DATA`: Missing required fields (e.g., date of birth or degree stream).

---

## 6. Running Tests

Run the comprehensive pytest suite:
```bash
# Inside the backend/ directory with .venv active:
pytest -v
```

All 21 test suites execute against an isolated in-memory SQLite database in under 1 second:
- `tests/test_auth.py`: Token verification, missing headers, tampered signatures, admin roles.
- `tests/test_eligibility.py`: Age limits, OBC/SC/ST relaxations, degree mismatches, stream checks, cut-off percentages.
- `tests/test_exams.py`: Search, category/level filtering, pagination, syllabus overlap.
- `tests/test_saved_exams.py`: Application tracking CRUD, student data isolation, cross-student 403 checks.

---

## 7. Render Production Deployment

The backend is configured for deployment to [Render](https://render.com) via `render.yaml`:

1. Fork or push the repository to GitHub.
2. In the Render Dashboard, click **New** -> **Blueprint**.
3. Connect the repository. Render reads `backend/render.yaml` and provisions the Web Service:
   - **Build Command:** `pip install --upgrade pip && pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Set the following Environment Variables in the Render dashboard:
   - `DATABASE_URL`: Your Supabase PostgreSQL pooler connection string.
   - `SUPABASE_URL`: Your Supabase project URL (`https://xyz.supabase.co`).
   - `SUPABASE_ANON_KEY`: Supabase anon key.
   - `SUPABASE_JWT_SECRET`: Supabase JWT secret from API settings.
   - `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key (kept strictly secure on the server).
   - `CORS_ORIGINS`: Allowed frontend origins (e.g., `["https://govexa.vercel.app"]`).

---

## 8. Part 3: Official Source Watchdog & Recruitment Monitoring Pipeline

### 8.1 Watchdog Architecture & Pipeline
```
Official Source Discovery (Registry)
→ Fetch Permitted HTML / PDF via Rate-Limited Client (Politeness & Backoff)
→ SHA-256 Hash Generation & Duplicate Elimination
→ Safe PDF & Text Processing (pypdf with Control-Char Sanitization)
→ Anti-Prompt-Injection LLM Adapter (Demarcated System Framing & Regex Fallback)
→ Change Detection (NEW_NOTICE, CORRIGENDUM, DEADLINE_EXTENSION, VACANCY_REVISION)
→ High-Impact Staging & Automated / Manual Approval Rules
→ Versioned Database Updates (NotificationVersion)
→ Personalized Student In-App & Email Alerts Dispatch
```

### 8.2 Background Worker Execution (Render Background Worker / Cron)
Monitoring tasks are **never** executed inside synchronous FastAPI request handlers. A dedicated standalone worker CLI is provided in [`app.worker`](file:///d:/web%20projects/major%20project/Govt-Job-Assistant/backend/app/worker.py):

```bash
# 1. Single-pass scheduled execution (Suitable for Render Cron Jobs):
python -m app.worker --run-once

# 2. Continuous daemon execution (Suitable for Render Background Worker):
python -m app.worker --daemon --interval 3600

# 3. Dry-run execution (Crawl and extract without mutating database):
python -m app.worker --dry-run
```

### 8.3 PDF Extraction & Anti-Prompt-Injection Defense
- **Safe Extraction:** Uses `pypdf` with size caps (`SCRAPER_MAX_PDF_SIZE_MB=15`) and control character sanitization.
- **Anti-Prompt-Injection:** Extracted document text is encapsulated within strict XML boundaries (`<untrusted_document_content>`). The LLM is instructed to ignore any instructions inside the document and extract solely factual recruitment schema fields. If the LLM provider is unavailable, high-precision deterministic regex fallback extracts dates, vacancies, and advertisement numbers without hallucinations.

### 8.4 High-Impact Change Governance
- **Corrigenda & Fluctuations:** High-impact revisions (deadline changes, vacancy fluctuations > 10%, qualification alterations) are flagged as `HIGH_IMPACT` and staged in `extraction_review_items` with status `PENDING_REVIEW`.
- **Operator Review Queue:** Admins can inspect diffs, approve notices to publish to active feeds, or reject false matches via `/admin/review-queue`.

### 8.5 Personalized Alerts & Email Adapter
- In-app alerts backed by PostgreSQL table `student_alerts`.
- Real-time notification feed in frontend Navbar with unread badges.
- Configurable email dispatch adapter (`app.services.alert_service.EmailDeliveryAdapter`) with deduplication against duplicate dispatches.
- Aspirants can customize alert categories (New Exams, Deadlines, Corrigenda, Admit Cards) in their Profile settings.

### 8.6 Part 3 Environment Variables
Add these to your `.env` or Render environment:
```env
# Gemini LLM Provider (Optional - Deterministic Regex parser active as fallback)
GEMINI_API_KEY=""
GEMINI_MODEL="gemini-1.5-flash"

# Document Storage & Watchdog Limits
SUPABASE_STORAGE_BUCKET="official-documents"
SCRAPER_USER_AGENT="Govexa-Watchdog/1.0 (+https://govexa.org/bot; watchdog@govexa.org)"
SCRAPER_MAX_PDF_SIZE_MB=15
SCRAPER_RATE_LIMIT_DELAY_SECONDS=2.0

# Approval Automation Thresholds
AUTO_APPROVE_CONFIDENCE_THRESHOLD=0.92
AUTO_APPROVE_HIGH_IMPACT_ALLOWED=false

# Email Notification Provider (mock, sendgrid, or resend)
EMAIL_PROVIDER="mock"
```

### 8.7 Complete Test Suite Execution
```bash
pytest -v
# Result: 42 passed, 0 failures (Part 1, 2, 3, and 4)
```

---

## 9. Part 4 — LLM Integration, RAG, Prep Engine & Specialized Agents

### 9.1 Provider-Independent LLM Architecture
- **Base Interface (`app.services.llm_provider.BaseLLMProvider`):** Abstract provider defining `generate_text`, `generate_structured_json`, `generate_objective_questions`, and `get_embeddings`.
- **Implementations:**
  - `GeminiLLMProvider`: Google Gemini (`gemini-1.5-flash`, `text-embedding-004`) behind backend configuration.
  - `DeterministicFallbackProvider`: Zero-cost, high-precision deterministic rules engine ensuring 100% test reliability and graceful degradation when API keys are absent or endpoints are unreachable.
- **Benchmark Suite (`benchmark_model_against_recruitment_corpus`):** Measures factual accuracy, schema validity, latency, and token efficiency against fixed public recruitment documents.
- **Resilience:** Timeouts, bounded retries with exponential backoff, rate limiting, and zero credential leakage in logs.

### 9.2 RAG and Ask-Your-PDF Pipeline
- **Models:** `DocumentKnowledgeBase` and `DocumentChunk` with SHA-256 deduplication and section/page metadata.
- **Retrieval:** Ranked keyword and full-text search with stopword filtering.
- **Anti-Prompt-Injection Defense:** Document text is sandboxed inside `<untrusted_document_context>`. Directives within documents (e.g. "SYSTEM OVERRIDE") are neutralized and ignored.
- **Evidence Referencing & State of Ignorance:** Every claim is cited (`[1]`, `[2]`). When the database does not contain facts matching an inquiry, the system explicitly states its lack of supporting evidence rather than hallucinating.

### 9.3 Exam Preparation & Objective Testing Engine
- **Deterministic Backend Scoring:** Objective MCQs are scored deterministically by backend Python code (`PerformanceEngine`) against verified answer keys, never by prompting an LLM to grade responses.
- **Negative Marking:** Supports authentic examination rules (+2.0 marks, -0.66 deduction for UPSC CSE; +2.0 marks, 0.0 deduction for KSET/UGC-NET Paper 1).
- **Mistake Notebook:** Missed questions are automatically logged to `StudentMistake` with chosen vs correct option and explanation.
- **Mistake-Based Recovery Tests:** Generates targeted practice tests exclusively from unresolved mistakes.

### 9.4 Productivity & Adaptive Preparation Blueprints
- **Adaptive Study Plans:** Paced 30-day, 7-day, and emergency crash preparation plans (60% Rule) adjustable by daily available hours. All plans include clear disclaimers that they are strategic study guides and do not guarantee selection.
- **Focus Engine:** Pomodoro session tracker logging 25-minute focus blocks to `PomodoroSession` and maintaining `StudyStreak`.

### 9.5 KSET & UGC-NET Specialized Hub
- **Paper 1 Curriculum:** Complete 10-unit curriculum (Teaching Aptitude, Research Aptitude, Comprehension, Communication, Mathematical Reasoning, Logical Reasoning, DI, ICT, Environment, Higher Education).
- **Paper 2 Coverage:** Post-graduate disciplines including Computer Science (087) and Economics (001).
- **PYQ Practice:** Verified previous-year questions with immediate backend scoring (+2 marks, 0 negative).

### 9.6 Six Specialized Agents Orchestration
Coordinated via `AgentOrchestrator` (`POST /api/v1/agents/run`):
1. `CandidateProfileAgent`: Profiles academic discipline, reservation category, and age eligibility.
2. `GovernmentJobEligibilityAgent`: Evaluates candidate against statutory gazetted eligibility criteria.
3. `GovernmentExamRecommendationAgent`: Suggests primary and backup government exams with overlap metrics.
4. `ExamPreparationAgent`: Generates paced weekly study plans and unit milestones.
5. `NotificationAndApplicationAgent`: Identifies application deadlines, admit card releases, and corrigenda.
6. `GovernmentCareerPlanningAgent`: Synthesizes contingency career paths across Union and State services.
All agent runs enforce strict token budgets (`AGENT_DEFAULT_TOKEN_BUDGET=3000`), maximum execution steps (`AGENT_MAX_EXECUTION_STEPS=5`), and audit logging in `agent_execution_audits`.

