# MerchantAgent — Frontend

Next.js frontend for MerchantAgent, an AI growth agent for small Indian merchants (Razorpay Buildathon, Track 1 — AI Growth & Agentic Commerce).

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tech Stack

- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS, custom design tokens in `app/globals.css` (light/dark, single orange brand accent)
- **Fonts:** Satoshi (display), Inter Tight (body/UI), JetBrains Mono (data/numeric)
- **Icons:** lucide-react

## Route Groups

```
app/
├── (marketing)/          # Public landing page
├── (auth)/                # Login, register (merchant/customer role split)
├── onboarding/            # Merchant onboarding — profile, Razorpay connect, products, goals
├── (app)/                 # Merchant dashboard
│   ├── chat/               # Merchant-facing AI agent chat
│   ├── dashboard/
│   ├── orders/             # Orders + WhatsApp message generation
│   ├── products/           # Catalog management
│   ├── customers/          # Connected/Pending customer list + per-customer chat
│   ├── payouts/            # Payouts + Payment Links (tabbed)
│   ├── audit-log/
│   └── settings/
└── (user)/                # Customer-facing side
    └── user/
        ├── page.tsx         # Store directory → chat (single-route state machine)
        ├── orders/
        ├── profile/
        └── settings/
```

## Key Design Decisions

- **Mobile-first tables:** long lists (Customers, Products, Payouts, Payment Links) render as card lists below the `sm` breakpoint and as tables above it — not a horizontally-scrolling table on mobile.
- **One unified customer connection model:** customers are `Pending` (up to 3 messages before a real connection is required) or `Connected` (completed a purchase or accepted an add-request). Campaigns can only target `Connected` customers — this is the mechanism that prevents mass-messaging non-customers.
- **Shared `FilterBar`** (search + status dropdown + date picker) used identically across Payouts and Payment Links tabs.

## Currently Frontend-Only

This app is not yet wired to the backend — all data shown is local mock data (consistent demo dataset: "Sharma Store," a fixed set of customer/product names reused across pages). See `apps/backend/README.md` for backend setup and status.

## Related Docs

- `docs/Idea.md` / `docs/Idea(tech).md` — product concept and technical plan
- `docs/Database Design.md` — schema for the tables the frontend expects