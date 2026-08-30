# MerchantAgent

An AI agent that runs day-to-day growth actions for small Indian merchants — payment links, campaigns, checkout — while exposing their catalog in a form other AI agents can query. Built for **Track 1 (AI Growth & Agentic Commerce)** of the Razorpay Buildathon.

## Why this exists

Razorpay's own Agent Studio (Dispute Responder, Subscription Recovery, Abandoned Cart) plugs into merchants already on Shopify, Tally, or QuickBooks. Most small Indian merchants — kirana stores, local D2C, service businesses — run on WhatsApp and memory instead. This is an agent for that long tail.

## Monorepo Structure (Turborepo)

```
merchant-agent/
├── apps/
│   ├── web/                 # Next.js frontend — see apps/web/README.md
│   └── backend/              # FastAPI backend — see apps/backend/README.md
├── packages/
│   ├── ui/                   # Shared React component library
│   ├── tailwind-config/      # Shared design tokens (colors, fonts)
│   ├── eslint-config/
│   └── typescript-config/
├── docs/
│   ├── Idea.md                # Product concept, features, positioning
│   ├── Idea(tech).md          # Technical build plan
│   └── Database Design.md     # Full schema
└── turbo.json
```

## Quick Start

**Frontend:**
```bash
cd apps/web
pnpm install
pnpm dev
```
→ http://localhost:3000

**Backend:**
```bash
cd apps/backend
python -m venv venv && source venv/bin/activate   # or the Windows equivalent
pip install -r requirements.txt
cp .env.example .env    # fill in real values
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```
→ http://localhost:8000/docs

Full setup details, prerequisites (Postgres, Redis, Google OAuth, AWS S3), and current implementation status are in each app's own README.

## Status

Frontend is feature-complete for the demo flow (chat, orders, products, customers, payouts, audit log, both merchant and customer sides). Backend has auth, profile, and onboarding built; payment links, campaigns, chat/conversations, and the actual Claude Agent SDK integration are still in progress. See `apps/backend/README.md` → "Not Yet Implemented" for the current gap list.