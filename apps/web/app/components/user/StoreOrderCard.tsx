"use client";

import { ArrowRight } from "lucide-react";
import { CartSummary } from "./types";

function RazorpayLogo({ size = 12 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
      <path d="M22.436 0l-11.91 7.773-1.174 4.276 6.625-4.297L11.65 24h4.391l6.395-24zM14.26 10.098L3.389 17.166 1.564 24h9.008l3.688-13.902Z" />
    </svg>
  );
}

interface StoreOrderCardProps {
  cart: CartSummary;
}

export function StoreOrderCard({ cart }: StoreOrderCardProps) {
  return (
    <div className="mt-3 w-full max-w-md rounded-2xl border border-border bg-surface p-4 shadow-xs font-intert">
      <div className="flex items-center justify-between pb-2.5 border-b border-border mb-3">
        <span className="text-xs font-semibold text-primary">
          Order Summary
        </span>
        <span className="text-[11px] text-muted">
          {cart.items.length} items
        </span>
      </div>

      <div className="divide-y divide-border-subtle mb-3">
        {cart.items.map((it, idx) => (
          <div
            key={idx}
            className="py-1.5 flex items-center justify-between text-xs"
          >
            <div>
              <p className="font-medium text-primary">{it.name}</p>
              <p className="text-[10px] text-muted">
                Qty: {it.qty} × ₹{it.price}
              </p>
            </div>
            <span className="font-medium text-primary">
              ₹{it.qty * it.price}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-bg border border-border mb-3">
        <span className="text-xs text-muted">Payable Amount</span>
        <span className="text-base font-instrument text-primary">
          ₹{cart.total.toLocaleString("en-IN")}
        </span>
      </div>

      <a
        href={cart.paymentUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full py-2.5 rounded-xl btn-brand-solid text-xs font-medium flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
      >
        <div className="flex h-4 w-4 items-center justify-center rounded-xs bg-[#02042B] text-[#3395FF]">
          <RazorpayLogo size={9} />
        </div>
        <span>Pay ₹{cart.total} via Razorpay</span>
        <ArrowRight size={13} />
      </a>
    </div>
  );
}
