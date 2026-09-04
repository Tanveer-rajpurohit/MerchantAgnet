"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  ExternalLink,
  CheckCircle2,
  Clock,
  XCircle,
  Copy,
  Check,
} from "lucide-react";
import { useCustomerPaymentLinks } from "../../../../hooks/useCustomerPaymentLinks";
import { StatusBadge } from "../../../components/app/utils";
import type {
  PaymentLinkStatus,
  CustomerPaymentLinksFilterTab,
} from "../../../../types";

function getStatusBadgeVariant(
  status: PaymentLinkStatus,
): "success" | "warning" | "danger" | "neutral" {
  if (status === "paid") return "success";
  if (status === "created" || status === "partially_paid") return "warning";
  if (status === "cancelled" || status === "expired") return "danger";
  return "neutral";
}

function formatStatusLabel(status: PaymentLinkStatus): string {
  if (status === "paid") return "Paid";
  if (status === "partially_paid") return "Partially Paid";
  if (status === "created") return "Pending";
  if (status === "expired") return "Expired";
  if (status === "cancelled") return "Cancelled";
  return status;
}

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffMs = now - then;
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hr${hr > 1 ? "s" : ""} ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day} day${day > 1 ? "s" : ""} ago`;
  return new Date(iso).toLocaleDateString("en-IN");
}

export default function UserPaymentLinksPage() {
  const [tab, setTab] = useState<CustomerPaymentLinksFilterTab>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const statusFilter: PaymentLinkStatus | undefined =
    tab === "pending"
      ? "created"
      : tab === "paid"
        ? "paid"
        : undefined;

  const { data, isLoading } = useCustomerPaymentLinks({
    status: statusFilter,
    limit: 100,
  });
  const links = data?.items || [];

  const handleCopy = async (url: string, id: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto font-intert">
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-10">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-instrument text-primary tracking-tight">
            My Payment Links
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Payment links generated for you by local stores. Pay outstanding
            links or review past payments.
          </p>
        </div>

        <div className="flex items-center gap-1 mb-5 p-1 rounded-xl border border-border bg-surface w-fit">
          {(["all", "pending", "paid"] as CustomerPaymentLinksFilterTab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer capitalize ${
                tab === t
                  ? "bg-brand text-white"
                  : "text-muted hover:text-secondary hover:bg-surface-muted"
              }`}
            >
              {t === "pending" ? "Pending" : t === "paid" ? "Paid" : "All"}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-brand border-t-transparent" />
          </div>
        ) : links.length === 0 ? (
          <div className="py-16 text-center border border-border rounded-2xl bg-surface">
            <CreditCard size={28} className="mx-auto text-muted mb-2" />
            <p className="text-sm font-medium text-primary">
              {tab === "pending"
                ? "No pending payment links"
                : tab === "paid"
                  ? "No paid links yet"
                  : "No payment links yet"}
            </p>
            <p className="text-xs text-muted mt-1 max-w-sm mx-auto">
              {tab === "pending"
                ? "You're all caught up — no outstanding payments."
                : "Start a chat with a store and ask for an item. The store will generate a payment link for you."}
            </p>
            <Link
              href="/user"
              className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-xl btn-brand-solid text-xs font-medium cursor-pointer"
            >
              <CreditCard size={13} />
              <span>Browse Local Shops</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {links.map((link) => {
              const amount = Number(link.amount) || 0;
              const isPaid = link.status === "paid";
              const isPending =
                link.status === "created" || link.status === "partially_paid";
              const isDead = link.status === "expired" || link.status === "cancelled";

              return (
                <div
                  key={link.id}
                  className="rounded-2xl border border-border bg-surface shadow-xs overflow-hidden"
                >
                  <div className="flex items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isPaid
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : isPending
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                              : "bg-surface-muted text-muted"
                        }`}
                      >
                        {isPaid ? (
                          <CheckCircle2 size={15} />
                        ) : isPending ? (
                          <Clock size={15} />
                        ) : (
                          <XCircle size={15} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-primary truncate">
                          {link.description}
                        </h3>
                        <p className="text-[11px] text-muted">
                          {link.customer_name} · {timeAgo(link.created_at)}
                          {link.paid_at && (
                            <span> · paid {timeAgo(link.paid_at)}</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-instrument text-primary font-semibold">
                        ₹{amount.toLocaleString("en-IN")}
                      </span>
                      <StatusBadge
                        label={formatStatusLabel(link.status)}
                        variant={getStatusBadgeVariant(link.status)}
                      />
                    </div>
                  </div>

                  {link.razorpay_link_url && !isDead && (
                    <div className="flex items-center gap-2 px-5 py-3 border-t border-border bg-bg/40">
                      <code className="text-[11px] text-muted font-mono truncate flex-1">
                        {link.razorpay_link_url}
                      </code>
                      <button
                        type="button"
                        onClick={() => handleCopy(link.razorpay_link_url!, link.id)}
                        className="px-2.5 py-1.5 rounded-lg border border-border bg-surface hover:bg-surface-muted text-secondary hover:text-primary text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                      >
                        {copiedId === link.id ? (
                          <>
                            <Check size={11} />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy size={11} />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                      {isPending && (
                        <a
                          href={link.razorpay_link_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg btn-brand-solid text-[11px] font-medium flex items-center gap-1 cursor-pointer shrink-0"
                        >
                          <ExternalLink size={11} />
                          <span>Pay Now</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
