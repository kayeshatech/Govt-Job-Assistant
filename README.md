# Govexa — AI Government Exam Career Guidance & Preparation System

> **Full-Stack Monorepo Architecture**  
> An intelligent discovery, statutory eligibility screening, official notification watchdog, and personalized preparation roadmap platform dedicated exclusively to Indian Public Sector, Central, and State Government examinations.

---

## 1. Project Directory Structure

```
Govt-Job-Assistant/
├── frontend/                     # React 18 + Vite 6 + TypeScript + Tailwind CSS
│   ├── src/
│   │   ├── api/                  # Typed API services with dual sync & fixture fallback
│   │   ├── components/           # Reusable UI, Layout, Cards, Feedback
│   │   ├── config/               # Centralized brand tokens and routes
│   │   ├── context/              # AuthContext, ToastContext, SavedExamsContext
│   │   ├── fixtures/             # Curated Indian Government exam datasets
│   │   ├── pages/                # 19 fully navigable frontend pages
│   │   ├── types/                # Strict TypeScript domain interfaces
│   │   ├── App.tsx               # Root routing
│   │   ├── index.css             # 6-color palette variables
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js        # Strict 6-color theme tokens
│   ├── tsconfig.json
│   ├── .env.example
│   └── index.html
│
├── backend/                      # Python FastAPI + Supabase PostgreSQL
│   ├── alembic/                  # Database migration versions
│   ├── app/
│   │   ├── api/                  # Dependencies, v1 routers & endpoints
│   │   ├── core/                 # Config, database engine, Supabase JWT verification
│   │   ├── db/                   # Seed fixtures (UPSC, SSC, ISRO, KPSC, etc.)
│   │   ├── models/               # 16 normalized SQLAlchemy 2.x domain tables
│   │   ├── schemas/              # Pydantic v2 validation models
│   │   ├── services/             # Deterministic eligibility rules engine
│   │   └── main.py               # FastAPI application with CORS & auto-seed
│   ├── tests/                    # Pytest test suite (21 unit & integration tests)
│   ├── supabase_rls.sql          # Supabase Row-Level Security policies
│   ├── render.yaml               # Render cloud deployment blueprint
│   ├── requirements.txt          # Python dependencies
│   ├── .env.example
│   └── README.md
│
├── .gitignore
├── FEATURES_CHECKLIST.md
└── README.md                     # Root project documentation
```

---

## 2. Mandatory Six-Color Design System

The application strictly enforces the approved six-color palette across all components:

| Color Name | Hex Code | Role in Interface | Tailwind Token |
| :--- | :--- | :--- | :--- |
| **Starlight** | `#F3EEF8` | Light canvas background, surface cards, contrast text on dark | `bg-starlight`, `text-starlight` |
| **Opaline** | `#CDC4DC` | Muted borders, dividers, subtle secondary badges | `border-opaline`, `bg-opaline/30` |
| **Aurora** | `#8EA4C4` | Tonal highlights, secondary icons, match score pills | `bg-aurora/30`, `text-aurora` |
| **Wisteria** | `#6E5A88` | Interactive accents, secondary buttons, section labels | `bg-wisteria`, `text-wisteria` |
| **Nocturne** | `#2A2550` | Primary action buttons, dark headers, Recharts data bars | `bg-nocturne`, `text-nocturne` |
| **Eclipse** | `#0C0A16` | High-contrast body typography, dark footers, backdrop overlay | `bg-eclipse`, `text-eclipse` |

---

## 3. Quick Start

### 1. Backend (FastAPI + Supabase PostgreSQL)

```bash
cd backend
python -m venv .venv

# Activate on Windows:
.venv\Scripts\activate
# Activate on Linux / macOS:
source .venv/bin/activate

# Install dependencies:
pip install -r requirements.txt

# Run migrations:
alembic upgrade head

# Start API server:
uvicorn app.main:app --reload --port 8000
```
- API Endpoint: `http://localhost:8000/api/v1`
- Swagger Interactive Docs: `http://localhost:8000/api/v1/docs`
- Health Check: `http://localhost:8000/api/v1/health`

### 2. Run Backend Tests (Pytest)

```bash
cd backend
pytest -v
```
All 21 test suites execute in under 1 second against an in-memory SQLite database, validating:
- Authentication & Supabase HS256 JWT claim verification
- Student data isolation & cross-student 403 authorization checks
- Deterministic eligibility screening (exact cut-off age calculations, OBC/SC/ST/PwD statutory relaxations, degree hierarchy matching, stream whitelisting, percentage thresholds)
- Examination search, level filtering, pagination, and syllabus overlap analysis.

### 3. Frontend (React + TypeScript + Vite)

```bash
cd frontend
npm install
npm run dev
```
Runs at `http://localhost:5173/`.

To build the production bundle:
```bash
cd frontend
npm run build
```

---

## 4. Key Architectural Implementations in Part 2

1. **Normalized Database Schema (16 Domain Models):**
   - Student profiles & target preferences.
   - Issuing authorities (UPSC, SSC, ISRO, NTA, KPSC) & examination categories.
   - Government examinations, exam stages, syllabus topics, and pay scale records.
   - Educational qualifications, age criteria, community relaxations, domicile quotas.
   - Official recruitment notices, posts, versions, corrigenda, and verification sources.
   - Saved examinations and isolated application tracking pipelines.
   - Student reminders, study plans, daily tasks, and administrative audit logs.

2. **Supabase Auth & Security:**
   - Cryptographically verified Supabase JWT claims (HS256).
   - Strict student row ownership: students can never read, modify, or delete another student's applications.
   - Supabase Row-Level Security (`supabase_rls.sql`).
   - Zero exposure of service-role keys in frontend client code.

3. **Deterministic Eligibility Engine:**
   - Pure Python rules engine (`DeterministicEligibilityEngine`).
   - Evaluates minimum/maximum age on the official notification's reference cut-off date.
   - Applies statutory community relaxations (+3 OBC, +5 SC/ST, +10 PwD).
   - Enforces degree level, technical stream whitelists, and qualifying percentage thresholds.
   - Returns structured criterion reasons with official gazette clause references.
   - Never overridden by LLM generation.

4. **Resilient Frontend-Backend Integration:**
   - Typed service layer (`examService`, `notificationService`, `eligibilityService`, `studentService`).
   - Maps FastAPI snake_case schemas cleanly to frontend camelCase TypeScript models.
   - Dual-sync and fallback fixture mode (`VITE_ENABLE_MOCK_FALLBACK=true`): enables offline development, mock demonstrations, and real-time backend synchronization when connected.

5. **Cloud Deployment Ready:**
   - `backend/render.yaml` turnkey Render blueprint.
   - Alembic migration scripts (`0001_initial_schema.py`).
   - Complete `.env.example` templates for both frontend and backend.