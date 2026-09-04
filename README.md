# MerchantAgent

An autonomous growth copilot and agentic commerce engine for Indian local merchants, kirana stores, and D2C brands. Built for Track 1 (AI Growth & Agentic Commerce) of the Razorpay Buildathon.

## Overview

Most small merchants in India run their sales on WhatsApp and phone calls rather than complex ERPs. MerchantAgent provides:

1. **Merchant Operations Copilot**: An AI assistant that queries catalogs, tracks stock, records expenses, inspects orders, generates Razorpay payment links, drafts segmented marketing campaigns, and tracks financial health via voice or text.
2. **Customer Shopfront Assistant**: An interactive AI store assistant accessible to shoppers via web and WebSockets to browse inventory, check stock and pricing, place direct orders, and pay through Razorpay.
3. **Multi-Tenant Isolation**: Strict merchant-scoped data partitions across catalogs, orders, customers, campaigns, and audit logs.

## Monorepo Architecture

```
merchant-agent/
├── apps/
│   ├── web/                 # Next.js 16 (Turbopack) frontend (port 3001)
│   ├── backend/             # FastAPI + PydanticAI backend (port 8000)
│   └── tts-service/         # Node.js Edge-TTS neural speech service (port 3004)
├── packages/
│   ├── ui/                  # Shared React component library
│   ├── tailwind-config/     # Shared Tailwind design tokens
│   ├── eslint-config/       # Linting presets
│   └── typescript-config/   # Strict TypeScript configuration
├── docs/
│   ├── Idea.md              # Product concept and domain problems
│   ├── Idea(tech).md        # Technical architecture and data models
│   └── Database Design.md   # PostgreSQL schema & relationships
└── turbo.json
```

## Quick Start

### 1. Prerequisites
- **Node.js** >= 20 and **pnpm** >= 9
- **Python** >= 3.11
- **PostgreSQL** 16 with `pgvector` extension enabled
- **Redis** running locally on port 6379 (used for JWT refresh token rotation)
- **Razorpay** test-mode API keys

### 2. Backend Setup
```bash
cd apps/backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```
API Documentation: http://localhost:8000/docs

### 3. Frontend Setup
```bash
cd apps/web
pnpm install
pnpm dev
```
Web App: http://localhost:3001

### 4. Optional TTS Speech Service
```bash
cd apps/tts-service
pnpm install
pnpm start
```
Edge TTS Service: http://localhost:3004

## System Architecture

```text
[Customer / Shopper] ──(WebSockets)──> [FastAPI /ws/chat] ──> [customer_agent (PydanticAI)]
                                                                    │
                                                                    ├── get_store_products
                                                                    ├── place_order
                                                                    └── request_payment_link

[Merchant Owner]    ──(SSE Stream)───> [FastAPI /agent/stream] ──> [merchant_agent (PydanticAI)]
                                                                    │
                                                                    ├── catalog & expenses tools
                                                                    ├── campaign draft tools
                                                                    └── order & payment link tools
```

## Implementation Status

- **Authentication & Security**: Email/password + Google OAuth, JWT rotation with Redis blocklist, Argon2/bcrypt password hashing, rate limiting.
- **Merchant Copilot**: PydanticAI streaming agent over SSE with automatic tool fallback, 23 backend operational tools, session history, voice input (speech-to-text) and neural text-to-speech.
- **Customer Shopfront**: Dedicated customer agent over WebSockets with intent-gated order placement, catalog verification, and payment link checkout.
- **Razorpay Integration**: Real test-mode payment links, automatic webhook verification, idempotency handling, and payment success reconciliation.
- **Campaign Engine**: Customer segmentation, AI drafting, merchant human-in-the-loop approval gate, and automated direct delivery into customer chat connections.
- **Audit & Analytics**: Immutable audit logs for all financial and agent actions, daily expense tracking, and order analytics.