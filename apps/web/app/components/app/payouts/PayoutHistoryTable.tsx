import { useState } from "react";
import {
  Check,
  FileDown,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  X,
} from "lucide-react";
import { PayoutRecord } from "./types";

interface PayoutHistoryTableProps {
  records: PayoutRecord[];
  totalRecordsCount: number;
  dateFilter: string;
  onDateChange: (date: string) => void;
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

export function PayoutHistoryTable({
  records,
  totalRecordsCount,
  dateFilter,
  onDateChange,
  currentPage,
  onPageChange,
  itemsPerPage = 10,
}: PayoutHistoryTableProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [receiptDownloaded, setReceiptDownloaded] = useState<string | null>(
    null,
  );

  const totalPages = Math.max(1, Math.ceil(totalRecordsCount / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);

  const handleDownloadReceipt = (id: string) => {
    setReceiptDownloaded(id);
    setTimeout(() => setReceiptDownloaded(null), 2000);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-medium font-intert text-primary">
            Payout History
          </h2>
          <p className="text-xs text-muted font-intert mt-0.5">
            {dateFilter
              ? `Showing results for ${formatDisplayDate(dateFilter)}`
              : `${totalRecordsCount} total transactions`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {dateFilter && (
            <button
              type="button"
              onClick={() => onDateChange("")}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border bg-surface text-[11px] font-medium font-intert text-secondary hover:text-primary hover:bg-surface-muted transition-colors cursor-pointer"
            >
              <X size={11} />
              Clear
            </button>
          )}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowCalendar(!showCalendar)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium font-intert transition-colors cursor-pointer ${
                showCalendar || dateFilter
                  ? "border-brand text-brand bg-brand/5"
                  : "border-border bg-surface text-secondary hover:text-primary hover:bg-surface-muted"
              }`}
            >
              <CalendarDays size={13} />
              {dateFilter ? formatDisplayDate(dateFilter) : "Pick a date"}
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
                  max="2026-08-27"
                  min="2026-08-01"
                  className="bg-bg border border-border rounded-lg px-3 py-2 text-xs font-intert text-primary focus:outline-none focus:border-brand cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {records.length === 0 ? (
        <div className="py-16 text-center border-t border-border">
          <p className="text-sm text-muted font-intert">
            No transactions found for this date.
          </p>
        </div>
      ) : (
        <div>
          <div className="hidden sm:grid grid-cols-12 items-center gap-4 py-2.5 border-b border-border text-[11px] font-medium font-intert text-muted uppercase tracking-wider">
            <span className="col-span-4">Description</span>
            <span className="col-span-2">Method</span>
            <span className="col-span-2">Date</span>
            <span className="col-span-2 text-right pr-2">Amount</span>
            <span className="col-span-1 text-center">Status</span>
            <span className="col-span-1 text-right">Receipt</span>
          </div>

          {records.map((record) => (
            <div
              key={record.id}
              className="grid grid-cols-12 items-center gap-4 py-3.5 border-b border-border-subtle hover:bg-surface-muted/30 transition-colors"
            >
              <div className="col-span-12 sm:col-span-4 min-w-0 pr-2">
                <p className="text-sm font-medium font-intert text-primary truncate">
                  {record.description}
                </p>
                <p className="text-[11px] text-muted font-intert mt-0.5 sm:hidden">
                  {record.method} · {formatDisplayDate(record.date)}
                </p>
              </div>

              <span className="col-span-2 text-xs font-intert text-secondary hidden sm:block">
                {record.method}
              </span>

              <span className="col-span-2 text-xs font-intert text-secondary hidden sm:block">
                {formatDisplayDate(record.date)}
              </span>

              <span className="col-span-6 sm:col-span-2 text-left sm:text-right pr-2 text-sm font-semibold font-mono text-primary">
                {record.amount}
              </span>

              <div className="col-span-4 sm:col-span-1 flex justify-center">
                <span
                  className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    record.status === "Settled"
                      ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                      : "border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10"
                  }`}
                >
                  {record.status}
                </span>
              </div>

              <div className="col-span-2 sm:col-span-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleDownloadReceipt(record.id)}
                  title="Download receipt"
                  className="flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-surface hover:bg-surface-muted text-secondary hover:text-primary transition-colors cursor-pointer"
                >
                  {receiptDownloaded === record.id ? (
                    <Check size={14} className="text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <FileDown size={14} />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <span className="text-[11px] text-muted font-intert font-mono">
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
