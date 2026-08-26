# MerchantAgent

## Project Name
MerchantAgent – Personal AI Ops Agent for Indian Merchants

## Selected Track
05 – Open Track

## One-line Pitch
An always-on multi-agent AI co-pilot for Indian small and mid-sized merchants that watches revenue, controls spending, creates payment links, tracks budgets, forecasts cash, and closes daily money loops — all through simple Hindi/English chat powered by Razorpay test-mode APIs.

---

## Executive Summary
Most Indian merchants run their businesses using WhatsApp, Excel, and memory. They know money is moving, but they do not have a clear picture of what is coming in, what is going out, how much they can spend today, or what must be saved for rent, salaries, supplier dues, or GST-related obligations.

MerchantAgent fills that gap. It gives merchants a simple conversational assistant that understands everyday business language in Hindi, English, and Hinglish. Instead of forcing them into complex accounting tools, the system lets them ask straightforward questions and instantly receives practical answers based on live payment data, budget rules, and short-term cash forecasts.

This is not a full accounting suite. It is a focused AI ops layer for real merchant needs: cash visibility, faster payment collection, budget safety, and smarter financial decisions.

---

## The Real Problem
Small merchants in India often operate on extremely thin margins and unpredictable cash flow.

They lose money every day because:

- They do not have a real-time view of revenue vs. expenses.
- Creating and sending payment links is slow and manual.
- They cannot quickly answer: “How much cash do I have left?”
- They ignore future obligations such as rent, salaries, supplier payments, and GST until a crisis hits.
- Reconciliation and cash tracking remain painful and error-prone.
- Razorpay is already being used, but there is no intelligent layer that acts on that payment data.
- Existing tools are too formal, complicated, or not designed for Indian merchants.

The real opportunity is not just automation — it is decision support in the language merchants already speak.

---

## Product Vision
MerchantAgent is a merchant-first AI assistant that feels like a trusted business co-pilot in the merchant’s pocket.

After a short onboarding flow — connect Razorpay test account, define fixed expenses, and add a few known business inputs — the merchant can simply ask:

- “Aaj ka revenue kitna hua?”
- “Kal ka expected cash position batao”
- “Yeh customer ko 4,500 ka payment link bhejo”
- “Supplier se 12k ka maal order karna hai, budget mein hai kya?”
- “Is mahine kitna margin bacha hai?”
- “Salary + rent ke baad kitna free cash rahega?”

The system interprets the request, checks the data, applies business logic, and responds in clear, practical language.

---

## Core Value Proposition
MerchantAgent helps merchants:

- See their business clearly in real time
- Make faster payment and spending decisions
- Avoid overspending before fixed costs are covered
- Create payment links instantly instead of manually sharing details
- Understand upcoming cash pressure before it becomes a crisis
- Use AI without learning traditional accounting software

---

## Target Users

### Primary Users
- Kirana store owners
- Local D2C sellers
- Service providers
- Small retailers
- Business owners with recurring rent, salaries, and supplier payments

### User Persona
A typical merchant is:

- Comfortable with WhatsApp and mobile-first tools
- Busy with daily operations and customer handling
- Not a finance expert
- Highly sensitive to cash shortages and unexpected costs
- Looking for instant clarity, not complicated dashboards

---

## User Experience Goals
The product should feel:

- Simple and reassuring
- Fast enough for daily use
- Conversational and low-friction
- Helpful without being overwhelming
- Trustworthy when dealing with money decisions

MerchantAgent should not feel like a banker portal or accounting suite. It should feel like a smart assistant that understands business reality.

---

## Functional Requirements

### 1. Onboarding and Data Ingestion
- Connect Razorpay test account using key and secret
- Set monthly fixed costs such as rent, salaries, EMI, and GST estimate
- Upload or enter past transactions and variable costs
- Store merchant profile, language preference, timezone, and currency settings

### 2. Natural Language Interface
- Support Hindi, English, and Hinglish inputs
- Detect intent and extract entities like amount, customer name, order ID, and date range
- Support multi-turn conversation with memory
- Require confirmation before performing money-moving actions like payment link creation

### 3. Daily Revenue and Cash Pulse
- Pull payments, settlements, success and failure rates from Razorpay
- Answer questions like “Aaj ka collection?”, “pending”, “failed”, and “net settlements”
- Provide dashboard cards and natural language summaries

### 4. Budget and Remaining Money Guardian
- Track every outflow against plan
- Calculate remaining budget in real time
- Warn or soft-block overspending with clear reasoning

### 5. Smart Payment Link Factory
- Create Razorpay payment links or QR-based payment flows with amount, description, customer details, and expiry
- Support partial payments and reminders where relevant
- Return a shareable link or send it through a simulated WhatsApp/email flow in demo mode

