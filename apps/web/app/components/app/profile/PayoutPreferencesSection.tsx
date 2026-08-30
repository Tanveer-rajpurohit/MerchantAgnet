"use client";

import { CreditCard, ShieldCheck } from "lucide-react";

export interface PayoutPreferencesData {
  upiId?: string;
}

interface PayoutPreferencesSectionProps {
  data?: PayoutPreferencesData;
}

function RazorpayLogo({ size = 12 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
      <path d="M22.436 0l-11.91 7.773-1.174 4.276 6.625-4.297L11.65 24h4.391l6.395-24zM14.26 10.098L3.389 17.166 1.564 24h9.008l3.688-13.902Z" />
    </svg>
  );
}

export function PayoutPreferencesSection({ data }: PayoutPreferencesSectionProps) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6 font-intert">
      <div className="mb-4 pb-3 border-b border-border">
        <h3 className="text-sm sm:text-base font-semibold text-primary">
          Settlement & Payout Preferences
        </h3>
        <p className="text-xs text-muted mt-0.5">
          Configure payout destination UPI ID and payment gateway settlement status.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-primary block mb-1.5 flex items-center gap-1.5">
            <CreditCard size={13} className="text-muted" />
            <span>Primary UPI ID / Settlement VPA</span>
          </label>
          <input
            name="upiId"
            type="text"
            defaultValue={data?.upiId || ""}
            key={data?.upiId || ""}
            placeholder="sharma@okaxis"
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-border bg-bg text-primary focus:outline-none focus:border-brand/50 transition-colors font-mono"
          />
        </div>

        <div>
          <span className="text-xs font-medium text-primary block mb-1.5">
            Connected Gateway Status
          </span>
          <div className="p-2.5 rounded-xl border border-border bg-bg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-xs bg-[#02042B] text-[#3395FF] shrink-0">
                <RazorpayLogo size={11} />
              </div>
              <div>
                <span className="text-xs font-medium text-primary block leading-tight">
                  Razorpay Test Node
                </span>
                <span className="text-[10px] text-muted font-mono">
                  rzp_test_98kLsM2109xPQ
                </span>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-medium border border-emerald-500/20">
              <ShieldCheck size={10} />
              <span>Connected</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
