# MerchantAgent Backend (FastAPI)

AI agent backend for Track 1 (AI Growth & Agentic Commerce) of the Razorpay Buildathon — a growth agent for small Indian merchants, with a catalog other AI agents can query.

## Tech Stack

- **Framework:** FastAPI 0.141
- **Database:** PostgreSQL + SQLAlchemy 2.0 (async, via `asyncpg`)
- **Migrations:** Alembic (async-configured)
- **Cache / sessions:** Redis (refresh token storage)
- **Auth:** JWT (access + refresh token rotation) + Google OAuth
- **File storage:** AWS S3 (avatars, assets)
- **Rate limiting:** Custom limiter in `app/core/rate_limiter.py`

## Prerequisites

Before Step 1 below, make sure these are actually running/available — the app will fail to start without them:
- **PostgreSQL** running locally (or a connection string to a hosted instance)
- **Redis** running locally (`redis-server`, or `docker run -p 6379:6379 redis`) — required for refresh tokens, not optional
- A **Google OAuth Client ID/Secret** (from Google Cloud Console) if you want Google sign-in to work — the app still runs without it, but that login path will fail
- An **AWS S3 bucket** + IAM credentials if you want avatar upload to work

## 1. Setup Virtual Environment

### Windows (PowerShell)
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

### Windows (Command Prompt)
```cmd
python -m venv venv
venv\Scripts\activate
```

### macOS / Linux
```bash
python3 -m venv venv
source venv/bin/activate
```

---

## 2. Install Dependencies

```bash
pip install -r requirements.txt
```

---

## 3. Environment Configuration

```bash
cp .env.example .env
```

Then fill in real values for `DATABASE_URL`, `REDIS_URL`, `SECRET_KEY` (generate a real random 32-byte value, don't ship the placeholder), and the Google/AWS credentials if you need those flows working locally.

---

## 4. Database Migrations (Alembic)

### Initialize Async Alembic (already configured)
```bash
alembic init -t async alembic
```

### Generate Migration from SQLAlchemy Models
```bash
alembic revision --autogenerate -m "your migration description"
```

### Apply Migrations to Database
```bash
alembic upgrade head
```

### Rollback Migration (if needed)
```bash
alembic downgrade -1
```

---

## 5. Run Development Server

```bash
uvicorn app.main:app --reload --port 8000
```

---

## 6. API Documentation & Health Check

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- Health Check: http://localhost:8000/health/

---

## Project Structure

```
app/
├── main.py                  # App factory, middleware, router mounting
├── core/
│   ├── config.py            # Settings (env vars)
│   ├── security.py          # Password hashing, JWT
│   ├── google_auth.py       # Google OAuth verification
│   ├── s3.py                # Avatar/asset upload
│   └── rate_limiter.py      # Request rate limiting
├── db/
│   ├── session.py           # Async Postgres engine + session
│   ├── redis.py             # Redis client (refresh tokens)
│   └── base.py              # SQLAlchemy declarative base
├── models/                  # SQLAlchemy ORM models
├── schemas/                 # Pydantic request/response models
├── routers/                 # HTTP endpoints (auth, profile, onboarding, health)
├── services/                # Business logic
└── repositories/            # DB queries
```

## What's Implemented So Far

- **Auth** — register, login, Google OAuth, JWT access + refresh token rotation (Redis-backed), rate-limited on sensitive routes
- **Profile** — view/edit profile, avatar upload to S3
- **Onboarding** — merchant business profile, products, expenses, AI context (`info_ai`)
- **Products** — full CRUD repository layer

## Not Yet Implemented

- Payment links (Razorpay test-mode integration)
- Campaigns + approval gating
- Customer connections + conversations (chat)
- Orders + order status history
- Audit log
- The actual Claude Agent SDK integration for the chat agent itself

See `docs/Database Design.md` and `docs/db-schema-addendum-remaining-tables.md` for the schema these still need.