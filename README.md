# MerchantAgent

One AI agent that runs day-to-day operations for small Indian merchants: payments, orders, campaigns, catalog, expenses, analytics, over simple voice or text chat in English, Hindi, or Hinglish. And on the customer side, a dedicated storefront agent that buyers can talk to, allowing them to browse local catalogs, check stock, and check out with real Razorpay payment links.

Built for **Track 1 (AI Growth & Agentic Commerce)** of the Razorpay Buildathon.

---

## The Problem

Roughly 60 million small retail and kirana merchants across India run their business on WhatsApp, physical paper notebooks, and memory. Not Shopify. Not Tally. Not QuickBooks.

Existing platforms assume structured catalogs, cloud accounting software, and API integrations:
- A regular customer wants to pay ₹500: the merchant has to open the Razorpay dashboard, fill out a web form, copy the link, and paste it into WhatsApp.
- Festival season arrives: the merchant types twenty separate WhatsApp broadcast messages by hand.
- Stock inquiry: the merchant walks to the shelf to physically count packets.
- Daily earnings: flipping through pages of handwritten ledger notes.

**Razorpay's own Agent Studio is built for merchants already on Shopify or Tally: it doesn't reach the merchant with a notebook.**

Local merchants who operate with pen and paper need an AI partner that handles their routine operational workflows conversationally, without requiring them to learn complex dashboard software.

---

## The Solution

MerchantAgent gives local merchants an operational AI copilot powered by Sarvam AI and PydanticAI. The merchant talks or types in English, Hindi, or Hinglish. The agent takes bounded, audited actions:
- Creates verified Razorpay payment links instantly
- Manages inventory and alerts on low stock
- Drafts supplier purchase orders and restock notes
- Logs operating expenses and tracks customer udhaar
- Runs financial analytics and daily collections without manual math
- Drafts targeted WhatsApp promotions with a mandatory human approval gate

Simultaneously, MerchantAgent exposes the merchant's catalog as an interactive storefront. Any customer can discover local shops, chat with the shop's customer agent in their native language, and complete checkout with an active Razorpay payment link.

---

## What The Merchant Gets

- **"Send Rahul a ₹500 link"**: real Razorpay payment link created and returned in seconds.
- **"Run a Diwali offer for my last 20 customers"**: agent drafts the campaign and displays Approve and Decline buttons. Nothing sends without merchant approval.
- **"How much did I collect today"**: pure daily revenue calculation from real payment records.
- **"Log an expense of ₹250 for snacks"**: recorded into the financial ledger with an audit trail.
- **"Draft a restock note for low stock items"**: formatted supplier restock message ready for WhatsApp.
- **Speak instead of type**: native speech recognition and Indian neural voice synthesis.

25 specialized tools spanning inventory, orders, customer ledger, expenses, payment links, campaigns, audit logs, and analytics.

---

## What The Customer Gets

- Discover local neighborhood shops by category and location
- Conversational product search with real-time stock and price inquiries
- Direct order placement with an instant Razorpay checkout link
- Centralized customer portal tracking orders, receipts, and payment status across all connected stores

If the store owner is available, they can step into the conversation and assist the customer directly.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Backend | Python 3.13, FastAPI, PydanticAI |
| AI Model | Sarvam AI `sarvam-m4` (105B parameters), native Indic multilingual |
| Database | PostgreSQL 16 with `pgvector` extension |
| Embeddings | fastembed (BAAI/bge-small-en-v1.5, 384-dim, local inference) |
| Cache | Redis 7 |
| Payments | Razorpay Python SDK (Test Mode) |
| Frontend | Next.js 16, React 19, Tailwind CSS, shadcn/ui |
| State | TanStack Query, Zustand |
| Realtime | Server-Sent Events (Merchant Copilot), WebSockets (Customer Storefront) |
| Voice | Web Speech API (Input), Edge-TTS neural engine (Output) |

---

## Project Structure

```text
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

## Architecture Flow

```text
[Merchant] ──(Voice/Chat)──> SSE Stream ──> PydanticAI merchant_agent (25 tools)
                                                  │
                                                  ├── Razorpay: payment links, status sync
                                                  ├── PostgreSQL: orders, catalog, expenses
                                                  └── pgvector: semantic catalog search

[Customer] ──(Chat/Order)──> WebSocket ──> PydanticAI customer_agent (3 tools)
                                                  │
                                                  ├── Browse catalog, place orders
                                                  └── Real checkout link -> Razorpay payment
```

Every money-moving tool is executed with deduplication guards to prevent duplicate payment links or orders. The campaign approval gate is strictly enforced: the agent drafts the broadcast, but only the merchant can approve and initiate sending.

---

## Documentation

| Doc | What is in it |
|---|---|
| [idea_final.md](docs/idea_final.md) | Complete product vision: problem, solution, functionality |
| [architecture.md](docs/architecture.md) | Technical stack, system design, database models |
| [functionality.md](docs/functionality.md) | All features, FR and NFR tables, tool inventory |
| [merchantagent-pitch.md](docs/merchantagent-pitch.md) | Narrative pitch |
| [test.md](docs/test.md) | End-to-end test plan (Categories A through T) |
| [Database Design.md](docs/Database%20Design.md) | PostgreSQL schema and relationships |

---

## Scaling to 100K+ Users

The architecture includes a verified scaling path for high-volume production:

| Bottleneck | Current State | Production Path |
|---|---|---|
| **Database** | Single PostgreSQL for transactions, vectors, and analytics | **Read replicas** for heavy analytics queries. Financial summaries hit the replica, while transactional writes stay on primary. At 100K+ products, move vector indexes to a dedicated vector store (Qdrant or Pinecone). |
| **Agent Memory** | 2-turn memory cap (last 2 turns, 500 chars each) | **RAG over conversation history.** Store all past conversation turns in pgvector and semantically retrieve relevant turns per request instead of using a fixed turn window. |
| **25 Tools on 1 Agent** | Single PydanticAI agent with all tools | **Tool-cluster sub-agents.** Partition tools into specialized agents (catalog agent, finance agent, campaign agent) behind a lightweight router. |
| **LLM Provider** | Single Sarvam API endpoint | **Multi-provider fallback chain.** Sarvam -> GPT-4o -> Claude as backup providers with uniform prompt schemas. |
| **Backend** | Single FastAPI instance | **Horizontal ASGI scaling** behind a reverse proxy or load balancer. Stateless JWT and Redis tokens enable horizontal container scaling. |
| **WebSocket State** | In-memory connection manager | **Redis Pub/Sub backplane.** Publish customer storefront messages to Redis channels across all backend worker nodes. |
| **Token Refresh** | Client-side mutex with 10s timeout | Production ready: serializes concurrent refresh requests and fails fast if network drops. |