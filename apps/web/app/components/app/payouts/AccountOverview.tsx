import Link from "next/link";
import { ArrowDownToLine, Plus } from "lucide-react";

interface AccountOverviewProps {
  onWithdrawClick: () => void;
}

export function AccountOverview({ onWithdrawClick }: AccountOverviewProps) {
  const STATS = [
    { label: "Today's Collection", value: "₹8,247" },
    { label: "Pending Settlement", value: "₹4,241" },
    { label: "Earned This Month", value: "₹12,450" },
    { label: "Total Earned", value: "₹1,27,890" },
  ];

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-surface p-4"
          >
            <p className="text-xs text-muted uppercase tracking-wide mb-1.5">
              {stat.label}
            </p>
            <p className="text-2xl font-instrument text-primary">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-2.5 mb-8">
        <button
          type="button"
          onClick={onWithdrawClick}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl btn-brand-solid text-sm font-medium font-intert cursor-pointer"
        >
          <ArrowDownToLine size={14} />
          Withdraw to Bank
        </button>
        <Link
          href="/chat"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-surface hover:bg-surface-muted text-sm font-medium font-intert text-primary transition-colors"
        >
          <Plus size={14} />
          Create New Link
        </Link>
      </div>
    </>
  );
}
