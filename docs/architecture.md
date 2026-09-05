# MerchantAgent - Technical Architecture

This document describes the technical implementation of MerchantAgent: stack choices, data strategy, agent execution lifecycle, and core database models.

---

## 1. Tech Stack

| Layer | Choice | Rationale |
| :--- | :--- | :--- |
| **Backend & Agent Engine** | Python + FastAPI + **PydanticAI** | Type-safe dependency injection, structured tool calling, and streaming agent execution with OpenAI-compatible providers (Sarvam 105B). |
| **Frontend** | **Next.js 16 (App Router) + React 19 + Tailwind 4 + shadcn/ui + TanStack Query + Zustand** | Server and client component architecture with dual portal routing: merchant copilot and customer shopfront. |
| **Database** | **PostgreSQL 16 + pgvector** | Unified relational and semantic datastore. Relational tables store transactional entities; vector indexes store semantic catalog and conversational memory. |
| **Vector Embeddings** | **FastEmbed (`bge-small-en-v1.5`)** | Local, fast 384-dimensional dense embeddings without external API latency or billing overhead. |
| **Cache & Sessions** | **Redis 7** | Centralized store for JWT refresh token rotation, token blocklisting, and rapid rate-limit counters. |
| **Payments** | **Razorpay Python SDK** | Real test-mode payment link generation, idempotent webhook receipt, and payment verification. |
| **Realtime** | **WebSockets + Server-Sent Events (SSE)** | WebSockets for bidirectional customer shopfront chat; SSE for word-by-word streaming in merchant copilot. |
| **Speech** | **Web Speech API + Edge-TTS** | Browser-native speech recognition for Hinglish/English voice input; Microsoft Edge neural TTS fallback for voice responses. |
| **TTS Service** | **node-edge-tts** (Microsoft Edge neural voices) | Free, no API key, 8 Indian languages. Default voice `hi-IN-Madhur`. |

### Core AI Model - Sarvam AI

