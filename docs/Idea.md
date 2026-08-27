# MerchantAgent — AI Growth & Agentic Commerce (Track 1)

## One-line pitch
An AI agent that runs day-to-day growth actions for small Indian merchants — payment links, campaigns, checkout — while exposing their catalog in a form other AI agents can actually transact against.

## Why Track 1
Razorpay's own Agent Studio (Dispute Responder, Subscription Recovery, Abandoned Cart) is built on the Claude Agent SDK and already live — but it plugs into merchants who are already on Shopify, Tally, QuickBooks. That's not most small Indian merchants. Kirana stores, local D2C, and service businesses run on WhatsApp and memory, not integrated commerce stacks. This is an agent for that long tail — not a knockoff of what Razorpay already ships, a version for the merchants their current stack doesn't reach yet.

## The Bar (what "done" means for this track)
- Every money-moving action is explainable, bounded, and gated — nothing sends or charges without a clear reason and a checkable trail.
- Full audit trail of every agent action.
- At least one real failure, handled gracefully, shown in the demo — not hidden.

## Core Concept — how it works
1. Merchant onboards once (profile + Razorpay test account + product catalog).
2. Merchant just chats with the agent from then on — "send Rahul a ₹500 link," "run a Diwali offer for my last 20 customers."
3. The agent takes bounded actions on the merchant's behalf: creates real Razorpay test-mode payment links, drafts and (after approval) sends campaigns, answers questions about stock and pricing.
4. The merchant's catalog is also exposed in a structured, queryable form — so it's not just this merchant's own chat that can use it. In principle, another AI agent (a buyer's shopping assistant) could query it too. That's what makes this "agentic commerce" rather than just "a chatbot for a merchant."
5. A thin customer-facing chat lets an end customer ask about products and get a real checkout link, closing the loop from catalog → conversation → payment.

## Onboarding Flow (kept intentionally short — 3 steps)
**Step 1 — Business Profile**
- Business Name (text, required) — e.g. "Sharma Kirana Store"
- Business Type (dropdown, required) — Kirana / Grocery, D2C / Brand, Service (salon, tuition, repair), Local E-com, Restaurant / Food, Other
- City / Area (text, required) — for timezone & language defaults
- Preferred Language (toggle, required) — English / Hindi / Hinglish
- Owner Name (text, optional) — used in greetings

**Step 2 — Connect Razorpay Test Account**

**Step 3 — Products / Inventory**
- Product Name, Cost Price (₹), Selling Price (₹), Current Stock, Low Stock Alert

*(Deliberately not included: an expense/budget-tracking step. That data doesn't serve checkout, campaigns, or the catalog — it belongs to a different track's problem, not this one.)*

## Feature List

### Core — build these first, in this order
1. **Merchant Agent Core** — the main chat agent merchants talk to, backed by a small set of tools rather than many overlapping sub-agents.
2. **Agent-Readable Catalog** — exact, structured, queryable product data (name, price, stock) that both the merchant's own agent and, in principle, an external AI buyer agent could query. Not a vector-search feature — this stays exact.
3. **Real Razorpay Payment Links** — the agent creates genuine test-mode payment links on request.
4. **Campaign Orchestrator** — merchant describes an offer in plain language; the agent drafts it per customer and shows the full batch for approval *before* anything sends. The approval gate is not optional — it's the literal requirement in "The Bar."
5. **Customer-Facing Checkout Chat** — a thin chat surface for the end customer, querying the catalog and generating a real checkout link.
6. **Audit Log + one demoed graceful failure** — every action logged; one real failure deliberately shown and handled cleanly in the demo.

### Stretch — only after all 6 core items are solid
- **Campaign Feed** — a discovery view where offers from multiple merchants are browsable in one place. Reuses catalog + campaign data already built for the core; extends the agent-to-agent story (a shopping agent could query "best deal on X across merchants"). Real value, but a "wow" add-on, not a requirement — build it after the core is demo-ready, not alongside it.
- **WhatsApp forwarding** — merchant forwards a generated link/message to a customer over WhatsApp.
- **Voice / calls** — voice-based interaction with the agent.

## What Makes This Different From Razorpay's Existing Agent Studio
Razorpay's shipped agents automate *operations* for merchants already wired into modern commerce tooling (Shopify, Tally, QuickBooks). This targets merchants who aren't — the ones running on WhatsApp groups and paper ledgers — and adds the one piece Razorpay's current agents don't focus on: making that merchant's catalog something an *external* AI agent can transact against, not just something their own chat can describe.