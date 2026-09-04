"use client";

import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Users,
  Percent,
  ShieldAlert,
  ChevronDown,
  X,
  Search,
  Loader2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { customerService } from "../../../../lib/api/services/customerService";
import { queryKeys } from "../../../../lib/api/utils/queryKeys";
import { useApproveCampaign, useDeclineCampaign } from "../../../../hooks";

interface CampaignGateCardProps {
  campaignId?: string;
  campaignName: string;
  segmentDescription: string;
  targetCount: number;
  discountPercent: string;
  offerMessage: string;
  onApprove?: () => void;
  onReject?: () => void;
}

export function CampaignGateCard({
  campaignId,
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
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  const approveMutation = useApproveCampaign();
  const declineMutation = useDeclineCampaign();

  const { data: customerData, isLoading: isLoadingCustomers } = useQuery({
    queryKey: queryKeys.customers.list({ limit: 100 }),
    queryFn: () => customerService.getConnections({ limit: 100 }),
    staleTime: 60 * 1000,
  });

  const realCustomers = (customerData?.items || []).map((c) => {
    const rawSpent = Number(c.total_spent) || 0;
    return {
      id: c.id,
      name: c.customer_name || "Customer",
      phone: c.customer_phone || c.customer_email || "N/A",
      messagesUsed: c.messages_used || 0,
      totalSpent: `₹${rawSpent.toLocaleString("en-IN")}`,
      status: c.status,
    };
  });

  const displayTargetCount =
    realCustomers.length > 0 ? realCustomers.length : targetCount;

  const filteredCustomers = realCustomers.filter(
    (c) =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.phone.includes(customerSearch),
  );

  const handleApprove = async () => {
    setActionError(null);
    if (campaignId) {
      try {
        await approveMutation.mutateAsync(campaignId);
        setStatus("approved");
        onApprove?.();
      } catch (err: unknown) {
        const error = err as Error;
        setActionError(error.message || "Failed to approve campaign");
      }
    } else {
      setStatus("approved");
      onApprove?.();
    }
  };

  const handleReject = async () => {
    setActionError(null);
    if (campaignId) {
      try {
        await declineMutation.mutateAsync(campaignId);
        setStatus("rejected");
        onReject?.();
      } catch (err: unknown) {
        const error = err as Error;
        setActionError(error.message || "Failed to decline campaign");
      }
    } else {
      setStatus("rejected");
      onReject?.();
    }
  };

  const isPendingAction = approveMutation.isPending || declineMutation.isPending;

  return (
    <>
      <div className="w-full my-4 rounded-2xl border border-border bg-surface p-4 sm:p-5 font-intert shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-border">
          <div>
            <span className="text-xs font-semibold text-primary block leading-none">
              Campaign Draft: {campaignName}
            </span>
            <span className="text-[11px] text-muted">
              Merchant approval gate required
            </span>
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
              <span>Batch Declined</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div className="p-3 rounded-xl bg-bg border border-border">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-1.5 text-[11px] text-muted">
                <Users size={12} />
                <span>Target Segment</span>
              </div>
              <button
                type="button"
                onClick={() => setShowCustomerModal(true)}
                className="text-[11px] font-medium link-brand hover:underline cursor-pointer inline-flex items-center gap-1"
              >
                <span>View {displayTargetCount} customers</span>
                <ChevronDown size={11} />
              </button>
            </div>
            <p className="text-xs font-medium text-primary">
              {segmentDescription}
            </p>
            <span className="text-[11px] text-muted mt-0.5 block">
              {displayTargetCount} verified customer profiles
            </span>
          </div>

          <div className="p-3 rounded-xl bg-bg border border-border">
            <div className="flex items-center gap-1.5 text-[11px] text-muted mb-1">
              <Percent size={12} />
              <span>Discount Offer</span>
            </div>
            <p className="text-xl font-instrument text-primary">
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
            <p className="text-xs text-secondary italic leading-relaxed">
              &quot;{offerMessage}&quot;
            </p>
          </div>
        </div>

        {actionError && (
          <div className="mb-3 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400">
            {actionError}
          </div>
        )}

        {status === "pending" && (
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border-subtle">
            <button
              type="button"
              onClick={handleReject}
              disabled={isPendingAction}
              className="px-3.5 py-1.5 rounded-lg bg-surface border border-border hover:bg-surface-muted text-xs font-medium text-secondary hover:text-primary transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              {declineMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : null}
              <span>Decline</span>
            </button>
            <button
              type="button"
              onClick={handleApprove}
              disabled={isPendingAction}
              className="px-4 py-1.5 rounded-lg btn-brand-solid text-xs font-medium transition-all cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              {approveMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : null}
              <span>Approve & Send Batch ({displayTargetCount})</span>
            </button>
          </div>
        )}
      </div>

      {showCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-0 sm:px-4 backdrop-blur-xs font-intert">
          <div className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl border border-border bg-surface p-5 max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="text-sm font-semibold text-primary">
                  Target Customer List ({displayTargetCount})
                </h3>
                <p className="text-xs text-muted">{segmentDescription}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowCustomerModal(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-muted hover:text-primary hover:bg-surface-muted transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <div className="py-3">
              <div className="relative">
                <Search
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                />
                <input
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  placeholder="Search customer by name or phone..."
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-border bg-bg text-primary focus:outline-none focus:border-brand/50"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-border-subtle pr-1 min-h-[140px]">
              {isLoadingCustomers ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-muted">
                  <Loader2 size={18} className="animate-spin text-brand" />
                  <span className="text-xs">Loading customer directory...</span>
                </div>
              ) : filteredCustomers.length === 0 ? (
                <div className="py-10 text-center text-muted">
                  <p className="text-xs">
                    {customerSearch
                      ? `No customers match "${customerSearch}"`
                      : "No connected customers found for this store yet."}
                  </p>
                </div>
              ) : (
                filteredCustomers.map((customer, idx) => (
                  <div
                    key={customer.id}
                    className="py-2.5 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xs text-muted w-5 shrink-0">
                        {idx + 1}.
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-primary truncate">
                          {customer.name}
                        </p>
                        <p className="text-[11px] text-muted">{customer.phone}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-medium text-primary block">
                        {customer.totalSpent}
                      </span>
                      <span className="text-[11px] text-muted">
                        {customer.messagesUsed} interactions
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 mt-2 border-t border-border flex justify-end">
              <button
                type="button"
                onClick={() => setShowCustomerModal(false)}
                className="px-4 py-2 rounded-lg btn-brand-solid text-xs font-medium cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
