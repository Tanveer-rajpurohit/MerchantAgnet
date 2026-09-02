"use client";

import { useState } from "react";
import {
  Copy,
  ExternalLink,
  Check,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  X,
  Filter,
  Plus,
  RefreshCw,
  FileText,
} from "lucide-react";
import type { PaymentLinkRecord, PaymentLinkStatus } from "../../../../types";
import { SearchInput, StatusBadge } from "../utils";
import { useSyncPaymentLink } from "../../../../hooks";

interface PaymentLinksTableProps {
  records: PaymentLinkRecord[];
  totalRecordsCount: number;
  totalPages?: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
  search: string;
  onSearchChange: (v: string) => void;
  statusFilter: string;
  onStatusFilterChange: (v: string) => void;
  dateFilter: string;
  onDateFilterChange: (v: string) => void;
  onCreateLinkClick?: () => void;
  isLoading?: boolean;
}

function formatDisplayDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function buildReceiptUrl(r: PaymentLinkRecord): string {
  const params = new URLSearchParams();
  if (r.id) params.set("id", r.id);
  if (r.amount !== undefined) params.set("amount", String(r.amount));
  if (r.customer_name) params.set("customer_name", r.customer_name);
  if (r.customer_phone) params.set("customer_phone", r.customer_phone);
  if (r.customer_email) params.set("customer_email", r.customer_email);
  if (r.description) params.set("description", r.description);
  if (r.receipt_number) params.set("receipt", r.receipt_number);
  if (r.razorpay_payment_id) params.set("razorpay_payment_id", r.razorpay_payment_id);
  if (r.razorpay_link_id) params.set("razorpay_payment_link_id", r.razorpay_link_id);
  params.set("status", "paid");
  return `/payment-success?${params.toString()}`;
}

const STATUS_OPTIONS: { id: string; label: string }[] = [
  { id: "All", label: "All Status" },
  { id: "created", label: "Pending" },
  { id: "paid", label: "Paid" },
  { id: "expired", label: "Expired" },
  { id: "cancelled", label: "Cancelled" },
];

function getStatusBadge(status: PaymentLinkStatus): {
  label: string;
  variant: "success" | "warning" | "danger" | "neutral";
} {
  switch (status) {
    case "paid":
      return { label: "Paid", variant: "success" };
    case "created":
      return { label: "Pending", variant: "warning" };
    case "partially_paid":
      return { label: "Partial", variant: "warning" };
    case "expired":
      return { label: "Expired", variant: "danger" };
    case "cancelled":
      return { label: "Cancelled", variant: "neutral" };
    default:
      return { label: status, variant: "neutral" };
  }
}

