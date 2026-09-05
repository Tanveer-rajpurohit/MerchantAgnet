# MerchantAgent — Product Overview

> **Tagline:** An AI growth agent that runs day-to-day operations for small Indian merchants — payment links, campaigns, orders, catalog — over a simple chat, while exposing their catalog for other AI agents to query.

Built for **Track 1 (AI Growth & Agentic Commerce)** of the Razorpay Buildathon.

---

## 1. The Problem We Solve

India has ~60 million small merchants (kirana stores, local D2C, service businesses). They run on **WhatsApp + memory**, not Shopify/Tally/QuickBooks. Razorpay's own Agent Studio (Dispute Responder, Subscription Recovery, Abandoned Cart) is built for merchants already on modern commerce stacks — **it doesn't reach the long tail.**

The daily reality of a kirana merchant:
- "Send Rahul a ₹500 link" → manually log into Razorpay dashboard, fill a form, copy the link, paste into WhatsApp.
- "Run a Diwali offer for my last 20 customers" → open WhatsApp, type 20 separate messages, send each one.
- "Do I have enough milk to last the week?" → walk to the shelf and count.
- "How much did I earn today?" → flip through a paper ledger.

Every one of these takes 5–15 minutes of friction. MerchantAgent turns each into one chat message.

---

## 2. The Solution — One Chat, Full Operations

A merchant talks to an AI agent in **English, Hindi, or Hinglish**. The agent takes **bounded, audited actions** on the merchant's behalf — creates real Razorpay test-mode payment links, drafts and (after approval) sends campaigns, answers stock questions, logs expenses, creates orders. Every action is logged to an audit trail.

The merchant's catalog is also exposed in a structured form so an **external AI agent** (a buyer's shopping assistant) could query it too — making this "agentic commerce," not just "a chatbot for a merchant."

---

## 3. Core Functionalities (Features)

### 3.1 Dual AI Agent System

Two separate PydanticAI agents share one codebase but serve different people:

| Persona | Who | Powers | Where they chat |
|---|---|---|---|
| **merchant_admin** | The store owner | Full operational control — money, products, expenses, customers, campaigns | Merchant chat (SSE streaming) |
| **customer_shopfront** | An end customer browsing a store | Read catalog + request a checkout link only | Customer chat (WebSocket) |

A merchant speaks in names ("Rajesh"), never UUIDs. The agent resolves names + prices itself — it never asks the merchant for info it can look up.

### 3.2 Merchant Agent — 21 Tools (9 Functional Groups)

| Group | Tools | What they do |
|---|---|---|
| **Catalog** (both personas) | `get_product_catalog`, `search_store_knowledge` | Exact stock + prices; semantic search over vendor agreements/policies |
| **Products** (merchant) | `add_product`, `update_product`, `delete_product` | Full CRUD on the catalog — agent never says "I can't edit" |
| **Expenses** (merchant) | `record_expense`, `get_current_expenses`, `update_expense`, `delete_expense` | Log + edit + delete business expenses |
| **Customers** (merchant) | `get_recent_customers`, `resolve_customer`, `send_message_to_customer` | Find customers by name; broadcast messages to multiple customers at once |
| **Orders** (merchant) | `create_order`, `update_order_status`, `list_orders` | Auto-resolves customer name + product price from catalog; single-call discipline |
| **Payment Links** (both) | `create_payment_link`, `check_payment_status`, `list_payment_links` | Real Razorpay test-mode links; live status sync |
| **Campaigns** (merchant) | `create_campaign` | Drafts a campaign (DRAFT only) — merchant approves via UI |
| **Audit** (merchant) | `get_audit_log` | Full transparency — every agent + user action logged |
| **Analytics & Finance** (merchant only) | `get_daily_collection`, `get_customer_udhaar_ledger`, `get_store_revenue_report`, `get_store_earnings_analytics` | Accurate financial calculation for store revenue, daily cash register (today/yesterday), customer udhaar ledger with mobile numbers, and periodic revenue reports (week/month/year) with explicit date ranges (expenses handled exclusively by expense tools) |

**Key design rules enforced by the prompt:**
- **Proactive mandate:** never ask the merchant for UUIDs or prices — look them up.
- **Single-call discipline:** money-moving tools called exactly once per request.
- **Fingerprint dedup:** if the agent tries to create the same payment link / order / message twice in one turn, it returns the existing one — no duplicates.
- **Multi-customer pin:** merchant can select multiple customers in the UI and broadcast to all in one tool call.

### 3.3 Customer Agent — 3 Tools

| Tool | What it does |
|---|---|
| `get_customer_catalog` | Browse the store's products + prices |
| `place_order` | Create an order (auto-resolves product prices) |
| `request_payment_link` | Get a real Razorpay checkout link |

