import { Check, ExternalLink } from "lucide-react";

export function PayoutsHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-instrument text-primary tracking-tight">
          Payouts
        </h1>
        <p className="text-sm text-muted font-intert mt-1">
          Razorpay balance, settlements, and transaction history.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#02042B] text-[#3395FF] shrink-0">
            <svg
              viewBox="0 0 24 24"
              width="12"
              height="12"
              fill="currentColor"
            >
              <path d="M22.436 0l-11.91 7.773-1.174 4.276 6.625-4.297L11.65 24h4.391l6.395-24zM14.26 10.098L3.389 17.166 1.564 24h9.008l3.688-13.902Z" />
            </svg>
          </div>
          <span className="text-xs font-medium font-intert text-secondary">
            Razorpay Test Mode
          </span>
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-medium font-intert border border-emerald-500/20">
            <Check size={9} />
            Active
          </span>
        </div>
        <a
          href="https://dashboard.razorpay.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted hover:text-primary transition-colors"
          title="Open Razorpay Dashboard"
        >
          <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
}