### 6. Expense and Purchase Advisor
- Help answer: “I need to buy X for ₹Y. Can I afford it?”
- Compare requested spend against current cash and known upcoming outflows
- Return Yes / No / Partial with explanation and numbers

### 7. 7 to 14 Day Cash Forecast
- Forecast expected inflows from recent trends minus known outflows and buffer requirements
- Flag risk days clearly
- Keep forecasting transparent and explainable

### 8. Multi-Agent Orchestration
- Revenue Agent: handles payments and settlements
- Budget Agent: compares spending to plan
- Action Agent: creates payment links and logs actions
- Forecast Agent: calculates short-term cash outlook
- Orchestrator: routes requests, maintains memory, and handles the final response
- Log every action with timestamp, input, output, and success or failure status

### 9. Audit and Recovery
- Maintain a full audit trail visible to the merchant
- Handle failures gracefully when the API is slow or unavailable
- Ask for correction if data is invalid instead of failing silently

### 10. Demo and Synthetic Data Mode
- Pre-load realistic merchant data such as 50–200 transactions, expense records, and product frequency
- Reset or switch merchant profiles for demo purposes
- Ensure the product works without requiring live production data

---

## Non-Functional Requirements

### Performance
- Chat responses should arrive within 5–8 seconds for most queries
- Payment link creation should happen within 3 seconds in normal operation

### Reliability
- Graceful degradation when Razorpay test API is slow or down
- Retry and queue mechanism for temporary failures

### Security
- Never expose API secrets in logs
- Store keys in environment variables only
- Use test-mode credentials only

### Usability
- Support Hindi, English, and Hinglish interactions
- Mobile-friendly chat UI with large touch targets
- Clear, simple business language instead of technical jargon

### Observability
- Structured logs for all agent decisions and outputs
- Maintain an audit trail for business actions and errors

### Scalability for Demo
- Handle 1–5 concurrent demo users comfortably
- SQLite is acceptable for MVP usage

### Cost
- Run entirely on free-tier or low-cost infrastructure for the hackathon

### Compliance and Demo Safety
- Clearly mark all flows as Test Mode
- Ensure no real money is involved during demo usage

---

## MVP Scope

### Must-have Features
- Chat interface in Hindi and English
- Multi-agent system with orchestrator and 3–4 specialized agents
- Razorpay test-mode integration to fetch payments and create payment links
- Budget tracking and remaining-money calculation
- Simple 7-day cash forecast
- Audit log
- Synthetic merchant data and realistic demo flow
- Graceful error handling and action confirmation before money-moving actions

### Nice-to-have Features
- Small visual dashboard cards
- Voice input support
- WhatsApp-style UI polish
- Basic reminder simulation

### Out of Scope for MVP
- Live production mode or real-money operations
- Full accounting or GST filing
- Inventory management beyond simple affordability checks
- Multi-user and team roles
- Production WhatsApp Business API integration

---

## Suggested Tech Stack

### Backend
- Python + FastAPI
- Fast to build, easy to prototype, and strong ecosystem support

### AI / Multi-Agent Layer
- LangGraph preferred
- Alternative: CrewAI
- Suitable for orchestration, state management, tool calling, and conversational workflows

### LLM
- Claude 3.5 or 4 Sonnet via Anthropic
- Or GPT-4o mini or other cost-effective options for demo use
- Razorpay-aligned AI workflows work especially well with Claude-based agent orchestration

### Payments
- Razorpay Python SDK in test mode
- Free to use, no KYC required for demo setup

### Database
- SQLite for MVP
- Postgres later for production-ready scaling

### Vector / Memory
- Chroma or simple Postgres embeddings layer
- Useful for future memory or retrieval features

### Frontend
- Next.js for web chat interface
- Streamlit is also a valid fast prototype option

### Hosting
- Vercel for frontend
- Render or Railway free tier for backend services
- Local deployment is acceptable for demo purposes

### Auth
- Simple password or demo-only access for hackathon usage
- Skip complex identity setup for MVP

---

## Multi-Agent Architecture
The product is designed around a modular multi-agent workflow instead of a single monolithic chatbot.

### Agent Layers

#### Orchestrator Agent
- Interprets the merchant’s request
- Routes the request to the right specialized agent
- Combines responses into a final merchant-friendly reply
- Handles conversational flow and confirmation steps

#### Revenue Agent
- Pulls current and historical payment data from Razorpay
- Summarizes daily, weekly, and monthly revenue
- Detects anomalies and trend changes

#### Budget Agent
- Tracks fixed and variable expenses
- Calculates remaining budget and available runway
- Answers if a purchase is safe or risky

#### Action Agent
- Creates payment links and prepares transactional outputs
- Records action metadata for audit
- Formats merchant-friendly results

#### Forecast Agent
- Uses recent revenue and expense patterns to estimate cash over 7–14 days
- Signals risk periods and low-cash windows

