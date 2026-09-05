# MerchantAgent — Core Functionality

> Complete feature inventory of what the system does, how it behaves, and what tools power each capability.

---

## 1. Dual AI Agent System

Two separate PydanticAI agents share one codebase but serve different people:

| Persona | Who | Powers | Where they chat |
|---|---|---|---|
| **merchant_admin** | The store owner | Full operational control — money, products, expenses, customers, campaigns | Merchant chat (SSE streaming) |
| **customer_shopfront** | An end customer browsing a store | Read catalog + request a checkout link only | Customer chat (WebSocket) |

A merchant speaks in names ("Rajesh"), never UUIDs. The agent resolves names + prices itself — it never asks the merchant for info it can look up.

---

## 2. Merchant Agent — 25 Tools (10 Functional Groups)

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
| **Analytics & Finance** (merchant) | `get_daily_collection`, `get_customer_udhaar_ledger`, `get_store_revenue_report`, `get_store_earnings_analytics` | Daily cash register (today/yesterday), customer udhaar ledger with mobile numbers, periodic revenue reports (week/month/year) with explicit date ranges |
| **Financial Report** (merchant) | `get_store_financial_report` | Full financial report with optional expense inclusion |

**Key design rules enforced by the prompt:**
- **Proactive mandate:** never ask the merchant for UUIDs or prices — look them up.
- **Single-call discipline:** money-moving tools called exactly once per request.
- **Fingerprint dedup:** if the agent tries to create the same payment link / order / message twice in one turn, it returns the existing one — no duplicates.
- **Multi-customer pin:** merchant can select multiple customers in the UI dropdown and broadcast to all in one tool call.

---

## 3. Customer Agent — 3 Tools

| Tool | What it does |
|---|---|
| `get_customer_catalog` | Browse the store's products + prices |
| `place_order` | Create an order (auto-resolves product prices) |
| `request_payment_link` | Get a real Razorpay checkout link |

**Boundaries enforced:** the customer persona cannot see cost prices, supplier names, customer lists, or run campaigns. If asked, it refuses gracefully.

---

## 4. Customer Portal & Storefront Experience (`/shops`, `/user`)

1. **Public Storefront Directory (`/shops`):** Browse merchant stores categorized by sector (Grocery, D2C, Services, Restaurant) with live search by location or store name.
2. **AI Storefront Chat (`/shops/{slug}`):** In-chat assistant handling stock inquiries and checkout orders. Enforces strict boundary protection — retail prices only, no cost/margins, no supplier leaks.
3. **Unified Customer Payment Links (`/user/payment-links`):** Consolidated view of all payment links across every merchant, filtered by `All`, `Pending`, and `Paid`, with direct "Pay Now" actions.
4. **Order History & Udhaar Transparency (`/user/orders`):** Expandable itemized purchase receipts with live payment states (`Paid` / `Unpaid`). Protected with a read-only policy: customers cannot mutate merchant orders, instead using a "Request Change" modal to contact the store directly.
5. **Verified Checkout Receipt (`/payment-success`):** Automated Razorpay HMAC-SHA256 signature verification and printable/downloadable PDF tax invoices.

---

## 5. Campaign Orchestrator with Approval Gate

The **approval gate is non-optional** — every money-moving action is explainable, bounded, gated:

1. Merchant says "Run a Diwali 10% off campaign for my last 20 customers"
2. Agent calls `get_recent_customers(20)` → calls `create_campaign` once → returns a **draft** summary
3. Frontend renders a `CampaignGateCard` with Approve/Decline buttons
4. Merchant taps **Approve** → `POST /api/v1/campaigns/{id}/approve` → backend creates per-customer shop links, personalizes messages, marks campaign `sent`
5. Merchant taps **Decline** → campaign marked `cancelled`, nothing sent

The agent **cannot** approve or send — only the merchant can, via HTTP.

---

## 6. Real Razorpay Integration (Test Mode)

