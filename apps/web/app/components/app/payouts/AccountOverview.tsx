"use client";

import { useState } from "react";
import { ArrowDownToLine, Plus, RefreshCw, CheckCircle2 } from "lucide-react";
import { usePayoutsSummary, useSyncSettlements } from "../../../../hooks";

interface AccountOverviewProps {
  onWithdrawClick: () => void;
  onCreateLinkClick?: () => void;
}

function formatInr(amount?: number | null): string {
  if (amount === undefined || amount === null) return "₹0.00";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function AccountOverview({
  onWithdrawClick,
  onCreateLinkClick,
}: AccountOverviewProps) {
  const { data: summary, isLoading } = usePayoutsSummary();
  const syncMutation = useSyncSettlements();
  const [syncedCount, setSyncedCount] = useState<number | null>(null);

  const handleSync = async () => {
    try {
      const res = await syncMutation.mutateAsync(30);
      setSyncedCount(res.synced_count);
      setTimeout(() => {
        setSyncedCount(null);
      }, 4000);
    } catch {
      setSyncedCount(null);
    }
  };

  const STATS = [
    {
      label: "Available Balance",
      value: formatInr(summary?.available_balance),
      subtitle: "Ready for next bank payout",
    },
    {
      label: "Pending Settlement",
      value: formatInr(summary?.pending_settlement),
      subtitle: "In transit (rolling schedule)",
    },
    {
      label: "Total Settled",
      value: formatInr(summary?.total_settled),
      subtitle: "Lifetime bank credits",
    },
    {
      label: "Settlement Batches",
      value: String(summary?.settlement_count ?? 0),
      subtitle: "Completed bank deposits",
    },
  ];

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-surface p-4 flex flex-col justify-between"
          >
            <div>
              <p className="text-xs text-muted mb-1.5">
                {stat.label}
              </p>
              {isLoading ? (
                <div className="h-7 w-28 bg-surface-muted animate-pulse rounded-md mt-1" />
              ) : (
                <p className="text-2xl font-instrument text-primary tracking-tight">
                  {stat.value}
                </p>
              )}
            </div>
            <p className="text-[11px] text-muted font-intert mt-2">
              {stat.subtitle}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2.5 mb-8">
        <button
          type="button"
          onClick={handleSync}
          disabled={syncMutation.isPending}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-surface hover:bg-surface-muted text-sm font-medium font-intert text-primary transition-colors cursor-pointer disabled:opacity-60"
        >
          <RefreshCw
            size={14}
            className={syncMutation.isPending ? "animate-spin text-brand" : "text-secondary"}
          />
          <span>
            {syncMutation.isPending ? "Syncing Settlements..." : "Sync Settlements"}
          </span>
        </button>

        {onCreateLinkClick && (
          <button
            type="button"
            onClick={onCreateLinkClick}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl btn-brand-solid text-sm font-medium font-intert cursor-pointer"
          >
            <Plus size={14} />
            <span>Create Payment Link</span>
          </button>
        )}

        <button
          type="button"
          onClick={onWithdrawClick}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-surface hover:bg-surface-muted text-sm font-medium font-intert text-secondary hover:text-primary transition-colors cursor-pointer"
        >
          <ArrowDownToLine size={14} />
          <span>Withdraw to Bank</span>
        </button>

        {syncedCount !== null && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium border border-emerald-500/20 animate-in fade-in duration-200">
            <CheckCircle2 size={13} />
            <span>
              {syncedCount > 0
                ? `Synchronized ${syncedCount} settlements`
                : "All settlements up to date"}
            </span>
          </div>
        )}
      </div>
    </>
  );
}