**Boundaries enforced:** the customer persona cannot see cost prices, supplier names, customer lists, or run campaigns. If asked, it refuses gracefully.

### 3.3.1 Customer Portal & Storefront Experience (`/shops`, `/user`)

The customer-facing portal bridges traditional kirana shopping with frictionless digital checkout:

1. **Public Storefront Directory (`/shops`):** Browse merchant stores categorized by sector (Grocery, D2C, Services, Restaurant) with live search by location or store name.
2. **AI Storefront Chat (`/shops/{slug}`):** In-chat assistant handling stock inquiries and checkout orders. It enforces strict boundary protection — retail prices only, no cost/margins, no supplier leaks.
3. **Unified Customer Payment Links (`/user/payment-links`):** Consolidated view of all payment links across every merchant, filtered by `All`, `Pending`, and `Paid`, with direct "Pay Now" actions.
4. **Order History & Udhaar Transparency (`/user/orders`):** Expandable itemized purchase receipts with live payment states (`Paid` / `Unpaid`). Protected with a read-only policy: customers cannot mutate merchant orders, instead using a "Request Change" modal to contact the store directly.
5. **Verified Checkout Receipt (`/payment-success`):** Automated Razorpay HMAC-SHA256 signature verification and printable/downloadable PDF tax invoices.

**Why Rigorous Verification of Customer Features Matters:**
- **Zero Wholesale Leakage:** Prevents prompt injection or inquiry attacks from discovering supplier identities or wholesale profit margins.
- **State Mutation Protection:** Guarantees customers cannot unilaterally cancel orders, alter product prices, or manipulate the merchant's ledger.
- **Role Isolation:** Ensures role guards (`UserRole.customer` vs `UserRole.merchant`) properly restrict private merchant endpoints while keeping customer-facing flows frictionless.
- **Ledger Reconcilliation:** Confirms payments made on Razorpay instantly update both the customer's portal and the merchant's operational dashboard without desync.

### 3.4 Campaign Orchestrator with Approval Gate

The **approval gate is non-optional** — it's the literal Razorpay buildathon judging bar ("every money-moving action is explainable, bounded, gated"):

1. Merchant says "Run a Diwali 10% off campaign for my last 20 customers"
2. Agent calls `get_recent_customers(20)` → calls `create_campaign` once → returns a **draft** summary
3. Frontend renders a `CampaignGateCard` with Approve/Decline buttons
4. Merchant taps **Approve** → `POST /api/v1/campaigns/{id}/approve` → backend creates a per-customer shop link (not a payment link, since campaigns are promotional broadcasts. Payment links are only created through the orders flow), personalizes the WhatsApp message, marks the campaign `sent`
5. Merchant taps **Decline** → campaign marked `cancelled`, nothing sent

The agent **cannot** approve or send — only the merchant can, via HTTP.

### 3.5 Real Razorpay Integration (Test Mode)

