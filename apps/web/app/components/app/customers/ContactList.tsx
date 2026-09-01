"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { MessageCircle, Check } from "lucide-react";
import type { CustomerConnectionResponse } from "../../../types/customer";
import { SearchInput, StatusBadge } from "../utils";

interface ContactListProps {
  customers: CustomerConnectionResponse[];
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onAccept?: (id: string) => void;
  acceptingId?: string | null;
}

const TABS = [
  { id: "all", label: "All" },
  { id: "connected", label: "Connected" },
  { id: "pending", label: "Pending" },
] as const;

function getInitials(name: string): string {
  if (!name) return "C";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function ContactList({
  customers,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  isLoading,
  isLoadingMore,
  hasMore,
  onLoadMore,
  onAccept,
  acceptingId,
}: ContactListProps) {
  const bottomSentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !isLoadingMore) {
          onLoadMore();
        }
      },
      { threshold: 0.1 },
    );

    const el = bottomSentinelRef.current;
    if (el) observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, [hasMore, isLoadingMore, onLoadMore]);

  return (
    <div className="font-intert">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-instrument text-primary tracking-tight">
            Customers
          </h1>
          <p className="text-sm text-muted font-intert mt-1 max-w-lg">
            Manage your connected customer relationships and ongoing chat conversations.
          </p>
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 mt-6 mb-5">
        <div className="flex items-center gap-1 border-b border-border">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onStatusFilterChange(t.id)}
              className={`px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === t.id
                  ? "border-brand text-primary font-semibold"
                  : "border-transparent text-muted hover:text-secondary"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <SearchInput
          value={search}
          onChange={onSearchChange}
          placeholder="Search customers..."
          className="w-full sm:w-96"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        </div>
      ) : customers.length === 0 ? (
        <div className="py-16 text-center border border-border rounded-xl bg-surface">
          <p className="text-sm text-muted font-intert">No customers found.</p>
        </div>
      ) : (
        <div>
          {customers.map((c) => {
            const isPending = c.status === "pending";
            const dateStr = new Date(c.updated_at || c.created_at).toLocaleDateString("en-IN", {
              month: "short",
              day: "numeric",
            });

            return (
              <Link
                key={c.id}
                href={`/customers/${c.id}`}
                className="flex items-center gap-3.5 py-3.5 px-2 border-b border-border last:border-b-0 hover:bg-surface-muted/40 transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-surface-muted flex items-center justify-center shrink-0 text-xs font-medium text-secondary">
                  {getInitials(c.customer_name)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <p className="text-sm font-medium text-primary truncate">
                        {c.customer_name}
                      </p>
                      {isPending && (
                        <StatusBadge label="Pending" variant="warning" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {isPending && onAccept && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onAccept(c.id);
                          }}
                          disabled={acceptingId === c.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 text-xs font-medium border border-emerald-500/20 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <Check size={12} />
                          <span>{acceptingId === c.id ? "Accepting..." : "Accept"}</span>
                        </button>
                      )}
                      <span className="text-[11px] text-muted">
                        {dateStr}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <p className="text-xs text-muted truncate">
                      {c.last_message?.content || c.customer_phone || c.customer_email || "No messages yet"}
                    </p>
                    <MessageCircle
                      size={14}
                      className="text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    />
                  </div>
                </div>
              </Link>
            );
          })}

          <div ref={bottomSentinelRef} className="py-4 flex justify-center">
            {isLoadingMore && (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand border-t-transparent" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
