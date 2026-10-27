# Govexa Deployment Guide: Vercel, Render & Supabase

This guide provides step-by-step instructions for deploying Govexa to production and running the system locally.

---

## 1. Local Development Setup

### Prerequisites
- Node.js 18+ (Node 20 LTS recommended)
- Python 3.11+
- Git

### Running the Frontend
```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start Vite dev server on http://localhost:5173
npm run dev

# Run TypeScript checks and production build
npm run build
```

### Running the Backend
```bash
# Navigate to backend
cd backend

# Create virtual environment (if not already present)
python -m venv .venv
source .venv/bin/activate    # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations (or initialize database)
alembic upgrade head
python -m app.db.seed_data

# Start FastAPI development server on http://localhost:8000
uvicorn app.main:app --reload --port 8000

# Run automated test suite
pytest -v
```

---

## 2. Production Deployment: Supabase

1. **Create Supabase Project**:
   - Create a project on [database.new](https://database.new) in your preferred AWS region (e.g. `ap-south-1` Mumbai).
2. **Retrieve Connection String & Keys**:
   - Go to **Project Settings -> Database**: Copy the Connection Pooler URL (Transaction Mode, Port `6543`).
   - Go to **Project Settings -> API**: Copy `Project URL`, `anon public` key, `service_role` key, and `JWT Secret`.
3. **Execute Row Level Security (RLS)**:
   - Open **SQL Editor** in the Supabase Dashboard.
   - Paste and run `backend/supabase_rls.sql` to enforce database-level student isolation.
4. **Apply Migrations**:
   - Set `DATABASE_URL` in your backend `.env` pointing to the Supabase pooler.
   - Run: `alembic upgrade head`.

---

## 3. Production Deployment: Render (API & Worker)

Govexa deploys as two services on Render using the provided `render.yaml` blueprint:

### 1. Web Service (`govexa-api`)
- **Runtime**: Python 3.11
- **Root Directory**: `backend`
- **Build Command**: `pip install --upgrade pip && pip install -r requirements.txt`
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Health Check Path**: `/api/v1/health`
- **Environment Variables**:
  - `DATABASE_URL`: Your Supabase transaction pooler URI.
  - `SUPABASE_URL`: `https://[PROJECT-REF].supabase.co`
  - `SUPABASE_ANON_KEY`: Supabase anon key
  - `SUPABASE_JWT_SECRET`: Supabase JWT secret
  - `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key
  - `GEMINI_API_KEY`: Production Google AI Studio API key
  - `CORS_ORIGINS`: `["https://govexa.vercel.app"]`
  - `ENVIRONMENT`: `production`

### 2. Background Worker (`govexa-watchdog-worker`)
- **Runtime**: Python 3.11
- **Root Directory**: `backend`
- **Build Command**: `pip install --upgrade pip && pip install -r requirements.txt`
- **Start Command**: `python -m app.worker --daemon --interval 3600`
- **Environment Variables**: Same as web service.

---

## 4. Production Deployment: Vercel (Frontend)

1. **Import Git Repository**:
   - Connect your GitHub repository to Vercel.
2. **Project Settings**:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. **Configure Environment Variables**:
   - `VITE_API_BASE_URL`: `https://govexa-api.onrender.com/api/v1`
   - `VITE_SUPABASE_URL`: `https://[PROJECT-REF].supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `[YOUR_ANON_KEY]`
   - `VITE_ENABLE_MOCK_FALLBACK`: `false`
4. **Deploy**:
   - Click **Deploy**. Vercel will automatically read `frontend/vercel.json` for SPA rewrites and security headers.
