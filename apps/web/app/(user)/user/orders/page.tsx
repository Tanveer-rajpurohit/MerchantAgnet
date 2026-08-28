"use client";

import Link from "next/link";
import {
  ShoppingBag,
  ExternalLink,
  MessageSquare,
  Receipt,
} from "lucide-react";
import { StatusBadge } from "../../../components/app/utils";

const CUSTOMER_ORDERS = [
  {
    id: "ord-9821",
    storeName: "Sharma Kirana Store",
    date: "Today, 4:30 PM",
    items: [
      { name: "Aashirvaad Atta 5kg", qty: 1, price: 245 },
      { name: "Amul Milk 1L", qty: 2, price: 62 },
    ],
    total: 369,
    status: "Paid" as const,
    variant: "success" as const,
    paymentLink: "https://rzp.io/l/test_ord9821",
  },
  {
    id: "ord-8819",
    storeName: "Sharma Kirana Store",
    date: "26 Aug 2026",
    items: [
      { name: "Maggi 12-pack", qty: 2, price: 145 },
      { name: "Tata Salt 1kg", qty: 1, price: 28 },
    ],
    total: 318,
    status: "Paid" as const,
    variant: "success" as const,
    paymentLink: "https://rzp.io/l/test_ord8819",
  },
  {
    id: "ord-7104",
    storeName: "Gupta Daily Provisions",
    date: "22 Aug 2026",
    items: [
      { name: "Fortune Sunflower Oil 1L", qty: 1, price: 160 },
      { name: "Parle-G Biscuit", qty: 5, price: 10 },
    ],
    total: 210,
    status: "Settled" as const,
    variant: "success" as const,
    paymentLink: "https://rzp.io/l/test_ord7104",
  },
];

export default function UserOrdersPage() {
  return (
    <div className="w-full h-full overflow-y-auto font-intert">
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-10">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-instrument text-primary tracking-tight">
            My Orders & Receipts
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Track your grocery and store purchases made via AI Copilot.
          </p>
        </div>

        <div className="space-y-4">
          {CUSTOMER_ORDERS.map((ord) => (
            <div
              key={ord.id}
              className="p-5 rounded-2xl border border-border bg-surface shadow-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
                    <ShoppingBag size={14} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-primary">
                      {ord.storeName}
                    </h3>
                    <p className="text-[11px] text-muted">
                      Order #{ord.id} · {ord.date}
                    </p>
                  </div>
                </div>
                <StatusBadge label={ord.status} variant={ord.variant} />
              </div>

              <div className="divide-y divide-border-subtle mb-4">
                {ord.items.map((it, idx) => (
                  <div
                    key={idx}
                    className="py-2 flex items-center justify-between text-xs"
                  >
                    <span className="text-secondary font-medium">
                      {it.name} <span className="text-muted">× {it.qty}</span>
                    </span>
                    <span className="text-primary font-medium">
                      ₹{it.price * it.qty}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted">Total Paid:</span>
                  <span className="text-base font-instrument text-primary">
                    ₹{ord.total}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={ord.paymentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl border border-border bg-bg hover:bg-surface-muted text-xs font-medium text-secondary hover:text-primary transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Receipt size={12} />
                    <span>View Receipt</span>
                    <ExternalLink size={11} />
                  </a>

                  <Link
                    href="/user"
                    className="px-3 py-1.5 rounded-xl btn-brand-solid text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquare size={12} />
                    <span>Order Again</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