- Encrypted credential storage (`razorpay_key_secret_encrypted` column)
- `create_payment_link` → real Razorpay test-mode link (https://rzp.io/...)
- `check_payment_status` → HMAC-SHA256 signature verification + live status sync
- Settlements synced from Razorpay
- Payment success → printable PDF tax receipt at `/payment-success`

No real money ever moves. All links are test-mode.

### 3.6 Real-Time Customer Chat (WebSocket)

A customer opens a store → starts a chat. The merchant can reply directly, OR if the merchant is offline, the customer-side AI agent answers using the store's catalog. Same WebSocket room, three sender types (customer / agent / merchant).

### 3.7 Voice In + Voice Out

**Voice input (ASR):** Merchant taps the mic, speaks in Hindi or English, the text appears in the chat box word-by-word. Uses the browser's `SpeechRecognition` API (free, native). Fixed in this release to append cleanly (no more "edits itself" bug).

**Voice output (TTS):** Every agent reply has a 🔊 button. The merchant picks a voice in Settings (8 Indian languages). Tries browser `speechSynthesis` first (free), falls back to the `apps/tts-service` mini-service (node-edge-tts, Microsoft Edge neural voices, also free). Default voice is `hi-IN-Madhur` (warm male Hindi).

### 3.8 Structured Cards (Not Plain Text)

When the agent calls a money-moving tool, the frontend renders an **interactive card** — not just text:
- **PaymentLinkCard** — Copy link, Open, Send on WhatsApp, Send in customer chat
- **CampaignGateCard** — Approve / Decline buttons, view target customers
- **CatalogStockCard** — Low-stock status pills
- **MessageSnippetCard** — WhatsApp draft messages with copy button
- **RevenueSummaryCard** — Week-over-week metrics

Detection is reliable: the backend's `done` SSE event includes `tools_invoked`, so the card parser matches by tool name (not flaky regex).

### 3.9 Audit Log (Full Transparency)

Every agent + user action — payment link created, order placed, expense logged, campaign approved — is written to `audit_logs` with timestamp, action, entity, and JSON details. The merchant can ask "what did I do recently?" and the agent calls `get_audit_log`.

### 3.10 Onboarding (3 Steps)

1. **Business Profile** — name, type, city, language, owner name
2. **Connect Razorpay Test Account** — keys encrypted at rest
3. **Products + Expenses + AI Goals** — catalog + recurring expenses + "what should the agent help with"

### 3.11 Forgot Password
 
- Forgot password flow with a human-friendly 6-character alphanumeric code (e.g. `K9P2X7`), Redis-backed 10-min TTL, rate-limited endpoints (5 attempts per 15 minutes), and dark-themed transactional email template matching the application aesthetic. Includes direct email link prefill and manual code entry modes.

### 3.12 Dashboard (Live Data)

- **Today's Collection** — sum of paid payment links created today
- **Pending Links** — count of unpaid payment links
- **Low Stock Items** — products at/below their low-stock threshold
- **Active Orders** — count of unpaid orders
- **Recent Activity** — real audit log feed
- **Low Stock** — real product scan

No mock data — all wired to live APIs.

### 3.13 Multi-Customer Targeting

The merchant can pin 1 or many customers in the chat UI dropdown. The prompt dynamically injects an `<attached_customers>` block. When the merchant says "send them a payment link," the agent calls `send_message_to_customer` ONCE with `customer_connection_ids` to broadcast to all pinned customers.

### 3.14 Knowledge Graph (pgvector + fastembed)

Product catalog + store profile + AI rules are embedded locally (BAAI/bge-small-en-v1.5, 384-dim, runs on CPU via `fastembed`). `search_store_knowledge` does semantic search over vendor agreements, store policies, past invoices — not just exact catalog lookup.

---

## 4. Functional Requirements (What the System Does)

| FR | Description | Status |
|---|---|---|
| FR-1 | Merchant registers + logs in (email/password + Google OAuth) | ✅ |
| FR-2 | Merchant onboards (3 steps: profile, Razorpay, products) | ✅ |
| FR-3 | Merchant chats with AI agent in English/Hindi/Hinglish | ✅ |
| FR-4 | Agent creates real Razorpay test-mode payment links on request | ✅ |
| FR-5 | Agent drafts campaigns; merchant approves via UI; backend sends per-customer links | ✅ |
| FR-6 | Agent creates orders (auto-resolves customer name + product price) | ✅ |
| FR-7 | Agent logs/edits/deletes expenses | ✅ |
| FR-8 | Agent sends direct messages to customers (multi-customer broadcast) | ✅ |
| FR-9 | Agent checks payment link status (syncs with Razorpay) | ✅ |
| FR-10 | Agent reads the audit log | ✅ |
| FR-11 | Customer browses store directory + chats with store | ✅ |
| FR-12 | Customer gets a real checkout link from the customer-side agent | ✅ |
| FR-13 | Customer sees their payment links + pays | ✅ |
| FR-14 | Customer sees their orders + receipts | ✅ |
| FR-15 | Voice input (speech-to-text) in merchant chat | ✅ |
| FR-16 | Voice output (text-to-speech) in 8 Indian languages | ✅ |
| FR-17 | Every agent + user action logged to audit trail | ✅ |
| FR-18 | Approval gate: agent can draft but never approve/send campaigns | ✅ |
| FR-19 | Single-call discipline: money-moving tools called exactly once per request | ✅ |
| FR-20 | Fingerprint dedup: no duplicate payment links / orders / messages per turn | ✅ |
| FR-21 | Store Financial Analytics: Agent calculates exact earnings (today, month, year, all-time), pending udhaar, paid vs owing customers, expenses, and net profit | ✅ |

---

## 5. Non-Functional Requirements (How the System Behaves)

| NFR | Description | Status |
|---|---|---|
| NFR-1 (Security) | JWT access + refresh token rotation (Redis-backed); Razorpay keys encrypted at rest with Fernet | ✅ |
| NFR-2 (Security) | Merchant-only tools guarded by persona check; customer persona cannot access merchant data | ✅ |
| NFR-3 (Auditability) | Every money-moving action logged with timestamp, actor, entity, JSON details | ✅ |
| NFR-4 (Reliability) | Agent tools wrap in try/except — errors degrade to friendly strings, never crash the app | ✅ |
| NFR-5 (Reliability) | Failed agent runs persisted with `status=failed` + `error_detail` (graceful failure, buildathon bar) | ✅ |
| NFR-6 (Performance) | SSE streaming for merchant chat; WebSocket for customer chat; cursor-based pagination everywhere | ✅ |
| NFR-7 (Performance) | Multi-turn memory: last 6 turns loaded as PydanticAI message history (token budget) | ✅ |
| NFR-8 (Scalability) | Multi-tenant: one merchant = one Razorpay credential set; pgvector for semantic search scales with catalog | ✅ |
| NFR-9 (Internationalization) | English + Hindi + Hinglish out of the box (Sarvam 105B model); 8 Indian TTS voices | ✅ |
| NFR-10 (Accessibility) | Semantic HTML, ARIA labels on interactive elements, keyboard navigation, 44px touch targets | ✅ |
| NFR-11 (Responsive) | Mobile-first; tables collapse to card lists below `sm` breakpoint | ✅ |
| NFR-12 (Explainability) | Every agent action has a clear reason + checkable trail (audit log) | ✅ |
| NFR-13 (Bounded actions) | Money-moving tools single-call + fingerprint dedup; campaign approval is a human action | ✅ |
| NFR-14 (Graceful failure) | One real failure deliberately handled cleanly per the buildathon bar | ✅ |
| NFR-15 (Cost) | LLM via Sarvam (cheap); TTS free (node-edge-tts); embeddings local (fastembed, no API) | ✅ |

---

## 6. What Makes This Different

| Razorpay's Agent Studio | MerchantAgent |
|---|---|
| For merchants on Shopify/Tally/QuickBooks | For merchants on WhatsApp + memory |
| Automates operations | Runs growth actions + exposes catalog to other agents |
| Single-tenant Razorpay credentials | Multi-tenant: each merchant connects their own test account |
| English-focused | English + Hindi + Hinglish with Indian TTS voices |
| No customer-facing agent | Dual-agent: merchant copilot + customer shopfront |

---

## 7. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Backend | FastAPI + PydanticAI | Matches Razorpay's own production stack; async; tool-calling native |
| LLM | Sarvam 105B (OpenAI-compatible) | Best Indian-language model; cheap; Hinglish-native |
| Database | PostgreSQL + pgvector | One DB for structured + vector; no separate vector store |
| Embeddings | fastembed (BAAI/bge-small, 384-dim) | Local, free, no API call per query |
| Cache/Sessions | Redis | Refresh token rotation |
| Payments | Razorpay SDK (test mode) | Free, no KYC, no real money |
| Frontend | Next.js 16 + React 19 + Tailwind 4 + shadcn/ui + TanStack Query + Zustand | Modern, fast, type-safe |
| TTS | node-edge-tts (Microsoft Edge neural voices) | Free, no API key, 8 Indian languages |
| ASR | Browser SpeechRecognition API | Free, native, no backend |
| Real-time | WebSockets (socket.io-style manager) | Customer ↔ merchant ↔ agent |

**Not used (deliberate cuts):** Go, gRPC, protobufs, a second AI framework (LangGraph/CrewAI), WhatsApp Business API (costs money), multi-service split. Every one was cut because it costs build time without adding anything the judging criteria reward.

---

## 8. Current Limitations (Honest)

1. **WhatsApp Business API not integrated** — the merchant copies drafted WhatsApp messages and forwards them manually. The draft-card format makes this one tap, but it's not auto-sent.
2. **No MCP server yet** — the catalog is queryable by the merchant's own agent, but not yet exposed as an MCP tool for external agents. (Stretch goal; `mcp` is in requirements.)
3. **No voice calls** — voice input + voice output, but not a live phone-call mode.
4. **Campaign Feed (cross-merchant discovery) not built** — listed as stretch in `Idea.md`.
5. **`POST /auth/logout` is now wired** — (we fixed the logout bug). (Settlement webhooks still not wired).
6. **Test mode only** — no real money ever moves. Production would need KYC + live keys.

---

## 9. Demo Flow (The Golden Path)

1. Merchant onboards (3 steps) + connects Razorpay test keys
2. Merchant opens chat → "Send Rahul a ₹500 link"
3. Agent resolves Rahul + creates a real Razorpay link → `PaymentLinkCard` renders
4. Merchant taps "Send on WhatsApp" → message + link forwarded
5. Merchant says "Run a Diwali 10% off campaign for my last 20 customers"
6. Agent calls `get_recent_customers` + `create_campaign` → `CampaignGateCard` renders
7. Merchant taps **Approve** → backend creates 20 per-customer Razorpay links + personalizes messages
8. Customer side: opens store → "Do you have milk?" → customer agent answers from catalog
9. Customer: "I'll take 2 packets — checkout?" → real Razorpay link → pays → printable receipt

---

## 10. Success Metrics (for the Demo)

- ✅ Every money-moving action is explainable + logged
- ✅ Full audit trail of every agent action
- ✅ Approval gate works (campaign can't send without merchant tap)
- ✅ One real failure handled gracefully (e.g., Razorpay disconnected → friendly error, no crash)
- ✅ Customer-side checkout closes the loop (catalog → chat → payment)
- ✅ Hindi + Hinglish + English all work naturally
- ✅ Voice in + voice out in Hindi
