# MerchantAgent Backend (FastAPI + PydanticAI)

Backend service for MerchantAgent: powering both the merchant management copilot and the customer shopfront AI.

## Tech Stack

- **Framework:** FastAPI 0.115+
- **AI Agent Engine:** PydanticAI with OpenAI-compatible inference providers (Cerebras / Groq / Sarvam)
- **Database:** PostgreSQL 16 with pgvector extension (via async SQLAlchemy 2.0 and `asyncpg`)
- **Embeddings:** FastEmbed (`BAAI/bge-small-en-v1.5`, 384 dimensions)
- **Migrations:** Alembic (async configured)
- **Cache & Token Storage:** Redis 7 (JWT refresh tokens, session revocation)
- **Payments:** Razorpay Python SDK (test-mode payment links, webhooks, signature verification)
- **Realtime:** WebSockets (`/ws/chat/{connection_id}`) for customer-store communication; SSE (`/agent/chat/stream`) for merchant copilot streaming

## Prerequisites

Ensure the following services are running:
- **PostgreSQL 16** with pgvector:
  ```bash
  psql -U postgres -c "CREATE EXTENSION IF NOT EXISTS vector;"
  ```
- **Redis**:
  ```bash
  docker run -d -p 6379:6379 --name merchant-redis redis:7-alpine
  ```
- **Razorpay Test Keys**: `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`

## Setup & Running

### 1. Create Virtual Environment
```bash
# Windows
python -m venv venv
.\venv\Scripts\activate

# macOS / Linux
python3 -m venv venv
source venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Environment Variables
```bash
cp .env.example .env
```
Ensure `DATABASE_URL`, `REDIS_URL`, `SECRET_KEY`, `AGENT_API_KEY`, `AGENT_BASE_URL`, and `RAZORPAY_*` keys are set.

### 4. Database Migrations
```bash
alembic upgrade head
```

### 5. Run Server
```bash
uvicorn app.main:app --reload --port 8000
```
- Interactive Swagger docs: http://localhost:8000/docs
- Health endpoint: http://localhost:8000/health/

## Directory Structure

```
apps/backend/app/
├── main.py                  # Application factory, middleware, router registration
├── core/
│   ├── config.py            # Pydantic Settings
│   ├── security.py          # JWT, Argon2/bcrypt password hashing
│   └── rate_limiter.py      # Token-bucket endpoint rate limiting
├── db/
│   ├── session.py           # Async SQLAlchemy engine & AsyncSessionLocal
│   ├── redis.py             # Redis async connection pool
│   └── base.py              # Base metadata
├── models/                  # Declarative SQLAlchemy models (users, merchants, products, orders, etc.)
├── schemas/                 # Pydantic validation schemas
├── routers/                 # Modular API endpoints
│   ├── auth/                # Register, login, refresh, me
│   ├── profile/             # Merchant profile & settings
│   ├── onboarding/          # Stepwise merchant setup
│   ├── products/            # Catalog CRUD & low-stock filtering
│   ├── expenses/            # Daily operational expense logging
│   ├── customers/           # Merchant customer connections & metrics
│   ├── orders/              # Orders, items, status transitions
│   ├── payment_links/       # Merchant and customer payment link views
│   ├── campaigns/           # Campaign generation, approve/decline gates
│   ├── audit/               # Immutable compliance and action logs
│   ├── agent/               # SSE chat streaming, session history, rename/delete
│   ├── shops/               # Public customer store directory & catalog
│   └── websockets/          # Real-time WebSocket customer chat room
├── agents/                  # AI agent definitions
│   ├── pydanticai_tool.py   # merchant_agent definition and tool registry
│   ├── customer_agent.py    # Dedicated customer shopfront agent
│   ├── prompts.py           # Merchant copilot system prompts
│   ├── customer_prompt.py   # Customer shopfront system prompts
│   └── tools/               # 23 isolated domain tools
└── services/                # Business logic and cross-domain orchestration
```

## Dual-Agent Architecture

1. **Merchant Admin Agent (`merchant_agent`)**:
   - Streams text and structured card payloads via SSE to `/api/v1/agent/chat/stream`.
   - Equipped with tools for product management, stock inquiry, expense recording, customer search, order creation, and marketing campaign drafting.
   - Includes automatic non-streaming tool-resolution fallback to maintain uninterrupted typing cadence even when upstream LLM providers close streaming on tool calls.
2. **Customer Shopfront Agent (`customer_agent`)**:
   - Operates over persistent WebSockets (`/ws/chat/{connection_id}`).
   - Strictly intent-gated: answers catalog and payment inquiries conversationally; invokes order creation (`place_order`) and checkout links (`request_payment_link`) only upon explicit customer buying commands.