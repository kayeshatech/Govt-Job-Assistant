# Govexa — AI Government Exam Career Guidance & Preparation Platform

> **Production Full-Stack Architecture (Parts 1–5 Complete)**  
> An intelligent discovery, statutory eligibility screening, official recruitment notification watchdog, retrieval-augmented document study, and personalized preparation platform dedicated exclusively to Indian Public Sector, Central, and State Government examinations.

---

## 1. Project Overview & Technology Stack

| Layer | Technology | Deployment Platform |
|---|---|---|
| **Frontend** | React 18, Vite 6, TypeScript, Tailwind CSS, Lucide React, Recharts, Axios | **Vercel** (`frontend/vercel.json`) |
| **Backend API** | Python 3.11, FastAPI, Pydantic v2, SQLAlchemy 2.x, Alembic, HTTPX | **Render Web Service** (`render.yaml`) |
| **Background Worker** | Python Async Watchdog, PyPDF2, OCR Extractor, Semantic Change Detector | **Render Worker** (`render.yaml`) |
| **Database & Storage** | PostgreSQL 15+ (Transaction Pooler :6543), Row Level Security (RLS), Supabase Storage | **Supabase** (`supabase_rls.sql`) |
| **Authentication** | Supabase Auth (GoTrue), HMAC-SHA256 JWT Claim Verification, DPDP Act 2023 Erasure | **Supabase Auth** |
| **Artificial Intelligence** | Multi-Agent Orchestrator (6 Agents), RAG Engine, Gemini 1.5 Flash / Embeddings, Deterministic Scoring | **Google Gemini API / Provider Fallback** |

---

## 2. Mandatory Six-Color Design System

The application strictly enforces the approved six-color palette across all components without ad-hoc colors or gradients:

| Color Name | Hex Code | Role in Interface | Tailwind Token |
| :--- | :--- | :--- | :--- |
| **Starlight** | `#F3EEF8` | Light canvas background, surface cards, contrast text on dark | `bg-starlight`, `text-starlight` |
| **Opaline** | `#CDC4DC` | Muted borders, dividers, subtle secondary badges | `border-opaline`, `bg-opaline/30` |
| **Aurora** | `#8EA4C4` | Tonal highlights, secondary icons, match score pills | `bg-aurora/30`, `text-aurora` |
| **Wisteria** | `#6E5A88` | Interactive accents, secondary buttons, section labels | `bg-wisteria`, `text-wisteria` |
| **Nocturne** | `#2A2550` | Primary action buttons, dark headers, Recharts data bars | `bg-nocturne`, `text-nocturne` |
| **Eclipse** | `#0C0A16` | High-contrast body typography, dark footers, backdrop overlay | `bg-eclipse`, `text-eclipse` |

---

## 3. Comprehensive Documentation Sitemap

Detailed documentation is available in the [`docs/`](./docs) directory:

- [Feature Traceability Matrix (`docs/traceability_matrix.md`)](./docs/traceability_matrix.md): Complete traceability across all 89 specification items.
- [System Architecture (`docs/architecture.md`)](./docs/architecture.md): 3-tier architecture, multi-agent orchestration, and watchdog ingestion pipeline.
- [Database Schema & ER Diagram (`docs/database_schema.md`)](./docs/database_schema.md): Normalized relational models, indexes, and Mermaid ER diagram.
- [Deployment Guide (`docs/deployment_guide.md`)](./docs/deployment_guide.md): Step-by-step production setup for Vercel, Render, and Supabase.
- [Security & Privacy Audit (`docs/security_and_privacy.md`)](./docs/security_and_privacy.md): SSRF defense, RLS policies, anti-prompt injection, and DPDP Act 2023 erasure.

---

## 4. 20 Fully Navigable Frontend Pages

1. **Landing Portal** (`/`): Hero showcase, features overview, examination categories, search preview.
2. **Student Login** (`/login`): Secure email authentication.
3. **Student Registration** (`/register`): Aspirant sign-up.
4. **Password Recovery** (`/forgot-password`): Password reset request.
5. **Onboarding Wizard** (`/onboarding`): Multi-step educational stream and domicile setup.
6. **Main Workspace Dashboard** (`/dashboard`): Study habit streaks, countdown desk widget, weak-topic analytics.
7. **Exam Discovery** (`/exams`): Multi-criteria filtering, search, and comparison matrix.
8. **Exam Detail View** (`/exams/:id`): Stage breakdowns, 7th CPC salary, syllabus checklist.
9. **Eligibility Screener** (`/eligibility`): Instant statutory eligibility evaluations.
10. **Recruitment Notifications** (`/notifications`): Live gazette updates and post summaries.
11. **Notification Detail** (`/notifications/:id`): Official PDF download and corrigendum history.
12. **Exam Calendar** (`/calendar`): Color-coded timeline with live countdown timers.
13. **Saved Applications Tracker** (`/saved-exams`): Kanban application pipeline and reminders.
14. **Preparation Roadmap** (`/roadmap`): Multi-week syllabus milestone planner.
15. **Study Material Library** (`/materials`): PDF uploads, mock test simulations, Pomodoro timer.
16. **Student Profile & Settings** (`/profile`): Domicile management and DPDP Act account erasure.
17. **AI Study Assistant** (`/ai-assistant`): Multilingual chat (English, Hindi, Kannada), STT/TTS voice assistance, Ask-Your-PDF RAG.
18. **KSET / UGC-NET Dedicated Hub** (`/kset-ugc-net`): Paper 1 all-unit breakdown, PYQs, zero-negative marking tests.
19. **Community Study Circles & Mentors** (`/community`): Peer discussion circles and faculty doubt resolution dashboard.
20. **Admin Review Queue** (`/admin/review-queue`): Gazette change detection and source registry management.

---

## 5. Quick Start: Local Development

### 1. Backend (FastAPI + SQLite / PostgreSQL)

```bash
cd backend

# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate       # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations & seed authoritative data
alembic upgrade head
python -m app.db.seed_data

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```
- API Base: `http://localhost:8000/api/v1`
- Swagger Docs: `http://localhost:8000/api/v1/docs`
- Health Check: `http://localhost:8000/api/v1/health`
- Operational Metrics: `http://localhost:8000/api/v1/metrics`

### 2. Run Automated Pytest Suite

```bash
cd backend
pytest -v
```
All **51 test suites** pass in ~8 seconds, validating:
- SSRF domain whitelisting and loopback/cloud metadata blocking
- DPDP Act 2023 / GDPR complete cascade account erasure
- Peer study circles, message threads, and anti-XSS HTML sanitization
- Verified mentor profiles and faculty evaluation dashboard
- Deterministic objective test scoring and negative marking calculations
- RAG Ask-Your-PDF retrieval relevance and State of Ignorance guardrails
- 6-agent orchestration audits and LLM failure fallbacks

### 3. Frontend (React + Vite + TypeScript)

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
Builds cleanly with zero TypeScript or compilation errors.

---

## 6. Production Deployment Overview

- **Frontend**: Configured for Vercel with single-page application (SPA) rewrites and security headers (`frontend/vercel.json`).
- **Backend API & Watchdog**: Configured for Render with automated build, worker daemon, and health check (`render.yaml`).
- **Database & Row Level Security**: Configured for Supabase PostgreSQL with transaction connection pooler (`backend/supabase_rls.sql`).