export function PaymentLinksTable({
  records,
  totalRecordsCount,
  totalPages: propTotalPages,
  currentPage,
  onPageChange,
  itemsPerPage = 10,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  dateFilter,
  onDateFilterChange,
  onCreateLinkClick,
  isLoading,
}: PaymentLinksTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  const syncMutation = useSyncPaymentLink();

  const totalPages =
    propTotalPages !== undefined
      ? Math.max(1, propTotalPages)
      : Math.max(1, Math.ceil(totalRecordsCount / itemsPerPage));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const handleCopy = (link: PaymentLinkRecord) => {
    if (!link.razorpay_link_url) return;
    navigator.clipboard?.writeText(link.razorpay_link_url);
    setCopiedId(link.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSyncRow = async (id: string) => {
    try {
      setSyncingId(id);
      await syncMutation.mutateAsync(id);
    } finally {
      setSyncingId(null);
    }
  };

  const selectedStatusLabel =
    STATUS_OPTIONS.find((s) => s.id === statusFilter)?.label || statusFilter;

  const startRange = totalRecordsCount === 0 ? 0 : (safePage - 1) * itemsPerPage + 1;
  const endRange = Math.min(safePage * itemsPerPage, totalRecordsCount);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <SearchInput
          value={search}
          onChange={onSearchChange}
          placeholder="Search by customer, phone, or description..."
          className="w-full sm:w-96"
        />

        <div className="flex items-center gap-2">
          {onCreateLinkClick && (
            <button
              type="button"
              onClick={onCreateLinkClick}
              className="inline-flex items-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg btn-brand-solid text-xs font-medium font-intert transition-opacity cursor-pointer shrink-0"
            >
              <Plus size={13} />
              <span>Create Link</span>
            </button>
          )}

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg border text-sm font-medium font-intert transition-colors cursor-pointer ${
                statusFilter !== "All"
                  ? "border-brand text-brand bg-brand/5"
                  : "border-border bg-surface text-secondary hover:text-primary hover:bg-surface-muted"
              }`}
            >
              <Filter size={13} />
              <span className="hidden sm:inline">{selectedStatusLabel}</span>
            </button>
            {showStatusDropdown && (
              <div className="absolute right-0 z-50 mt-2 w-36 bg-surface border border-border rounded-xl shadow-lg shadow-black/5 py-1">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      onStatusFilterChange(opt.id);
                      setShowStatusDropdown(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-sm font-intert transition-colors ${
                      statusFilter === opt.id
                        ? "text-brand bg-brand/5 font-medium"
                        : "text-secondary hover:text-primary hover:bg-surface-muted"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {dateFilter && (
            <button
              type="button"
              onClick={() => onDateFilterChange("")}
              className="inline-flex items-center gap-1 px-2.5 py-2 sm:py-1.5 rounded-lg border border-border bg-surface text-xs font-medium font-intert text-secondary hover:text-primary hover:bg-surface-muted transition-colors cursor-pointer"
            >
              <X size={11} />
              <span>Clear</span>
            </button>
          )}

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowCalendar(!showCalendar)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg border text-sm font-medium font-intert transition-colors cursor-pointer ${
                showCalendar || dateFilter
                  ? "border-brand text-brand bg-brand/5"
                  : "border-border bg-surface text-secondary hover:text-primary hover:bg-surface-muted"
              }`}
            >
              <CalendarDays size={13} />
              <span className="hidden sm:inline">
                {dateFilter ? formatDisplayDate(dateFilter) : "Date"}
              </span>
            </button>
            {showCalendar && (
              <div className="absolute right-0 z-50 mt-2 p-3 bg-surface border border-border rounded-xl shadow-lg shadow-black/5">
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => {
                    onDateFilterChange(e.target.value);
                    setShowCalendar(false);
                  }}
                  className="bg-bg border border-border rounded-lg px-3 py-2 text-xs font-intert text-primary focus:outline-none focus:border-brand cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted font-intert mb-3">
        <span>
          Showing {startRange}–{endRange} of {totalRecordsCount} links
        </span>
      </div>

      {isLoading ? (
        <div className="p-12 text-center border border-border rounded-xl bg-surface">
          <div className="w-6 h-6 rounded-full border-2 border-brand border-t-transparent animate-spin mx-auto mb-2" />
          <p className="text-xs text-muted">Loading payment links...</p>
        </div>
      ) : records.length === 0 ? (
        <div className="py-16 text-center border border-border rounded-xl bg-surface">
          <p className="text-sm text-muted font-intert">
            No payment links match your filters.
          </p>
        </div>
      ) : (
        <>
          <div className="sm:hidden flex flex-col gap-2.5">
            {records.map((r) => {
              const badge = getStatusBadge(r.status);
              return (
                <div
                  key={r.id}
                  className="rounded-xl border border-border bg-surface p-4"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-primary truncate">
                        {r.customer_name}
                      </p>
                      <p className="text-xs text-muted mt-0.5 truncate">
                        {r.description}
                      </p>
                      {r.customer_phone && (
                        <p className="text-[11px] text-muted font-mono mt-0.5">
                          {r.customer_phone}
                        </p>
                      )}
                    </div>
                    <StatusBadge label={badge.label} variant={badge.variant} />
                  </div>
                  <div className="flex items-center justify-between pt-2.5 border-t border-border">
                    <div className="text-xs text-muted">
                      <span className="text-primary font-medium font-instrument text-base">
                        {formatInr(r.amount)}
                      </span>{" "}
                      · {formatDisplayDate(r.created_at)}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleSyncRow(r.id)}
                        disabled={syncingId === r.id}
                        title="Sync with Razorpay"
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-surface text-secondary hover:text-primary transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <RefreshCw
                          size={13}
                          className={syncingId === r.id ? "animate-spin text-brand" : ""}
                        />
                      </button>
                      {r.razorpay_link_url && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleCopy(r)}
                            title="Copy link"
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-surface text-secondary hover:text-primary transition-colors cursor-pointer"
                          >
                            {copiedId === r.id ? (
                              <Check
                                size={14}
                                className="text-emerald-600 dark:text-emerald-400"
                              />
                            ) : (
                              <Copy size={14} />
                            )}
                          </button>
                          <a
                            href={r.razorpay_link_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Open link"
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-surface text-secondary hover:text-primary transition-colors"
                          >
                            <ExternalLink size={14} />
                          </a>
                        </>
                      )}
                      {r.status === "paid" && (
                        <a
                          href={buildReceiptUrl(r)}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View digital receipt"
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-surface text-secondary hover:text-brand transition-colors"
                        >
                          <FileText size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="hidden sm:block rounded-xl border border-border bg-surface overflow-hidden">
            <table className="w-full text-sm font-intert">
              <thead>
                <tr className="border-b border-border bg-surface-muted text-left text-xs text-muted uppercase tracking-wide">
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Description</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Created</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => {
                  const badge = getStatusBadge(r.status);
                  return (
                    <tr
                      key={r.id}
                      className="border-b border-border last:border-0 hover:bg-surface-muted/60 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <p className="text-primary font-medium">{r.customer_name}</p>
                        {r.customer_phone && (
                          <p className="text-[11px] text-muted font-mono mt-0.5">
                            {r.customer_phone}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-secondary truncate max-w-[220px]">
                        <p className="truncate">{r.description}</p>
                        {r.receipt_number && (
                          <span className="text-[10px] text-muted font-mono block">
                            Receipt: {r.receipt_number}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-primary font-medium font-instrument text-lg whitespace-nowrap">
                        {formatInr(r.amount)}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge label={badge.label} variant={badge.variant} />
                      </td>
                      <td className="px-5 py-3.5 text-secondary whitespace-nowrap">
                        {formatDisplayDate(r.created_at)}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleSyncRow(r.id)}
                            disabled={syncingId === r.id}
                            title="Sync status from Razorpay"
                            className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-border bg-surface text-secondary hover:text-primary hover:bg-surface-muted transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <RefreshCw
                              size={12}
                              className={syncingId === r.id ? "animate-spin text-brand" : ""}
                            />
                          </button>

                          {r.razorpay_link_url && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleCopy(r)}
                                title="Copy link"
                                className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-border bg-surface text-secondary hover:text-primary hover:bg-surface-muted transition-colors cursor-pointer"
                              >
                                {copiedId === r.id ? (
                                  <Check
                                    size={13}
                                    className="text-emerald-600 dark:text-emerald-400"
                                  />
                                ) : (
                                  <Copy size={13} />
                                )}
                              </button>
                              <a
                                href={r.razorpay_link_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Open payment link in new tab"
                                className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-border bg-surface text-secondary hover:text-primary hover:bg-surface-muted transition-colors"
                              >
                                <ExternalLink size={13} />
                              </a>
                            </>
                          )}

                          {r.status === "paid" && (
                            <a
                              href={buildReceiptUrl(r)}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="View digital receipt"
                              className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-border bg-surface text-secondary hover:text-brand hover:border-brand/40 hover:bg-brand/5 transition-colors cursor-pointer"
                            >
                              <FileText size={13} />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 font-intert">
              <span className="text-xs text-muted">
                Page {safePage} of {totalPages}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onPageChange(safePage - 1)}
                  disabled={safePage <= 1}
                  className="inline-flex items-center justify-center p-1.5 rounded-lg border border-border bg-surface hover:bg-surface-muted text-secondary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => onPageChange(safePage + 1)}
                  disabled={safePage >= totalPages}
                  className="inline-flex items-center justify-center p-1.5 rounded-lg border border-border bg-surface hover:bg-surface-muted text-secondary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
