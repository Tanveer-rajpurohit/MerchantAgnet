"use client";

import Link from "next/link";
import { Zap, Check, ArrowRight, Clock } from "lucide-react";

interface RateLimitCardProps {
  onRetry?: () => void;
}

export function RateLimitCard({ onRetry }: RateLimitCardProps) {
  return (
    <div className="w-full max-w-lg my-4 rounded-2xl border border-amber-500/20 bg-surface p-4 sm:p-5 font-intert shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Zap size={15} />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-primary block leading-none">
              AI Capacity Limit Reached
            </h4>
            <span className="text-[11px] text-muted">
              Peak traffic on Groq model provider
            </span>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-medium border border-amber-500/20">
          <Clock size={11} />
          <span>High Demand</span>
        </span>
      </div>

      <p className="text-xs text-secondary leading-relaxed mb-3.5">
        Current AI load is unusually high. Please wait a few seconds before retrying, or upgrade to a dedicated plan for uninterrupted copilot access.
      </p>

      {/* Mini Pricing Card */}
      <div className="p-3.5 rounded-xl bg-bg border border-border space-y-3">
        <div className="flex items-baseline justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-primary">Professional Plan</span>
              <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-brand/15 text-brand font-medium">
                Recommended
              </span>
            </div>
            <span className="text-[11px] text-muted">Dedicated infrastructure & zero wait times</span>
          </div>
          <div className="text-right">
            <span className="text-lg font-instrument text-primary leading-none block">₹399</span>
            <span className="text-[10px] text-muted">per month</span>
          </div>
        </div>

        <div className="space-y-1.5 pt-1 border-t border-border-subtle">
          {[
            "Dedicated high-speed Groq & Bedrock capacity",
            "Unlimited order management & payment links",
            "Priority WhatsApp campaign broadcasts",
          ].map((feature, i) => (
            <div key={i} className="flex items-center gap-2 text-[11px] text-secondary">
              <Check size={12} className="text-emerald-500 shrink-0" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2.5 pt-3 mt-3 border-t border-border-subtle">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="px-3.5 py-1.5 rounded-lg bg-surface border border-border hover:bg-surface-muted text-xs font-medium text-secondary hover:text-primary transition-colors cursor-pointer"
          >
            Retry Request
          </button>
        )}
        <Link
          href="/settings"
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg btn-brand-solid text-xs font-medium transition-all cursor-pointer shadow-xs"
        >
          <span>Upgrade to Premium</span>
          <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}
