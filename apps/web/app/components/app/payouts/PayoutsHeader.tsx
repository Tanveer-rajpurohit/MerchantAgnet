"use client";

import Link from "next/link";
import { Check, ExternalLink, Plus } from "lucide-react";
import { useRazorpay } from "../../../../hooks";

interface PayoutsHeaderProps {
  onCreateLinkClick?: () => void;
}

export function PayoutsHeader({ onCreateLinkClick }: PayoutsHeaderProps) {
  const { status } = useRazorpay();
  const isConnected = Boolean(status?.is_connected);
  const modeLabel = status?.mode === "live" ? "Live Mode" : "Test Mode";

  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 font-intert">
      <div>
        <h1 className="text-2xl sm:text-3xl font-instrument text-primary tracking-tight">
          Payouts
        </h1>
        <p className="text-sm text-muted mt-1">
          Razorpay balance, settlements, and transaction history.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {onCreateLinkClick && (
          <button
            type="button"
            onClick={onCreateLinkClick}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg btn-brand-solid text-xs font-medium transition-opacity cursor-pointer"
          >
            <Plus size={14} />
            <span>Create Payment Link</span>
          </button>
        )}

        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-border bg-surface">
          <div className="flex h-5 w-5 items-center justify-center rounded-md bg-[#02042B] text-[#3395FF] shrink-0">
            <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor">
              <path d="M22.436 0l-11.91 7.773-1.174 4.276 6.625-4.297L11.65 24h4.391l6.395-24zM14.26 10.098L3.389 17.166 1.564 24h9.008l3.688-13.902Z" />
            </svg>
          </div>
          <span className="text-xs font-medium text-secondary">
            {isConnected ? `Razorpay ${modeLabel}` : "Razorpay"}
          </span>
          {isConnected ? (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-medium border border-emerald-500/20">
              <Check size={9} />
              Active
            </span>
          ) : (
            <Link
              href="/settings"
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-medium border border-amber-500/20 hover:underline"
            >
              Setup Keys
            </Link>
          )}
          <a
            href="https://dashboard.razorpay.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted hover:text-primary transition-colors ml-1"
            title="Open Razorpay Dashboard"
          >
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  );
}
