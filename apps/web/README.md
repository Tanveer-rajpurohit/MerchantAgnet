# MerchantAgent: Frontend (Next.js)

Next.js web application for MerchantAgent, providing interfaces for both merchant store owners and visiting customers.

## Getting Started

```bash
cd apps/web
pnpm install
pnpm dev
```

Runs on [http://localhost:3001](http://localhost:3001).

## Tech Stack

- **Framework:** Next.js 16.3.1 (App Router, Turbopack)
- **State Management:** Zustand (ephemeral UI & agent streaming state) + TanStack React Query v5 (server cache)
- **Styling:** Tailwind CSS with custom design system variables (`app/globals.css`)
- **Typography:** Inter Tight (primary UI & headings), JetBrains Mono (financial figures & code)
- **Icons:** lucide-react
- **Audio & Speech:** Web Speech API for voice dictation; custom multi-engine TTS (browser speech synthesis + Microsoft Edge neural TTS fallback)

## Application Architecture

The application is divided into two distinct user surfaces:

### 1. Merchant Operations Portal (`apps/web/app/(app)/`)
- **Copilot Chat (`/chat`)**: Real-time SSE streaming copilot. Parses structured card blocks dynamically for payment links, catalog inventory alerts, campaign approval gates, and revenue metrics.
- **Dashboard (`/dashboard`)**: Daily revenue, order volume, catalog stock alerts, and quick actions.
- **Orders (`/orders`)**: Complete order lifecycle tracking, fulfillment status, and customer details.
- **Products (`/products`)**: Inventory management, cost/selling price tracking, and low-stock alerts.
- **Customers (`/customers`)**: CRM table of connected and pending customers with individual chat histories.
- **Payment Links & Payouts (`/payouts` & `/payment-links`)**: Real-time Razorpay payment link tracking, copyable URLs, and transaction settlement statuses.
- **Audit Log (`/audit-log`)**: Transparent chronological log of all AI agent decisions, tool invocations, and manual data mutations.
- **Settings (`/settings`)**: Store details, UPI VPA configuration, Razorpay keys, and default AI voice preference.

### 2. Customer Shopfront Portal (`apps/web/app/(user)/` & `/shops/`)
- **Store Directory (`/shops`)**: Discover local merchants, categories, and active catalogs.
- **Interactive Store Chat (`/shops/[id]`)**: WebSocket-powered customer shopfront to browse items, inquire about store policies, place direct orders, and checkout via Razorpay links.
- **Customer Account (`/user/orders` & `/user/payment-links`)**: Order tracking and pending payment link settlement for shoppers.

## API & Realtime Layer

All pages are integrated with the FastAPI backend through:
- **16 Domain API Services** (`lib/api/services/`): Fully typed with zero `any`.
- **17 React Query Hooks** (`hooks/`): Optimistic updates and automated cache invalidation.
- **Native WebSocket Client** (`stores/useSocketStore.ts`): Live two-way chat synchronization between shoppers and store agents.
- **SSE Stream Reader** (`lib/api/services/agentService.ts`): Server-sent event reader decoding token streams, tool events, and completion markers.