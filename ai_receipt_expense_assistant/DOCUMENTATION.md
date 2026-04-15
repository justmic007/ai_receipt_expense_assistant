# ReceiptAI — Full Project Documentation

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Backend](#3-backend)
4. [Frontend](#4-frontend)
5. [Database & Migrations](#5-database--migrations)
6. [AI Extraction](#6-ai-extraction)
7. [Authentication & Email](#7-authentication--email)
8. [Environment Variables](#8-environment-variables)
9. [Local Development](#9-local-development)
10. [Deployment](#10-deployment)

---

## 1. Project Overview

ReceiptAI is a full-stack web app that lets users upload receipt images or PDFs, automatically extracts structured data (merchant, amount, date, line items) using AI vision models, and tracks expenses over time with charts and export features.

- Frontend: https://usereceiptai.vercel.app
- Backend: Deployed on Render

---

## 2. Architecture

```
ai_receipt_expense_assistant/
├── backend/          # Python / FastAPI
├── frontend/         # Next.js
├── docker-compose.yml
└── .github/workflows/deploy.yml
```

The backend follows a feature-based structure — every concern (model, schema, router, service) for a feature lives in one folder. Features never import from each other; shared utilities live in `shared/`.

```
backend/app/
├── core/             # config, database, security, dependencies
├── features/
│   ├── auth/         # register, login, email verification
│   ├── receipts/     # upload, AI extraction, batch processing
│   └── expenses/     # auto-created from receipts, export
└── shared/           # exceptions, pagination, storage, location
```

---

## 3. Backend

### Stack
- Python 3.11
- FastAPI
- SQLAlchemy (ORM)
- Alembic (migrations)
- PostgreSQL (Neon in production)
- slowapi (rate limiting)
- python-jose (JWT)
- passlib + bcrypt (password hashing)
- httpx (Brevo HTTP API for transactional email)

### Entry Point
`app/main.py` — initialises FastAPI, registers CORS middleware, rate limiter, and includes the three routers under `/api/v1`.

### Core Layer (`app/core/`)

| File | Purpose |
|------|---------|
| `config.py` | Loads all env vars via pydantic-settings. Single `settings` object used everywhere. |
| `database.py` | Creates SQLAlchemy engine with connection pooling (`pool_size=10`, `max_overflow=20`). |
| `security.py` | `hash_password`, `verify_password`, `create_access_token`, `create_refresh_token`, `decode_token`. |
| `dependencies.py` | FastAPI dependencies: `get_db`, `get_current_user_id`, `get_current_admin`. |

### Auth Feature (`app/features/auth/`)

| File | Purpose |
|------|---------|
| `models.py` | `User` and `UserActivity` SQLAlchemy models. |
| `schemas.py` | Pydantic schemas: `UserRegister`, `UserLogin`, `UserResponse`, `TokenResponse`. |
| `router.py` | `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `GET /auth/me`, `GET /auth/verify-email`, `GET /auth/admin/activity`. |
| `service.py` | `create_user` (hashes password, generates verification token, sends email), `authenticate_user`, `verify_email`. |

### Receipts Feature (`app/features/receipts/`)

| File | Purpose |
|------|---------|
| `models.py` | `Receipt` and `ReceiptBatch` models. |
| `schemas.py` | `ReceiptResponse`, `ReceiptListResponse`, `BatchStatusResponse`. |
| `router.py` | `POST /receipts/upload` (single, 10/min rate limit), `POST /receipts/batch` (max 3 files, 5/min), `GET /receipts/batch/{id}`, `GET /receipts`, `GET /receipts/{id}`, `POST /receipts/{id}/retry`, `GET /receipts/export`. |
| `service.py` | `process_receipt` (calls AI extractor, saves result, creates expense), `create_batch` (spawns background thread for serial processing with 5s delay between receipts), `get_batch_status`, `get_user_receipts`. |
| `ai_extractor.py` | Sends receipt image to OpenRouter vision models, parses JSON response. See section 6. |

### Expenses Feature (`app/features/expenses/`)

| File | Purpose |
|------|---------|
| `models.py` | `Expense` model. |
| `schemas.py` | `ExpenseResponse`, `ExpenseUpdate`, `ExpenseListResponse`, `SpendSummary`. |
| `router.py` | `GET /expenses`, `GET /expenses/summary`, `GET /expenses/export`, `GET /expenses/{id}`, `PATCH /expenses/{id}`. |
| `service.py` | `create_expense_from_receipt` (auto-called after receipt processing), `get_spend_summary` (aggregates by category), `update_expense`. |
| `export.py` | Generates Excel (openpyxl) and PDF (reportlab) exports. |

### Shared (`app/shared/`)

| File | Purpose |
|------|---------|
| `exceptions.py` | `NotFoundError`, `ConflictError`, `ForbiddenError`, `UnprocessableError` — all extend `HTTPException`. |
| `storage.py` | Google Cloud Storage helpers for file upload/download. |
| `location.py` | IP geolocation for login activity tracking. |
| `pagination.py` | Reusable pagination utilities. |

### API Docs
Available at `/api/docs` (Swagger) and `/api/redoc` when the backend is running.

---

## 4. Frontend

### Stack
- Next.js 16 (App Router)
- Redux Toolkit (auth state)
- TanStack Query (server state, caching)
- Axios (HTTP client with interceptors)
- Tailwind CSS

### Structure

```
frontend/
├── app/
│   ├── (auth)/           # login, register, verify-email pages
│   └── (dashboard)/      # dashboard, receipts, expenses, summary pages
├── components/
│   ├── dashboard/        # StatCards, SpendChart, RecentReceipts
│   ├── receipts/         # UploadDropzone, ReceiptCard, ReceiptDetail
│   ├── expenses/         # ExpenseTable, CategoryChart, SpendSummary
│   ├── layout/           # Navbar, Sidebar
│   └── shared/           # ExportModal
├── lib/
│   ├── api.js            # Axios instance with JWT injection + token refresh interceptor
│   ├── hooks/            # useAuth, useReceipts, useExpenses
│   └── utils.js
└── store/
    ├── index.js          # Redux store
    └── authSlice.js      # auth state: user, accessToken, isAuthenticated, isLoading
```

### API Client (`lib/api.js`)
- Base URL from `NEXT_PUBLIC_API_URL` env var
- Request interceptor: injects `Authorization: Bearer <token>` from localStorage on every request
- Response interceptor: on 401, automatically attempts token refresh using the stored refresh token. If refresh fails, clears tokens and redirects to `/login`. Queues concurrent requests during refresh to avoid race conditions.

### Auth State (`store/authSlice.js`)
Redux slice with four actions:
- `setCredentials` — stores user + tokens in state and localStorage after login/register
- `setUser` — updates user object (e.g. after `/auth/me`)
- `setLoading` — controls loading spinner
- `logout` — clears state and localStorage

### Data Fetching (`lib/hooks/`)
All data fetching uses TanStack Query:
- `useReceipts` / `useReceipt(id)` — fetch receipt list or single receipt
- `useUploadReceipt` — mutation that posts `multipart/form-data`, invalidates receipts + expenses cache on success
- `useBatchUpload` — posts multiple files, returns batch ID
- `useBatchStatus(batchId)` — polls every 5 seconds until batch status is `completed`
- `useExpenses` — fetch expense list
- `useAuth` — reads auth state from Redux

### Environment Variable
```
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api/v1
```

---

## 5. Database & Migrations

### Database
PostgreSQL. Locally via Docker or direct install. In production: Neon (serverless Postgres).

### ORM
SQLAlchemy with `declarative_base`. All models inherit from `Base` defined in `app/core/database.py`.

### Migrations (Alembic)
Config file: `backend/alembic.ini`
Migration scripts: `backend/migrations/versions/`

Common commands (run from `backend/`):
```bash
# Create a new migration after changing a model
alembic revision --autogenerate -m "describe your change"

# Apply all pending migrations
alembic upgrade head

# Roll back one migration
alembic downgrade -1
```

### Migration History
| Migration | Description |
|-----------|-------------|
| `b511afbc10ef` | Create users table |
| `676eac4a8b56` | Add email verification fields to users |
| `e78ce5ab1c51` | Create receipts table |
| `cefcde8c75d9` | Receipts table v2 |
| `6d1d5dda1683` | Create expenses table |
| `bc7e0f147051` | Add receipt_batches table |
| `b209d41a28cd` | Add model_used to receipts |
| `051de95fc875` | Add error_message to receipts |
| `b294910e145e` | Add is_admin to users + user_activity table |

---

## 6. AI Extraction

File: `backend/app/features/receipts/ai_extractor.py`

### How it works
1. Receipt file bytes are base64-encoded into a data URL
2. Sent to OpenRouter API with a structured extraction prompt
3. Response is parsed as JSON

### Models (tried in order, free tier)
```
google/gemma-3-27b-it:free
google/gemma-3-12b-it:free
google/gemma-3-4b-it:free
nvidia/nemotron-nano-12b-v2-vl:free
```

### Rate Limit Handling
- Each model tracks its own cooldown time from the `Retry-After` header in 429 responses
- If a model is rate limited, the extractor skips it and tries the next
- If all models are rate limited simultaneously, it waits for the shortest cooldown then retries
- Max 2 full passes through the model list before returning a failure

### Extracted Fields
```json
{
  "merchant_name": "string",
  "total_amount": 0.00,
  "currency": "NGN",
  "receipt_date": "YYYY-MM-DD",
  "category": "Food & Dining | Groceries | Transportation | Shopping | Entertainment | Healthcare | Utilities | Other",
  "line_items": [{ "name": "", "quantity": 1, "unit_price": 0.00, "total": 0.00 }]
}
```

### Batch Processing
Batch uploads (up to 3 files) are processed serially in a background thread with a 5-second delay between each receipt to respect rate limits. The frontend polls `GET /receipts/batch/{id}` every 5 seconds until status is `completed`.

---

## 7. Authentication & Email

### JWT Flow
1. User registers → account created with `is_verified=False`, verification email sent
2. User clicks link in email → `GET /auth/verify-email?token=...` → `is_verified=True`
3. User logs in → receives `access_token` (30 min) + `refresh_token` (7 days)
4. Frontend stores both in localStorage, injects access token on every request
5. On 401, frontend automatically calls `POST /auth/refresh` with the refresh token to get new tokens

### Email (Brevo HTTP API)
Uses Brevo's transactional email HTTP API via `httpx`. Works on Render's free tier (no SMTP port restrictions).

Requirements:
- Brevo account (free tier: 300 emails/month)
- Brevo API key from dashboard → SMTP & API → API Keys
- Sender email verified in Brevo dashboard → Senders

The verification email contains a button linking to:
```
{FRONTEND_URL}/verify-email?token={token}
```

If a user doesn't receive the verification email, they can request a resend from the login page.

---

## 8. Environment Variables

### Backend (`backend/.env`)
```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Security
JWT_SECRET_KEY=your-secret-key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# AI
OPENROUTER_API_KEY=sk-or-v1-...
ANTHROPIC_API_KEY=           # optional
GEMINI_API_KEY=              # optional

# Google Cloud Storage
GCS_BUCKET_NAME=
GCS_CREDENTIALS_PATH=

# Email
BREVO_API_KEY=your-brevo-api-key
GMAIL_USER=yourname@gmail.com   # used as sender address

# App
FRONTEND_URL=https://usereceiptai.vercel.app
ALLOWED_ORIGINS=http://localhost:3000,https://usereceiptai.vercel.app
DEBUG=False
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api/v1
```

---

## 9. Local Development

### Prerequisites
- Python 3.11 (via conda)
- Node.js 18+
- PostgreSQL running locally (or Docker)

### Backend Setup
```bash
# Create and activate conda environment
conda env create -f backend/environment.yml
conda activate receipt-assistant

# Copy env file and fill in values
cp backend/.env.example backend/.env

# Run migrations
cd backend
alembic upgrade head

# Start backend
uvicorn app.main:app --reload
# Runs at http://localhost:8000
# API docs at http://localhost:8000/api/docs
```

### Frontend Setup
```bash
cd frontend

# Install dependencies
yarn install

# Copy env file
cp .env.local.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

# Start frontend
yarn dev
# Runs at http://localhost:3000
```

### Add a new package (backend)
```bash
# Add to environment.yml, then:
conda env update -f environment.yml --prune
```

### Docker (optional — starts everything at once)
```bash
docker compose up
```

---

## 10. Deployment

### Backend — Render
- Service type: Web Service
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Environment variables: set all backend env vars in Render dashboard

After any code change:
```bash
git add .
git commit -m "your message"
git push
# Render auto-deploys on push to main
```

### Frontend — Vercel
- Connected to GitHub repo, auto-deploys on push to main
- Environment variable to set in Vercel dashboard:
  ```
  NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api/v1
  ```
- Live URL: https://usereceiptai.vercel.app

### Production Checklist
- [ ] `DEBUG=False` in Render env vars
- [ ] `ALLOWED_ORIGINS` includes only the Vercel URL (no localhost)
- [ ] `FRONTEND_URL` set to `https://usereceiptai.vercel.app`
- [ ] `DATABASE_URL` points to Neon production database
- [ ] `GMAIL_APP_PASSWORD` set (not your real Gmail password)
- [ ] `JWT_SECRET_KEY` is a strong random string
- [ ] Run `alembic upgrade head` against production DB after schema changes
