"use client";

import Link from "next/link";
import { AlertCircle, ArrowRight, Lock } from "lucide-react";

interface TrafficRateLimitCardProps {
  onRetry?: () => void;
}

export function TrafficRateLimitCard({ onRetry }: TrafficRateLimitCardProps) {
  return (
    <div className="mb-6 p-4 sm:p-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 dark:bg-amber-500/5 text-primary flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
          <AlertCircle size={18} />
        </div>
        <div>
          <h4 className="text-xs sm:text-sm font-semibold text-primary">
            High Public Traffic
          </h4>
          <p className="text-[11px] sm:text-xs text-muted mt-0.5 max-w-xl">
            Guest browsing limit reached on the public directory. Sign in to enjoy
            unlimited store searches, real-time stock checks, and direct chat.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl border border-border bg-surface hover:bg-surface-muted text-xs font-medium transition-colors"
          >
            Retry
          </button>
        )}
        <Link
          href="/login?redirect=/shops"
          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl btn-brand-solid text-xs font-medium shadow-xs"
        >
          <Lock size={12} />
          <span>Log In for Unlimited Access</span>
          <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}