- Encrypted credential storage (`razorpay_key_secret_encrypted` column)
- `create_payment_link` → real Razorpay test-mode link (https://rzp.io/...)
- `check_payment_status` → HMAC-SHA256 signature verification + live status sync
- Settlements synced from Razorpay
- Payment success → printable PDF tax receipt at `/payment-success`

No real money ever moves. All links are test-mode.

---

## 7. Real-Time Customer Chat (WebSocket)

A customer opens a store → starts a chat. The merchant can reply directly, OR if the merchant is offline, the customer-side AI agent answers using the store's catalog. Same WebSocket room, three sender types (customer / agent / merchant).

---

## 8. Voice In + Voice Out

**Voice input (ASR):** Merchant taps the mic, speaks in Hindi or English, the text appears in the chat box word-by-word. Uses the browser's `SpeechRecognition` API (free, native).

**Voice output (TTS):** Every agent reply has a speaker button. The merchant picks a voice in Settings (8 Indian languages). Tries browser `speechSynthesis` first (free), falls back to `apps/tts-service` mini-service (node-edge-tts, Microsoft Edge neural voices, also free). Default voice is `hi-IN-Madhur` (warm male Hindi).

---

## 9. Structured Cards (Not Plain Text)

When the agent calls a money-moving tool, the frontend renders an **interactive card** — not just text:
- **PaymentLinkCard** — Copy link, Open, Send on WhatsApp, Send in customer chat
- **CampaignGateCard** — Approve / Decline buttons, view target customers
- **CatalogStockCard** — Low-stock status pills
- **MessageSnippetCard** — WhatsApp draft messages with copy button
- **RevenueSummaryCard** — Week-over-week metrics

Detection is reliable: the backend's `done` SSE event includes `tools_invoked`, so the card parser matches by tool name (not flaky regex).

---

## 10. Audit Log (Full Transparency)

Every agent + user action — payment link created, order placed, expense logged, campaign approved — is written to `audit_logs` with timestamp, action, entity, and JSON details. The merchant can ask "what did I do recently?" and the agent calls `get_audit_log`.

---

## 11. Onboarding (3 Steps)

1. **Business Profile** — name, type, city, language, owner name
2. **Connect Razorpay Test Account** — keys encrypted at rest
3. **Products + Expenses + AI Goals** — catalog + recurring expenses + "what should the agent help with"

---

## 12. Forgot Password

Forgot password flow with a human-friendly 6-character alphanumeric code (e.g. `K9P2X7`), Redis-backed 10-min TTL, rate-limited endpoints (5 attempts per 15 minutes), and dark-themed transactional email template matching the application aesthetic. Includes direct email link prefill and manual code entry modes.

---

## 13. Dashboard (Live Data)

- **Today's Collection** — sum of paid payment links created today
- **Pending Links** — count of unpaid payment links
- **Low Stock Items** — products at/below their low-stock threshold
- **Active Orders** — count of unpaid orders
- **Recent Activity** — real audit log feed
- **Low Stock** — real product scan

No mock data — all wired to live APIs.

---

## 14. Multi-Customer Targeting

The merchant can pin 1 or many customers in the chat UI dropdown. The prompt dynamically injects an `<attached_customers>` block. When the merchant says "send them a payment link," the agent calls `send_message_to_customer` ONCE with `customer_connection_ids` to broadcast to all pinned customers.

---

## 15. Knowledge Graph (pgvector + fastembed)

Product catalog + store profile + AI rules are embedded locally (BAAI/bge-small-en-v1.5, 384-dim, runs on CPU via `fastembed`). `search_store_knowledge` does semantic search over vendor agreements, store policies, past invoices — not just exact catalog lookup.

---

## 16. Functional Requirements

| FR | Description | Status |
|---|---|---|
| FR-1 | Merchant registers + logs in (email/password + Google OAuth) | Done |
| FR-2 | Merchant onboards (3 steps: profile, Razorpay, products) | Done |
| FR-3 | Merchant chats with AI agent in English/Hindi/Hinglish | Done |
| FR-4 | Agent creates real Razorpay test-mode payment links on request | Done |
| FR-5 | Agent drafts campaigns; merchant approves via UI; backend sends per-customer links | Done |
| FR-6 | Agent creates orders (auto-resolves customer name + product price) | Done |
| FR-7 | Agent logs/edits/deletes expenses | Done |
| FR-8 | Agent sends direct messages to customers (multi-customer broadcast) | Done |
| FR-9 | Agent checks payment link status (syncs with Razorpay) | Done |
| FR-10 | Agent reads the audit log | Done |
| FR-11 | Customer browses store directory + chats with store | Done |
| FR-12 | Customer gets a real checkout link from the customer-side agent | Done |
| FR-13 | Customer sees their payment links + pays | Done |
| FR-14 | Customer sees their orders + receipts | Done |
| FR-15 | Voice input (speech-to-text) in merchant chat | Done |
| FR-16 | Voice output (text-to-speech) in 8 Indian languages | Done |
| FR-17 | Every agent + user action logged to audit trail | Done |
| FR-18 | Approval gate: agent can draft but never approve/send campaigns | Done |
| FR-19 | Single-call discipline: money-moving tools called exactly once per request | Done |
| FR-20 | Fingerprint dedup: no duplicate payment links / orders / messages per turn | Done |
| FR-21 | Store Financial Analytics: Agent calculates exact earnings (today, month, year, all-time), pending udhaar, paid vs owing customers | Done |

---

## 17. Non-Functional Requirements

| NFR | Description | Status |
|---|---|---|
| NFR-1 (Security) | JWT access + refresh token rotation (Redis-backed); Razorpay keys encrypted at rest with Fernet | Done |
| NFR-2 (Security) | Merchant-only tools guarded by persona check; customer persona cannot access merchant data | Done |
| NFR-3 (Auditability) | Every money-moving action logged with timestamp, actor, entity, JSON details | Done |
| NFR-4 (Reliability) | Agent tools wrap in try/except — errors degrade to friendly strings, never crash the app | Done |
| NFR-5 (Reliability) | Failed agent runs persisted with `status=failed` + `error_detail` (graceful failure) | Done |
| NFR-6 (Performance) | SSE streaming for merchant chat; WebSocket for customer chat; cursor-based pagination everywhere | Done |
| NFR-7 (Performance) | Multi-turn memory: last 2 turns loaded as PydanticAI message history (token budget) | Done |
| NFR-8 (Scalability) | Multi-tenant: one merchant = one Razorpay credential set; pgvector for semantic search scales with catalog | Done |
| NFR-9 (Internationalization) | English + Hindi + Hinglish out of the box (Sarvam 105B model); 8 Indian TTS voices | Done |
| NFR-10 (Accessibility) | Semantic HTML, ARIA labels on interactive elements, keyboard navigation, 44px touch targets | Done |
| NFR-11 (Responsive) | Mobile-first; tables collapse to card lists below `sm` breakpoint | Done |
| NFR-12 (Explainability) | Every agent action has a clear reason + checkable trail (audit log) | Done |
| NFR-13 (Bounded actions) | Money-moving tools single-call + fingerprint dedup; campaign approval is a human action | Done |
| NFR-14 (Graceful failure) | One real failure deliberately handled cleanly | Done |
| NFR-15 (Cost) | LLM via Sarvam (cheap); TTS free (node-edge-tts); embeddings local (fastembed, no API) | Done |

---

## 18. Current Limitations

1. **WhatsApp Business API not integrated** — the merchant copies drafted WhatsApp messages and forwards them manually. The draft-card format makes this one tap, but it's not auto-sent.
2. **No MCP server yet** — the catalog is queryable by the merchant's own agent, but not yet exposed as an MCP tool for external agents. (Stretch goal; `mcp` is in requirements.)
3. **No voice calls** — voice input + voice output, but not a live phone-call mode.
4. **Campaign Feed (cross-merchant discovery) not built** — listed as stretch.
5. **Settlement webhooks still not wired.**
6. **Test mode only** — no real money ever moves. Production would need KYC + live keys.