This modular structure keeps the system realistic, explainable, and easy to extend.

---

## Data Model (Conceptual)

### Merchant
- id
- name
- business_type
- locale
- timezone
- created_at

### Expense
- id
- merchant_id
- name
- amount
- recurring_type
- due_day

### Payment
- id
- merchant_id
- razorpay_payment_id
- amount
- currency
- status
- created_at

### Payment Link
- id
- merchant_id
- customer_name
- amount
- short_url
- status
- created_at

### Audit Log
- id
- merchant_id
- action_type
- description
- metadata
- created_at

---

## Business Logic Examples

### Budget Guardian Rule
Available cash = current cash on hand + expected inflows - fixed expenses - pending purchases

If a purchase exceeds a safe threshold, the assistant should warn clearly and explain why.

### Example Decision Output
“Your current cash on hand is ₹18,400. Rent and salary total ₹24,000 this week. You are ₹5,600 short for this supplier order, so this purchase is not safe right now unless you delay collection or reduce another expense.”

### Forecasting Principle
The system should be transparent and honest.

- Clearly mention assumptions
- State that predictions are based on recent trends
- Highlight risk periods when cash dips below safe levels

---

## WhatsApp Integration Strategy
This is a valuable product angle for merchants who already live in WhatsApp.

### How it works
- Merchant starts the conversation with the bot in WhatsApp or through the browser app
- They send natural messages such as:
  - make payment link of 300
  - create 4500 link for Rahul order 482
  - aaj ka revenue kitna hua
- Bot replies with the Razorpay test payment link and a short confirmation
- Merchant can forward the link directly to the customer on WhatsApp

### Why this matters
This keeps the experience familiar and frictionless. The AI creates the link, and the merchant simply forwards it. This avoids paying for complex outbound message infrastructure while still improving the merchant’s workflow.

### Free and safe approach
For pure free mode, the cleanest workflow is:

- AI generates the payment link
- Merchant forwards the link themselves
- No production WhatsApp Business API required

---

## Demo Experience
A strong demo should feel simple and convincing.

1. Merchant logs in with a demo profile.
2. Synthetic payment data is already loaded.
3. Merchant asks for revenue summary.
4. Merchant asks to create a payment link.
5. Merchant asks if they can afford a supplier order.
6. AI explains the answer using a simple cash forecast.
7. Audit log shows every action that was taken.

This creates a realistic and memorable experience without requiring live business data.

---

## What Success Looks Like
A successful MVP should prove:

- Merchants can get real business answers through simple Hindi and English chat
- Payment link creation can happen in one step
- Budget safety is visible and understandable
- Forecasting helps merchants avoid cash crises
- The experience feels like a smart assistant rather than a complex dashboard

---

## Why This Idea Is Realistic
This project is realistic because it targets a very specific and painful problem that merchants already face every day.

- Merchants already use Razorpay
- They already live in WhatsApp and mobile-first workflows
- The core problem is daily cash visibility, not deep accounting complexity
- A lightweight multi-agent system is enough for the MVP
- The product is technically achievable within a short hackathon or prototype timeline

This is a concrete, valuable, and demo-friendly idea.

---

## Product Positioning
MerchantAgent should be positioned as:

- Your daily money assistant for small business
- A simple AI co-pilot for cash decisions and payments
- Built for Indian merchants who think in rupees, not spreadsheets

---

## Final Summary
MerchantAgent solves a real business problem faced by Indian merchants every day: not knowing how much cash is truly available, how much has been earned, and whether a purchase or payment can be made safely.

It does not try to replace accounting software. Instead, it acts as a focused AI ops layer that speaks merchant language, understands payment flows, calculates budget safety, and creates the next action in one conversation.

The result is a product that empowers merchants to make smarter daily decisions without needing complex systems or formal financial knowledge.

---

## Tagline Ideas
- Money clarity for every merchant
- Smarter cash, simpler decisions
- Your daily business money co-pilot
- Payments, forecast, and budget — all in one chat

---

## Short Project Statement
MerchantAgent is a multi-agent AI personal finance co-pilot for Indian small merchants. It connects to Razorpay test mode, tracks daily revenue, checks spending capacity, creates payment links, and forecasts short-term cash health through simple Hindi and English chat. The system is designed for merchants who operate on WhatsApp and rely on quick, practical financial decisions instead of formal accounting systems.

---

## Suggested Repository Structure

```text
MerchantAgnet /
├── apps/
│   ├── web/                 # Next.js chat UI
│   ├── backend/             # Go API + Razorpay + business logic
│   └── ai/                  # Python multi-agent orchestration
├── packages/
│   ├── proto/               # Shared gRPC definitions
│   └── shared/              # Shared types and helpers
├── turbo.json
├── package.json
└── README.md
```

This structure keeps the product modular and aligned with the project’s realistic build plan.
