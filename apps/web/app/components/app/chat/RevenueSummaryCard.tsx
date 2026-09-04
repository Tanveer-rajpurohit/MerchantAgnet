"use client";

import { ArrowUpRight, CreditCard, Smartphone, Building2 } from "lucide-react";
import { AgentOrb } from "../utils";
import type { RevenueMetric } from "../../../../types";

interface RevenueSummaryCardProps {
  data?: RevenueMetric;
}

const DEFAULT_METRIC: RevenueMetric = {
  thisWeek: 18420,
  lastWeek: 14250,
  growthPercent: 29.2,
  totalOrders: 42,
  avgOrderValue: 438,
  paymentMethods: {
    upi: 64,
    card: 24,
    netbanking: 12,
  },
  aiInsight:
    "Collection grew by 29.2% this week driven by higher repeat UPI orders from Sharma Store regulars. Dairy and beverage bundles saw the highest conversion.",
};

export function RevenueSummaryCard({
  data = DEFAULT_METRIC,
}: RevenueSummaryCardProps) {
  return (
    <div className="w-full my-4 rounded-2xl border border-border bg-surface p-4 sm:p-5 font-intert">
      <div className="flex items-center justify-between gap-2 mb-3.5 pb-3 border-b border-border">
        <div>
          <span className="text-xs font-semibold text-primary block leading-none">
            Weekly Revenue Analysis
          </span>
          <span className="text-[11px] text-muted">
            Live collection snapshot
          </span>
        </div>

        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium border border-emerald-500/20">
          <ArrowUpRight size={13} />
          <span>+{data.growthPercent}% vs last week</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3.5">
        <div className="p-3.5 rounded-xl bg-bg border border-border">
          <span className="text-xs text-muted uppercase tracking-wide block mb-1">
            This Week
          </span>
          <p className="text-xl sm:text-2xl font-instrument text-primary">
            ₹{data.thisWeek.toLocaleString("en-IN")}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-bg border border-border">
          <span className="text-xs text-muted uppercase tracking-wide block mb-1">
            Last Week
          </span>
          <p className="text-xl sm:text-2xl font-instrument text-secondary">
            ₹{data.lastWeek.toLocaleString("en-IN")}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-bg border border-border">
          <span className="text-xs text-muted uppercase tracking-wide block mb-1">
            Orders
          </span>
          <p className="text-xl sm:text-2xl font-instrument text-primary">
            {data.totalOrders}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-bg border border-border">
          <span className="text-xs text-muted uppercase tracking-wide block mb-1">
            Avg Order
          </span>
          <p className="text-xl sm:text-2xl font-instrument text-primary">
            ₹{data.avgOrderValue}
          </p>
        </div>
      </div>

      <div className="p-3.5 rounded-xl bg-bg border border-border mb-3.5">
        <span className="text-xs font-medium text-primary block mb-2.5">
          Collection Channels
        </span>
        <div className="grid grid-cols-3 gap-2.5">
          <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-surface border border-border">
            <Smartphone size={15} className="text-muted shrink-0" />
            <div>
              <p className="text-[11px] text-muted leading-tight">UPI</p>
              <p className="text-sm font-semibold text-primary font-intert mt-0.5">
                {data.paymentMethods.upi}%
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-surface border border-border">
            <CreditCard size={15} className="text-muted shrink-0" />
            <div>
              <p className="text-[11px] text-muted leading-tight">Cards</p>
              <p className="text-sm font-semibold text-primary font-intert mt-0.5">
                {data.paymentMethods.card}%
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-surface border border-border">
            <Building2 size={15} className="text-muted shrink-0" />
            <div>
              <p className="text-[11px] text-muted leading-tight">NetBanking</p>
              <p className="text-sm font-semibold text-primary font-intert mt-0.5">
                {data.paymentMethods.netbanking}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-bg border border-border">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-primary mb-1.5">
          <AgentOrb size={14} className="text-brand shrink-0" />
          <span>Agent Intelligence Insight</span>
        </div>
        <p className="text-xs sm:text-[13px] text-primary/90 leading-relaxed">
          {data.aiInsight}
        </p>
      </div>
    </div>
  );
}
