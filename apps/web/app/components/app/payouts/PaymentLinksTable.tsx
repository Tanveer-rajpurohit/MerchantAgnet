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
} from "lucide-react";
import { PaymentLinkRecord } from "../../../types/payout/types";
import { SearchInput, StatusBadge } from "../utils";

interface PaymentLinksTableProps {
  records: PaymentLinkRecord[];
  totalRecordsCount: number;
  search: string;
  onSearchChange: (v: string) => void;
  statusFilter: string;
  onStatusFilterChange: (v: string) => void;
  dateFilter: string;
  onDateFilterChange: (v: string) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
}

function formatDisplayDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const STATUS_OPTIONS = ["All", "Pending", "Expired"];

function getStatusVariant(
  status: PaymentLinkRecord["status"],
): "success" | "warning" | "danger" {
  if (status === "Paid") return "success";
  if (status === "Pending") return "warning";
  return "danger";
}

export function PaymentLinksTable({
  records,
  totalRecordsCount,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  dateFilter,
  onDateFilterChange,
  currentPage,
  onPageChange,
  itemsPerPage = 10,
}: PaymentLinksTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const totalPages = Math.max(1, Math.ceil(totalRecordsCount / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);

  const handleCopy = (link: PaymentLinkRecord) => {
    navigator.clipboard?.writeText(link.linkUrl);
    setCopiedId(link.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <SearchInput
          value={search}
          onChange={onSearchChange}
          placeholder="Search by name, link or amount..."
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
              <span className="hidden sm:inline">
                {statusFilter === "All" ? "Status" : statusFilter}
              </span>
            </button>
            {showStatusDropdown && (
              <div className="absolute right-0 z-50 mt-2 w-36 bg-surface border border-border rounded-xl shadow-lg shadow-black/5 py-1">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      onStatusFilterChange(opt);
                      setShowStatusDropdown(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-sm font-intert transition-colors ${
                      statusFilter === opt
                        ? "text-brand bg-brand/5"
                        : "text-secondary hover:text-primary hover:bg-surface-muted"
                    }`}
                  >
                    {opt}
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
              Clear
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
                  max="2026-08-27"
                  min="2026-08-01"
                  className="bg-bg border border-border rounded-lg px-3 py-2 text-xs font-intert text-primary focus:outline-none focus:border-brand cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <p className="text-xs text-muted font-intert mb-3">
        {totalRecordsCount} {totalRecordsCount === 1 ? "link" : "links"}
      </p>

      {records.length === 0 ? (
        <div className="py-16 text-center border border-border rounded-xl bg-surface">
          <p className="text-sm text-muted font-intert">
            No payment links match your filters.
          </p>
        </div>
      ) : (
        <>
          <div className="sm:hidden flex flex-col gap-2.5">
            {records.map((r) => (
              <div
                key={r.id}
                className="rounded-xl border border-border bg-surface p-4"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-primary truncate">
                      {r.customerName}
                    </p>
                    <p className="text-xs text-muted mt-0.5 truncate">
                      {r.description}
                    </p>
                  </div>
                  <StatusBadge
                    label={r.status}
                    variant={getStatusVariant(r.status)}
                  />
                </div>
                <div className="flex items-center justify-between pt-2.5 border-t border-border-subtle">
                  <div className="text-xs text-muted">
                    <span className="text-primary font-medium">{r.amount}</span>{" "}
                    · {formatDisplayDate(r.date)}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopy(r)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-surface text-secondary hover:text-primary transition-colors"
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
                      href={r.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-surface text-secondary hover:text-primary transition-colors"
                    >
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden sm:block rounded-xl border border-border bg-surface overflow-hidden">
            <table className="w-full text-sm font-intert">
              <thead>
                <tr className="border-b border-border bg-surface-muted text-left text-xs text-muted uppercase tracking-wide">
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Description</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium text-right">Link</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-border last:border-0 hover:bg-surface-muted/60 transition-colors"
                  >
                    <td className="px-5 py-3.5 text-primary font-medium">
                      {r.customerName}
                    </td>
                    <td className="px-5 py-3.5 text-secondary truncate max-w-[200px]">
                      {r.description}
                    </td>
                    <td className="px-5 py-3.5 text-primary font-medium whitespace-nowrap">
                      {r.amount}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge
                        label={r.status}
                        variant={getStatusVariant(r.status)}
                      />
                    </td>
                    <td className="px-5 py-3.5 text-secondary">
                      {formatDisplayDate(r.date)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleCopy(r)}
                          title="Copy link"
                          className="flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-surface hover:bg-surface-muted text-secondary hover:text-primary transition-colors cursor-pointer"
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
                          href={r.linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open link"
                          className="flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-surface hover:bg-surface-muted text-secondary hover:text-primary transition-colors"
                        >
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-5">
          <span className="text-xs text-muted font-intert">
            Page {safePage} of {totalPages}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => onPageChange(safePage - 1)}
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-surface text-muted hover:text-primary hover:bg-surface-muted transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-default"
            >
              <ChevronLeft size={14} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page)}
                className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-medium font-intert transition-colors cursor-pointer ${
                  page === safePage
                    ? "btn-brand-solid"
                    : "border border-border bg-surface text-secondary hover:text-primary hover:bg-surface-muted"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => onPageChange(safePage + 1)}
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-surface text-muted hover:text-primary hover:bg-surface-muted transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-default"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