| Property | Value |
| :--- | :--- |
| **Provider** | [Sarvam AI](https://www.sarvam.ai/) |
| **Model** | `sarvam-m4` (105B parameters) |
| **API Endpoint** | `https://api.sarvam.ai/v1` (OpenAI-compatible) |
| **Context Window** | 128K tokens |
| **Agent Settings** | `max_tokens=4096` per response |
| **Languages** | English, Hindi, Hinglish (native multilingual) |

Sarvam was chosen over GPT-4o / Claude because:
1. **Indian language fluency** - native Hinglish understanding, not translation-layer quality. A kirana merchant typing "Rajesh ke liye 500 ka link bhej do" gets parsed correctly on the first try.
2. **Cost** - significantly cheaper per token than frontier models for the same Hindi/Hinglish accuracy.
3. **OpenAI-compatible API** - PydanticAI's `OpenAIModel` adapter connects directly via `base_url`, zero custom integration code.

The agent is configured in [`base_agent.py`](file:///D:/coding/project/ADVANCED/MerchantAgnet/merchant-agent/apps/backend/app/agents/base_agent.py) with `ModelSettings(max_tokens=8192)` to prevent stream truncation on detailed financial reports.

**Deliberate cuts:** Go, gRPC, protobufs, a second AI framework (LangGraph/CrewAI), WhatsApp Business API (costs money), multi-service split. Every one was cut because it costs build time without adding value.

---

## 2. System Architecture

```text
                              ┌────────────────────────────┐
                              │       Next.js Frontend      │
                              │  Merchant App  │  Customer   │
                              │  (SSE stream)  │  Portal(WS) │
                              └──────────┬─────────┬────────┘
                                         │         │
                              ┌──────────▼─────────▼────────┐
                              │        FastAPI Backend       │
                              │   Auth · Orders · Payments   │
                              │   Campaigns · Audit Log      │
                              └───┬───────────────────┬──────┘
                                  │                   │
                    ┌─────────────▼───────┐   ┌───────▼─────────────┐
                    │   PydanticAI Agents   │   │   Razorpay (Test)   │
                    │  Merchant persona     │   │  Payment links       │
                    │  Customer persona     │   │  Settlement sync     │
                    │  25 tools, one call   │   └──────────────────────┘
                    │  each, per request    │
                    └──────────┬────────────┘
                                │
                    ┌───────────▼────────────┐
                    │   PostgreSQL + pgvector │
                    │   Structured data +     │
                    │   catalog embeddings    │
                    │   (local, no API cost)  │
                    └─────────────────────────┘
```

The whole thing runs on one database, doing double duty as both the regular relational store and the vector store for semantic catalog search. No separate vector database, no second service to keep alive. The merchant-facing chat streams over Server-Sent Events (one-way flow). The customer-facing chat runs over WebSocket (bidirectional - customer, shop owner, and agent may all be in the same thread).

---

## 3. Data Strategy - Exact vs. Semantic

| Data Entity | Storage Mechanism | Architectural Decision |
| :--- | :--- | :--- |
| **Merchant Profiles** | PostgreSQL table | Exact relational lookups (business type, contact, UPI VPA, Razorpay credentials). |
| **Products & Inventory** | PostgreSQL table | **Strictly exact** - prices, cost margins, and stock levels are never approximated via vector similarity. |
| **Payment Links & Orders** | PostgreSQL table | Strict ACID transactional records with status transitions (`unpaid` → `paid` → `cancelled`). |
| **Campaigns & Targets** | PostgreSQL table | Transactional approval gates and per-customer delivery tracking. |
| **Audit Logs** | PostgreSQL table | Immutable, append-only logs of every agent action and tool execution. |
| **Chat Memory** | PostgreSQL + pgvector (384-dim) | Hybrid recall: recent 2 turns loaded directly into context; semantic search over older turns when relevant. |

Rule: Financial figures, pricing, and stock availability always use exact SQL queries. Embeddings are used exclusively for semantic knowledge retrieval and conversational continuity.

---

## 4. Dual-Agent Architecture & Routing

```text
                                 [Incoming User Request]
                                            │
                    ┌───────────────────────┴───────────────────────┐
                    ▼                                               ▼
         [Merchant Owner (/chat)]                       [Customer (/shops/[id])]
                    │                                               │
             Transport: SSE                                  Transport: WebSocket
                    │                                               │
           [merchant_agent]                                 [customer_agent]
                    │                                               │
   Tools (25):                                     Tools (3):
   - Catalog (2)                                   - get_store_products
   - Products (3)                                  - place_order
   - Expenses (4)                                  - request_payment_link
   - Customers (3)
   - Orders (3)
   - Payment Links (3)
   - Campaigns (1)
   - Audit (1)
   - Analytics (5)
```

### Merchant Agent Execution Lifecycle
1. Assemble store profile, recent turns (capped at last 2 turns, 500 char per response), and target customer context.
2. Stream tokens over SSE (`/agent/chat/stream`) with `ModelSettings(max_tokens=8192)`.
3. If an upstream LLM provider closes the stream after tool invocation, an automatic non-streaming fallback runs `merchant_agent.run(...)` and streams synthesized tokens to maintain UI typing cadence.
4. Record completion, latency, and tool invocations in the `agent_runs` audit table.

### Customer Agent Execution Lifecycle
1. Load store context and verified customer identity.
2. Maintain a strict intent gate:
   - Inquiries about products or payment methods return conversational answers with markdown tables. Order tools are **never** triggered on questions.
   - Explicit purchase commands trigger a verified sequence: `get_store_products` → `place_order` → `request_payment_link`.
3. Broadcast the final message to the customer's WebSocket connection and log the turn.

---

## 5. Core Database Models

```sql
merchants
  id (UUID), user_id, business_name, business_type, upi_vpa,
  is_razorpay_active, created_at, updated_at

products
  id (UUID), merchant_id, product_name, cost_price, selling_price,
  current_stock, low_stock_threshold, is_active, created_at, updated_at

orders
  id (UUID), merchant_id, customer_id, customer_connection_id,
  total_amount, paid_amount, status (unpaid | paid | cancelled),
  created_at, updated_at

order_items
  id (UUID), order_id, product_id, product_name_snapshot,
  quantity, unit_price_snapshot, total_price

payment_links
  id (UUID), merchant_id, customer_id, razorpay_link_id, razorpay_link_url,
  amount, currency, status (created | paid | expired | cancelled), created_at

campaigns
  id (UUID), merchant_id, offer_description, segment_description,
  discount_percent, status (draft | approved | sending | sent | cancelled)

campaign_targets
  id (UUID), campaign_id, customer_connection_id, message_content,
  payment_link_id, send_status (pending | sent | failed)

audit_logs
  id (UUID), merchant_id, user_id, action, entity_type, entity_id,
  details (JSONB), created_at

knowledge_embeddings
  id (UUID), merchant_id, content, embedding vector(384),
  metadata (JSONB), created_at

agent_runs
  id (UUID), merchant_id, user_id, user_prompt, agent_response,
  tools_invoked (JSONB), latency_ms, status, error_detail, created_at

expenses
  id (UUID), merchant_id, category, description, amount,
  frequency (monthly | one-time), created_at, updated_at
```

---

## 6. Security Architecture

- **JWT Access + Refresh Token Rotation**: Access tokens expire every 15 minutes. Refresh tokens (Redis-backed, 7-day TTL) rotate on use. Concurrent 401s handled via module-level `isRefreshing` mutex + `failedQueue` pattern in `fetchClient.ts`.
- **Razorpay Keys Encrypted at Rest**: Fernet symmetric encryption for `razorpay_key_secret_encrypted` column.
- **Persona Role Guards**: `UserRole.customer` vs `UserRole.merchant` - customer persona cannot access merchant-only tools.
- **HMAC-SHA256 Payment Verification**: Razorpay webhook signatures verified server-side before marking payments as paid.
- **Rate Limiting**: Forgot-password endpoint limited to 5 attempts per 15 minutes.
- **No Secrets in Code**: All credentials via `.env`, never committed.
