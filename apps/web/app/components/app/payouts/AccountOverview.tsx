import Link from "next/link";
import { ArrowDownToLine, Plus } from "lucide-react";

interface AccountOverviewProps {
  onWithdrawClick: () => void;
}

export function AccountOverview({ onWithdrawClick }: AccountOverviewProps) {
  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="p-4 rounded-xl border border-border bg-surface">
          <span className="text-[11px] text-muted font-intert">
            Available Balance
          </span>
          <p className="text-xl font-semibold font-mono text-primary mt-1">
            ₹8,247.50
          </p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-surface">
          <span className="text-[11px] text-muted font-intert">
            Pending Settlement
          </span>
          <p className="text-xl font-semibold font-mono text-primary mt-1">
            ₹4,241.25
          </p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-surface">
          <span className="text-[11px] text-muted font-intert">
            Earned This Month
          </span>
          <p className="text-xl font-semibold font-mono text-primary mt-1">
            ₹12,450.00
          </p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-surface">
          <span className="text-[11px] text-muted font-intert">
            Total Earned
          </span>
          <p className="text-xl font-semibold font-mono text-primary mt-1">
            ₹1,27,890
          </p>
        </div>
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
