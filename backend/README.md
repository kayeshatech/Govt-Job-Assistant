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
