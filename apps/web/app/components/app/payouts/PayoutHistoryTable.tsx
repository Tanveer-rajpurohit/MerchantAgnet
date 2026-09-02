"use client";

import { useState } from "react";
import {
  Check,
  Copy,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  X,
  Filter,
  Building,
} from "lucide-react";
import type { SettlementRecord, SettlementStatus } from "../../../../types";
import { SearchInput, StatusBadge } from "../utils";

interface PayoutHistoryTableProps {
  records: SettlementRecord[];
  totalRecordsCount: number;
  totalPages?: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  dateFilter: string;
  onDateChange: (date: string) => void;
  isLoading?: boolean;
}

function formatDisplayDate(iso?: string | null): string {
  if (!iso) return "Pending";
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

const STATUS_OPTIONS: { id: string; label: string }[] = [
  { id: "All", label: "All Status" },
  { id: "processed", label: "Settled" },
  { id: "pending", label: "In Transit" },
  { id: "failed", label: "Failed" },
];

function getStatusBadge(status: SettlementStatus): {
  label: string;
  variant: "success" | "warning" | "danger";
} {
  switch (status) {
    case "processed":
      return { label: "Settled", variant: "success" };
    case "pending":
      return { label: "In Transit", variant: "warning" };
    case "failed":
      return { label: "Failed", variant: "danger" };
    default:
      return { label: status, variant: "warning" };
  }
}

export function PayoutHistoryTable({
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
  onDateChange,
  isLoading,
}: PayoutHistoryTableProps) {
  const [copiedUtr, setCopiedUtr] = useState<string | null>(null);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  const totalPages =
    propTotalPages !== undefined
      ? Math.max(1, propTotalPages)
      : Math.max(1, Math.ceil(totalRecordsCount / itemsPerPage));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const handleCopyUtr = (utr: string) => {
    navigator.clipboard?.writeText(utr);
    setCopiedUtr(utr);
    setTimeout(() => setCopiedUtr(null), 2000);
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
          placeholder="Search by UTR or Settlement ID..."
          className="w-full sm:w-96"
        />

        <div className="flex items-center gap-2">
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
              onClick={() => onDateChange("")}
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
                    onDateChange(e.target.value);
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
          Showing {startRange}–{endRange} of {totalRecordsCount} settlements
        </span>
      </div>

      {isLoading ? (
        <div className="p-12 text-center border border-border rounded-xl bg-surface">
          <div className="w-6 h-6 rounded-full border-2 border-brand border-t-transparent animate-spin mx-auto mb-2" />
          <p className="text-xs text-muted">Loading settlements...</p>
        </div>
      ) : records.length === 0 ? (
        <div className="py-14 px-6 text-center border border-border rounded-xl bg-surface">
          <div className="w-10 h-10 rounded-full bg-brand/10 text-brand flex items-center justify-center mx-auto mb-3">
            <Building size={20} />
          </div>
          <p className="text-sm font-medium text-primary font-intert">
            No bank settlements recorded yet
          </p>
          <p className="text-xs text-muted font-intert mt-1.5 max-w-md mx-auto">
            In Test Mode, settlements are simulated without physical bank transfers. In Live Mode, collections are automatically batched and transferred to your registered bank account on a T+1 / T+2 rolling schedule with official bank UTR tracking.
          </p>
        </div>
      ) : (
        <>
          <div className="sm:hidden flex flex-col gap-2.5">
            {records.map((r) => {
              const badge = getStatusBadge(r.status);
              const feeTotal = Number(r.fee) + Number(r.tax);
              return (
                <div
                  key={r.id}
                  className="rounded-xl border border-border bg-surface p-4"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Building size={14} className="text-muted" />
                        <p className="text-sm font-medium text-primary">
                          {r.utr ? `UTR: ${r.utr}` : r.razorpay_settlement_id}
                        </p>
                      </div>
                      <p className="text-xs text-muted mt-0.5">
                        {r.method.toUpperCase()} · {formatDisplayDate(r.settled_at || r.created_at)}
                      </p>
                    </div>
                    <StatusBadge label={badge.label} variant={badge.variant} />
                  </div>

                  <div className="flex items-center justify-between pt-2.5 border-t border-border">
                    <div className="text-xs text-muted">
                      {feeTotal > 0 && (
                        <span>Fee: {formatInr(feeTotal)} · </span>
                      )}
                      <span>Gross: {formatInr(r.amount)}</span>
                    </div>
                    <span className="text-primary font-medium font-instrument text-base">
                      {formatInr(r.net_amount)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="hidden sm:block rounded-xl border border-border bg-surface overflow-hidden">
            <table className="w-full text-sm font-intert">
              <thead>
                <tr className="border-b border-border bg-surface-muted text-left text-xs text-muted uppercase tracking-wide">
                  <th className="px-5 py-3 font-medium">Settlement ID / UTR</th>
                  <th className="px-5 py-3 font-medium">Method</th>
                  <th className="px-5 py-3 font-medium">Settlement Date</th>
                  <th className="px-5 py-3 font-medium">Gross</th>
                  <th className="px-5 py-3 font-medium">Deductions</th>
                  <th className="px-5 py-3 font-medium">Net Credited</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => {
                  const badge = getStatusBadge(r.status);
                  const feeTotal = Number(r.fee) + Number(r.tax);
                  return (
                    <tr
                      key={r.id}
                      className="border-b border-border last:border-0 hover:bg-surface-muted/60 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs text-primary">
                            {r.utr || r.razorpay_settlement_id}
                          </span>
                          {r.utr && (
                            <button
                              type="button"
                              onClick={() => handleCopyUtr(r.utr!)}
                              title="Copy UTR"
                              className="text-muted hover:text-primary transition-colors cursor-pointer"
                            >
                              {copiedUtr === r.utr ? (
                                <Check
                                  size={12}
                                  className="text-emerald-600 dark:text-emerald-400"
                                />
                              ) : (
                                <Copy size={12} />
                              )}
                            </button>
                          )}
                        </div>
                        {r.utr && (
                          <span className="text-[10px] text-muted font-mono block mt-0.5">
                            ID: {r.razorpay_settlement_id}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-secondary">
                        <span className="px-2 py-0.5 rounded-md bg-surface-muted border border-border text-xs font-medium">
                          {r.method.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-secondary whitespace-nowrap">
                        {formatDisplayDate(r.settled_at || r.created_at)}
                      </td>
                      <td className="px-5 py-3.5 text-secondary whitespace-nowrap">
                        {formatInr(r.amount)}
                      </td>
                      <td className="px-5 py-3.5 text-muted whitespace-nowrap">
                        {feeTotal > 0 ? `-${formatInr(feeTotal)}` : "₹0.00"}
                      </td>
                      <td className="px-5 py-3.5 text-primary font-medium font-instrument text-lg whitespace-nowrap">
                        {formatInr(r.net_amount)}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge label={badge.label} variant={badge.variant} />
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
