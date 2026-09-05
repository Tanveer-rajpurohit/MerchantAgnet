# MerchantAgent

One AI agent that runs day-to-day operations for small Indian merchants — payments, orders, campaigns, catalog, expenses, analytics — over a simple chat in English, Hindi, or Hinglish. And on the other side, a matching agent customers can talk to, to browse a shop's catalog and check out with real Razorpay links.

Built for **Track 1 (AI Growth & Agentic Commerce)** of the Razorpay Buildathon.

---

## The Problem

Roughly 60 million small merchants in India run their business on WhatsApp and memory. Not Shopify. Not Tally. Not QuickBooks.

A regular customer wants to pay ₹500. The shopkeeper opens the Razorpay dashboard, fills in a form, copies a link, pastes it into WhatsApp. Five minutes gone, for one transaction. Diwali is coming and the shop wants to message twenty loyal customers? Open WhatsApp, type twenty separate messages, send each one. Someone asks if there's still milk in stock? Walk to the shelf and count. How much did I make today? Flip through a paper ledger.

Razorpay's own Agent Studio is built for merchants already on Shopify or Tally — it doesn't reach the merchant with a notebook.

---

## The Solution

A merchant talks to an AI agent like a person. The agent takes bounded, audited actions on the merchant's behalf — creates real Razorpay payment links, drafts campaigns (merchant approves before anything sends), answers stock questions, logs expenses, creates orders, runs financial reports. Every action is logged to an audit trail. Every money-moving step is gated behind the merchant's own approval.

The merchant's catalog is also exposed in a structured form so an external AI agent (a buyer's shopping assistant) could query it — making this "agentic commerce," not just a chatbot.

---

## What The Merchant Gets

- **"Send Rahul a ₹500 link"** → real Razorpay payment link created and handed back
- **"Run a Diwali offer for my last 20 customers"** → agent drafts the campaign, shows Approve/Decline buttons. Only the merchant can send it.
- **"How much did I make this month"** → real number from actual payment records
- **Log expenses, check stock, ask "what happened this week"** → all in the same chat
- **Speak instead of type** → Hindi or English voice input, 8 Indian voice outputs

25 tools across catalog, products, expenses, customers, orders, payments, campaigns, audit, and financial analytics.

## What The Customer Gets

- Browse a directory of local stores by category
- Chat with any store's AI to check stock, prices, and place orders
- Get a real Razorpay checkout link and pay right there
- See all orders, receipts, and payment status across every shop in one place

If the shop owner is online, they can jump into the same conversation and answer directly.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Backend | Python + FastAPI + PydanticAI |
| AI Model | Sarvam AI `sarvam-m4` (105B) — native Hindi/Hinglish |
| Database | PostgreSQL 16 + pgvector |
| Embeddings | fastembed (BAAI/bge-small-en-v1.5, 384-dim, local) |
| Cache | Redis 7 |
| Payments | Razorpay Python SDK (test mode) |
| Frontend | Next.js 16 + React 19 + Tailwind 4 + shadcn/ui |
| State | TanStack Query + Zustand |
| Realtime | SSE (merchant) + WebSocket (customer) |
| Voice | Web Speech API (input) + node-edge-tts (output) |

---

## Project Structure

```
merchant-agent/
├── apps/
│   ├── backend/          # FastAPI + PydanticAI (port 8000)
│   │   ├── app/
│   │   │   ├── agents/   # Agent definition, prompts, 25 tools
│   │   │   ├── api/      # REST endpoints + WebSocket handlers
│   │   │   ├── models/   # SQLAlchemy models
│   │   │   ├── services/ # Business logic + analytics
│   │   │   └── db/       # Database session + migrations
│   │   └── alembic/      # Schema migrations
│   ├── web/              # Next.js frontend (port 3001)
│   │   ├── app/
│   │   │   ├── (app)/    # Merchant dashboard, chat, settings
│   │   │   ├── (auth)/   # Login, register, forgot password
│   │   │   └── (customer)/ # Shop directory, storefront chat
│   │   ├── components/   # Shared UI components
│   │   ├── stores/       # Zustand state management
│   │   └── lib/api/      # API client, services, types
│   └── tts-service/      # Edge-TTS neural voice service (port 3004)
├── docs/                 # Architecture, functionality, test plan
└── packages/             # Shared configs (Tailwind, ESLint, TypeScript)
```

---

## Setup

### Prerequisites
- Node.js >= 20, pnpm >= 9
- Python >= 3.11
- PostgreSQL 16 with `pgvector` extension
- Redis on port 6379
- Razorpay test-mode API keys

### Backend
```bash
cd apps/backend
python -m venv venv
.\venv\Scripts\activate        # Windows
source venv/bin/activate       # macOS/Linux
pip install -r requirements.txt
cp .env.example .env           # Fill in your keys
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd apps/web
pnpm install
pnpm dev                       # http://localhost:3001
```

### TTS Service (optional)
```bash
cd apps/tts-service
pnpm install
pnpm start                     # http://localhost:3004
```

---

## How It Works

```
[Merchant] ──(chat)──> SSE stream ──> PydanticAI merchant_agent (25 tools)
                                            │
                                            ├── Razorpay: payment links, status sync
                                            ├── PostgreSQL: orders, catalog, expenses
                                            └── pgvector: semantic catalog search

[Customer] ──(chat)──> WebSocket ──> PydanticAI customer_agent (3 tools)
                                            │
                                            ├── Browse catalog, place orders
                                            └── Real checkout link → Razorpay payment
```

Every money-moving tool is called exactly once per request. Fingerprint deduplication prevents duplicate payment links, orders, or messages in the same turn. The campaign approval gate is non-optional — the agent drafts, only the merchant can approve and send.

---

## Documentation

| Doc | What's in it |
|---|---|
| [idea_final.md](docs/idea_final.md) | Complete product vision — problem, solution, functionality |
| [architecture.md](docs/architecture.md) | Technical stack, system design, database models |
| [functionality.md](docs/functionality.md) | All features, FR/NFR tables, tool inventory |
| [merchantagent-pitch.md](docs/merchantagent-pitch.md) | Narrative pitch |
| [test.md](docs/test.md) | End-to-end test plan (Categories A–T) |
| [Database Design.md](docs/Database%20Design.md) | PostgreSQL schema and relationships |