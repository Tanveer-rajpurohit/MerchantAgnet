# MerchantAgent — Technical Plan

Companion to `idea.md`. That doc is the concept. This one is execution-ready: stack, schema, tool signatures, folder structure, build order.

---

## 1. Tech Stack

| Layer            | Choice                                   | Why                                                                                                                                                                      |
| ---------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Backend + Agent  | Python + FastAPI + **Claude Agent SDK**  | Matches Razorpay's own production stack (their Agent Studio is built on it) — direct signal you understand their platform. Also matches your current FastAPI experience. |
| Frontend         | Next.js                                  | Two surfaces: merchant chat, customer checkout chat. Your strongest stack.                                                                                               |
| Database         | PostgreSQL + pgvector extension          | One database, not split services. Structured data in normal tables; chat/notes also embedded in the same DB via pgvector.                                                |
| Payments         | Razorpay Python SDK, test-mode keys      | Free, no KYC, no live money ever moves.                                                                                                                                  |
| Catalog exposure | Plain FastAPI tool + optional MCP server | MCP matches Razorpay's own developer surface (they run one). Build the plain tool first; wrap it as MCP if time allows.                                                  |
| Hosting (demo)   | Local / Railway / Render free tier       | No need for anything more for a 10-day build.                                                                                                                            |

**Explicitly not using:** Go, gRPC, protobufs, Redis, a second AI framework (LangGraph/CrewAI on top of the Agent SDK), WhatsApp Business API, multi-service split. One language, one service, one database — every one of these additions was cut specifically because it costs build time without adding anything the judging criteria reward.

---

## 2. Data Strategy — what's exact vs. what's semantic

| Data                         | Storage                                 | Why                                                                                            |
| ---------------------------- | --------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Business profile             | Postgres table                          | Fast, exact lookup                                                                             |
| Products / catalog / stock   | Postgres table **only**                 | Must be exact — an AI buyer agent asking "is this in stock" cannot get an approximate answer   |
| Payment links                | Postgres table                          | Transactional record                                                                           |
| Campaigns + approval batches | Postgres table                          | Transactional record                                                                           |
| Audit log                    | Postgres table                          | Must be exact and ordered                                                                      |
| Chat history                 | Postgres table **+ pgvector embedding** | Needs both exact recall (recent turns) and semantic recall (things outside the context window) |
| Free-text merchant notes     | Postgres table **+ pgvector embedding** | Unstructured — genuinely benefits from semantic search                                         |

Rule of thumb: if a wrong answer here could mean the wrong price, the wrong stock count, or a duplicate payment link — it's table-only, never solely reasoned over via vector similarity.

---

## 3. Context Package — what gets built on every chat turn

When a message comes in, assemble:

1. **Merchant profile** (Postgres, fetched once per session) — name, business type, language, city
2. **Recent-activity snapshot** (Postgres) — last ~5 payment links, last ~3 campaigns, last ~10 audit log entries
3. **Relevant memory** (pgvector) — top-k semantically relevant past chat turns / notes, only pulled if the current message seems to reference something outside the immediate window
4. **Live catalog state** (Postgres, fetched fresh every time — never cached or embedded, since stock changes)

This package becomes the system-prompt context injected into the Claude Agent SDK session for that turn.

---

## 4. Database Schema (core tables)

```sql
merchants
  id, business_name, business_type, city, preferred_language,
  owner_name, razorpay_key_id (encrypted), razorpay_key_secret (encrypted),
  created_at

products
  id, merchant_id, name, cost_price, selling_price,
  current_stock, low_stock_alert, description, created_at, updated_at

payment_links
  id, merchant_id, razorpay_link_id, amount, description,
  customer_name, status, created_at

campaigns
  id, merchant_id, segment_description, offer_description,
  status (draft | approved | sent), created_at, approved_at

campaign_targets
  id, campaign_id, customer_name, message, payment_link_id, send_status

audit_log
  id, merchant_id, action_type, input_json, output_json,
  success (bool), error_message, created_at

conversations
  id, merchant_id, role (user | agent), content, created_at

embeddings
  id, merchant_id, source_type (chat | note), source_id,
  content, embedding vector(1536), created_at
```

---

## 5. Agent Tool Signatures

```python
def create_payment_link(
    customer_name: str,
    amount: float,
    description: str,
    expiry_minutes: int | None = None,
) -> dict:
    """Returns: {link_url, razorpay_link_id, status}"""

def query_catalog(
    product_name: str | None = None,
    category: str | None = None,
    max_price: float | None = None,
    in_stock_only: bool = True,
) -> dict:
    """Returns: {products: [{name, price, stock, description}]}
    Exact table lookup only — no semantic matching here."""

def run_campaign(
    segment_description: str,
    offer_description: str,
    discount_percent: float | None = None,
) -> dict:
    """Drafts a per-customer batch, does NOT send anything.
    Returns: {batch_id, draft_targets: [{customer_name, message, amount}]}"""

def confirm_campaign(batch_id: str) -> dict:
    """Called only after explicit merchant approval of the draft batch.
    Returns: {sent_count, failed_count, links: [...]}"""
```

`query_catalog` is the one to wrap as an MCP tool if time allows — that's the piece that makes the catalog usable by an agent other than your own.

---

## 6. Folder Structure

```
merchant-agent/
├── web/                        # Next.js
│   └── app/
│       ├── merchant/page.tsx           # merchant-facing chat
│       └── checkout/[merchantId]/page.tsx  # customer-facing checkout chat
├── backend/                    # Python + FastAPI + Claude Agent SDK
│   ├── main.py
│   ├── agent/
│   │   ├── core_agent.py
│   │   └── tools/
│   │       ├── payment_link.py
│   │       ├── campaign.py
│   │       └── catalog.py
│   ├── mcp_server.py            # exposes query_catalog as an MCP tool
│   ├── db/
│   │   ├── models.py
│   │   └── schema.sql
│   └── services/
│       └── razorpay_client.py
├── .env
└── README.md
```

---

## 7. Build Order (10 days)

1. **Days 1–2** — FastAPI + Agent SDK skeleton; `create_payment_link` working end-to-end against real Razorpay test-mode
2. **Days 3–4** — catalog schema + `query_catalog`, ideally wrapped as MCP
3. **Days 5–6** — `run_campaign` / `confirm_campaign` with the approval-gate UI
4. **Days 7–8** — customer-facing checkout chat, closing the full loop
5. **Day 9** — audit log wired to every tool call; deliberately trigger one real failure (bad amount, simulated API timeout) and confirm it's handled gracefully
6. **Day 10** — demo polish, record the walkthrough, buffer for whatever breaks

Stretch items (Campaign Feed, WhatsApp, voice) only start after day 9 is genuinely done — not in parallel with it.
