"use client";

import { useState } from "react";
import { Link2, Copy, Check, ExternalLink, ShieldCheck } from "lucide-react";

interface PaymentLinkCardProps {
  customerName: string;
  amount: string;
  description: string;
  linkUrl: string;
  status?: "active" | "paid" | "expired";
}

export function PaymentLinkCard({
  customerName,
  amount,
  description,
  linkUrl,
  status = "active",
}: PaymentLinkCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(linkUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full my-4 rounded-2xl border border-border bg-surface p-4 sm:p-5 font-intert">
      <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#02042B] text-[#3395FF] flex items-center justify-center shrink-0">
            <Link2 size={15} />
          </div>
          <div>
            <span className="text-xs font-semibold text-primary block leading-none">
              Razorpay Payment Link
            </span>
            <span className="text-[11px] text-muted">
              Instant payment request
            </span>
          </div>
        </div>

        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-medium border border-emerald-500/20">
          <ShieldCheck size={11} />
          <span>Test Mode Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div>
          <span className="text-[11px] text-muted uppercase tracking-wider block">
            Customer
          </span>
          <p className="text-sm font-medium text-primary mt-0.5">
            {customerName}
          </p>
        </div>

        <div>
          <span className="text-[11px] text-muted uppercase tracking-wider block">
            Amount Due
          </span>
          <p className="text-lg font-bold text-primary font-mono mt-0.5">
            {amount}
          </p>
        </div>

        <div className="sm:col-span-2">
          <span className="text-[11px] text-muted uppercase tracking-wider block">
            Purpose
          </span>
          <p className="text-xs text-secondary mt-0.5">{description}</p>
        </div>
      </div>

      <div className="p-2.5 rounded-xl bg-bg border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <span className="font-mono text-xs text-muted truncate max-w-full sm:max-w-xs select-all">
          {linkUrl}
        </span>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-border hover:bg-surface-muted text-xs font-medium text-primary transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check size={12} className="text-emerald-500" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy size={12} />
                <span>Copy Link</span>
              </>
            )}
          </button>

          <a
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg btn-brand-solid text-xs font-medium transition-all"
          >
            <span>Open Link</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  );
}
