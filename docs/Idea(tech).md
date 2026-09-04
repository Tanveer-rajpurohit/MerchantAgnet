# MerchantAgent — Technical Architecture

This document describes the technical implementation of MerchantAgent: stack choices, data strategy, tool schemas, and agent execution lifecycle.

---

## 1. Tech Stack

| Layer | Choice | Rationale |
| :--- | :--- | :--- |
| **Backend & Agent Engine** | Python + FastAPI + **PydanticAI** | Type-safe dependency injection, structured tool calling, and streaming agent execution with OpenAI-compatible providers (Cerebras, Groq, Sarvam). |
| **Frontend** | **Next.js 16 (App Router) + Tailwind CSS** | Server and client component architecture with dual portal routing: merchant copilot and customer shopfront. |
| **Database** | **PostgreSQL 16 + pgvector** | Unified relational and semantic datastore. Relational tables store transactional entities; vector indexes store semantic catalog and conversational memory. |
| **Vector Embeddings** | **FastEmbed (`bge-small-en-v1.5`)** | Local, fast 384-dimensional dense embeddings without external API latency or billing overhead. |
| **Cache & Sessions** | **Redis 7** | Centralized store for JWT refresh token rotation, token blocklisting, and rapid rate-limit counters. |
| **Payments** | **Razorpay Python SDK** | Real test-mode payment link generation, idempotent webhook receipt, and payment verification. |
| **Realtime** | **WebSockets + Server-Sent Events (SSE)** | WebSockets for bidirectional customer shopfront chat; SSE for word-by-word streaming in merchant copilot. |
| **Speech** | **Web Speech API + Edge-TTS** | Browser-native speech recognition for Hinglish/English voice input; Microsoft Edge neural TTS fallback for voice responses. |

---

## 2. Data Strategy — Exact vs. Semantic

| Data Entity | Storage Mechanism | Architectural Decision |
| :--- | :--- | :--- |
| **Merchant Profiles** | PostgreSQL table | Exact relational lookups (business type, contact, UPI VPA, Razorpay credentials). |
| **Products & Inventory** | PostgreSQL table | **Strictly exact** — prices, cost margins, and stock levels are never approximated via vector similarity. |
| **Payment Links & Orders** | PostgreSQL table | Strict ACID transactional records with status transitions (`unpaid` $\rightarrow$ `paid` $\rightarrow$ `cancelled`). |
| **Campaigns & Targets** | PostgreSQL table | Transactional approval gates and per-customer delivery tracking. |
| **Audit Logs** | PostgreSQL table | Immutable, append-only logs of every agent action and tool execution. |
| **Chat Memory** | PostgreSQL + pgvector (384-dim) | Hybrid recall: recent 2–3 turns loaded directly into context; semantic search over older turns when relevant. |

Rule: Financial figures, pricing, and stock availability always use exact SQL queries. Embeddings are used exclusively for semantic knowledge retrieval and conversational continuity.

---

## 3. Dual-Agent Architecture & Routing

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
   Tools:                                          Tools:
   - get_product_catalog                           - get_store_products
   - record_expense / get_expenses                 - place_order
   - list_orders / update_order_status             - request_payment_link
   - create_order
   - create_payment_link
   - create_campaign
   - get_audit_log
```

### 1. Merchant Agent Execution Lifecycle
1. Assemble store profile, recent turns (capped at last 2 turns), and target customer context.
2. Stream tokens over SSE (`/agent/chat/stream`).
3. If an upstream LLM provider closes the stream after tool invocation, an automatic non-streaming fallback runs `merchant_agent.run(...)` and streams synthesized tokens to maintain UI typing cadence.
4. Record completion, latency, and tool invocations in the `agent_runs` audit table.

### 2. Customer Agent Execution Lifecycle
1. Load store context and verified customer identity.
2. Maintain a strict intent gate:
   - Inquiries about products or payment methods return conversational answers with markdown tables. Order tools are **never** triggered on questions.
   - Explicit purchase commands trigger a verified sequence: `get_store_products` $\rightarrow$ `place_order` $\rightarrow$ `request_payment_link`.
3. Broadcast the final message to the customer's WebSocket connection and log the turn.

---

## 4. Core Database Models

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
```
