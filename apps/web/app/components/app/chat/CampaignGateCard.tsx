"use client";

import { useState } from "react";
import {
  Megaphone,
  CheckCircle2,
  XCircle,
  Users,
  Percent,
  ShieldAlert,
} from "lucide-react";

interface CampaignGateCardProps {
  campaignName: string;
  segmentDescription: string;
  targetCount: number;
  discountPercent: string;
  offerMessage: string;
  onApprove?: () => void;
  onReject?: () => void;
}

export function CampaignGateCard({
  campaignName,
  segmentDescription,
  targetCount,
  discountPercent,
  offerMessage,
  onApprove,
  onReject,
}: CampaignGateCardProps) {
  const [status, setStatus] = useState<"pending" | "approved" | "rejected">(
    "pending",
  );

  const handleApprove = () => {
    setStatus("approved");
    onApprove?.();
  };

  const handleReject = () => {
    setStatus("rejected");
    onReject?.();
  };

  return (
    <div className="w-full my-4 rounded-2xl border border-border bg-surface p-4 sm:p-5 font-intert">
      <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand/15 text-brand flex items-center justify-center shrink-0">
            <Megaphone size={15} />
          </div>
          <div>
            <span className="text-xs font-semibold text-primary block leading-none">
              Campaign Draft: {campaignName}
            </span>
            <span className="text-[11px] text-muted">
              Merchant approval gate required
            </span>
          </div>
        </div>

        {status === "pending" && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-medium border border-amber-500/20">
            <ShieldAlert size={11} />
            <span>Approval Gated</span>
          </span>
        )}

        {status === "approved" && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-medium border border-emerald-500/20">
            <CheckCircle2 size={11} />
            <span>Batch Approved & Dispatched</span>
          </span>
        )}

        {status === "rejected" && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 text-[11px] font-medium border border-red-500/20">
            <XCircle size={11} />
            <span>Batch Canceled</span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div className="p-3 rounded-xl bg-bg border border-border">
          <div className="flex items-center gap-1.5 text-[11px] text-muted mb-1">
            <Users size={12} />
            <span>Target Segment</span>
          </div>
          <p className="text-xs font-medium text-primary">
            {segmentDescription}
          </p>
          <span className="text-[11px] text-muted font-mono mt-0.5 block">
            {targetCount} verified customer profiles
          </span>
        </div>

        <div className="p-3 rounded-xl bg-bg border border-border">
          <div className="flex items-center gap-1.5 text-[11px] text-muted mb-1">
            <Percent size={12} />
            <span>Discount Offer</span>
          </div>
          <p className="text-sm font-bold text-primary font-mono">
            {discountPercent}
          </p>
          <span className="text-[11px] text-muted mt-0.5 block">
            Applied automatically at Razorpay checkout
          </span>
        </div>

        <div className="sm:col-span-2 p-3 rounded-xl bg-bg border border-border">
          <span className="text-[11px] text-muted block mb-1">
            Message Preview
          </span>
          <p className="text-xs text-secondary italic">"{offerMessage}"</p>
        </div>
      </div>

      {status === "pending" && (
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border-subtle">
          <button
            type="button"
            onClick={handleReject}
            className="px-3.5 py-1.5 rounded-lg bg-surface border border-border hover:bg-surface-muted text-xs font-medium text-secondary hover:text-primary transition-colors cursor-pointer"
          >
            Reject / Modify
          </button>
          <button
            type="button"
            onClick={handleApprove}
            className="px-4 py-1.5 rounded-lg btn-brand-solid text-xs font-medium transition-all cursor-pointer shadow-xs"
          >
            Approve & Send Batch ({targetCount})
          </button>
        </div>
      )}
    </div>
  );
}
