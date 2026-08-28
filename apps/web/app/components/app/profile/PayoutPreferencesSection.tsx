"use client";

import { CreditCard, Bell, Check, ShieldCheck } from "lucide-react";

export interface PayoutPreferencesData {
  upiId: string;
  autoWhatsAppReceipt: boolean;
  lowStockAlerts: boolean;
  dailySummarySms: boolean;
}

interface PayoutPreferencesSectionProps {
  data: PayoutPreferencesData;
  onChange: (
    field: keyof PayoutPreferencesData,
    value: string | boolean,
  ) => void;
}

function RazorpayLogo({ size = 12 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
      <path d="M22.436 0l-11.91 7.773-1.174 4.276 6.625-4.297L11.65 24h4.391l6.395-24zM14.26 10.098L3.389 17.166 1.564 24h9.008l3.688-13.902Z" />
    </svg>
  );
}

export function PayoutPreferencesSection({
  data,
  onChange,
}: PayoutPreferencesSectionProps) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6 font-intert">
      <div className="mb-4 pb-3 border-b border-border">
        <h3 className="text-sm sm:text-base font-semibold text-primary">
          Settlement & Notifications
        </h3>
        <p className="text-xs text-muted mt-0.5">
          Configure payout destination VPA and automatic notification dispatch
          rules.
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-primary block mb-1.5 flex items-center gap-1.5">
              <CreditCard size={13} className="text-muted" />
              <span>Primary UPI ID / Settlement VPA</span>
            </label>
            <input
              type="text"
              value={data.upiId}
              onChange={(e) => onChange("upiId", e.target.value)}
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

        <div className="pt-3 border-t border-border space-y-3">
          <label className="text-xs font-medium text-primary block flex items-center gap-1.5">
            <Bell size={13} className="text-muted" />
            <span>Automated Notification Dispatches</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() =>
                onChange("autoWhatsAppReceipt", !data.autoWhatsAppReceipt)
              }
              className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                data.autoWhatsAppReceipt
                  ? "border-brand/40 bg-brand/5"
                  : "border-border bg-bg hover:bg-surface-muted/50"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                  data.autoWhatsAppReceipt
                    ? "bg-brand border-brand text-white"
                    : "border-border bg-surface text-transparent"
                }`}
              >
                <Check size={11} strokeWidth={3} />
              </div>
              <div>
                <p className="text-xs font-medium text-primary">
                  WhatsApp Receipts
                </p>
                <p className="text-[11px] text-muted mt-0.5 leading-snug">
                  Generate instant WhatsApp bills on order placement
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onChange("lowStockAlerts", !data.lowStockAlerts)}
              className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                data.lowStockAlerts
                  ? "border-brand/40 bg-brand/5"
                  : "border-border bg-bg hover:bg-surface-muted/50"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                  data.lowStockAlerts
                    ? "bg-brand border-brand text-white"
                    : "border-border bg-surface text-transparent"
                }`}
              >
                <Check size={11} strokeWidth={3} />
              </div>
              <div>
                <p className="text-xs font-medium text-primary">
                  Inventory Alerts
                </p>
                <p className="text-[11px] text-muted mt-0.5 leading-snug">
                  Notify when kirana staple stocks breach threshold
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onChange("dailySummarySms", !data.dailySummarySms)}
              className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                data.dailySummarySms
                  ? "border-brand/40 bg-brand/5"
                  : "border-border bg-bg hover:bg-surface-muted/50"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                  data.dailySummarySms
                    ? "bg-brand border-brand text-white"
                    : "border-border bg-surface text-transparent"
                }`}
              >
                <Check size={11} strokeWidth={3} />
              </div>
              <div>
                <p className="text-xs font-medium text-primary">
                  Evening Summary
                </p>
                <p className="text-[11px] text-muted mt-0.5 leading-snug">
                  Daily 9 PM revenue report & UPI collection snapshot
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
