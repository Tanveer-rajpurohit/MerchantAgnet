"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Bot,
  User,
  Server,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { SearchInput, StatusBadge } from "../../components/app/utils";
import { Select } from "../../components/ui/Select";
import { useInfiniteAuditLogs } from "../../../hooks";
import { AUDIT_LOG } from "../../components/app/audit-log/data";
import type { ComponentType } from "react";
import type { AuditActor, AuditLogRecord } from "../../../types";

const ACTOR_ICON: Record<
  AuditActor,
  ComponentType<{ size?: number; className?: string }>
> = {
  "AI Agent": Bot,
  Merchant: User,
  System: Server,
};

interface NormalizedAuditLog {
  id: string;
  actionType: string;
  description: string;
  actor: AuditActor;
  status: "Success" | "Failed";
  errorDetail?: string;
  timestamp: string;
  rawDetails?: Record<string, unknown>;
}

function formatTimestamp(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return iso;
  }
}

function humanizeAction(action: string): string {
  switch (action) {
    case "payment_link.paid":
      return "Payment Captured";
    case "payment_link.created":
      return "Payment Link Generated";
    case "payouts.synced":
      return "Settlements Synchronized";
    case "razorpay.keys_connected":
      return "Gateway Connected";
    case "order.created":
      return "Order Created";
    case "expense.created":
      return "Expense Recorded";
    default:
      return action
        .replace(/[._]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
  }
}

function resolveActor(record: AuditLogRecord): AuditActor {
  if (record.action.startsWith("ai.") || record.action.includes("agent")) {
    return "AI Agent";
  }
  if (record.user_id) {
    return "Merchant";
  }
  return "System";
}

function resolveDescription(record: AuditLogRecord): string {
  const d = record.details || {};
  if (record.action === "payment_link.paid") {
    return `Customer completed ₹${d.amount ?? ""} payment (Ref: ${d.razorpay_payment_id ?? record.entity_id})`;
  }
  if (record.action === "payment_link.created") {
    return `Generated payment link of ₹${d.amount ?? ""} for ${d.customer_name ?? "customer"}`;
  }
  if (record.action === "payouts.synced") {
    return `Fetched latest nodal bank settlements (${d.synced_count ?? 0} batches processed)`;
  }
  return `Action ${record.action} executed on ${record.entity_type}`;
}

export default function AuditLogPage() {
  const [search, setSearch] = useState("");
  const [actorFilter, setActorFilter] = useState("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteAuditLogs({ limit: 20 });

  const rawLogs = useMemo(() => {
    const liveItems = data?.pages.flatMap((page) => page.items) || [];
    if (liveItems.length > 0) {
      return liveItems.map((record): NormalizedAuditLog => ({
        id: record.id,
        actionType: humanizeAction(record.action),
        description: resolveDescription(record),
        actor: resolveActor(record),
        status: record.details?.error ? "Failed" : "Success",
        errorDetail:
          typeof record.details?.error === "string"
            ? (record.details.error as string)
            : undefined,
        timestamp: record.created_at,
        rawDetails: record.details,
      }));
    }

    return AUDIT_LOG.map((item) => ({
      ...item,
      rawDetails: undefined,
    }));
  }, [data]);

  const filtered = useMemo(() => {
    return rawLogs
      .filter((entry) => {
        const matchesSearch =
          entry.description.toLowerCase().includes(search.toLowerCase()) ||
          entry.actionType.toLowerCase().includes(search.toLowerCase());
        const matchesActor =
          actorFilter === "All" || entry.actor === actorFilter;
        return matchesSearch && matchesActor;
      })
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
  }, [rawLogs, search, actorFilter]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="w-full h-full overflow-y-auto font-intert">
      <div className="px-4 sm:px-10 lg:px-16 py-6 sm:py-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-instrument text-primary tracking-tight">
              Audit Log
            </h1>
            <p className="text-sm text-muted font-intert mt-1 max-w-lg">
              Every action the agent, you, or the system takes — including
              what happens when something fails.
            </p>
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search actions..."
              className="w-full sm:w-56"
            />
            <Select
              value={actorFilter}
              onChange={setActorFilter}
              options={["All", "AI Agent", "Merchant", "System"]}
              className="w-32 shrink-0"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="py-16 text-center border border-border rounded-xl bg-surface">
            <Loader2 size={24} className="animate-spin text-brand mx-auto mb-2" />
            <p className="text-xs text-muted">Streaming audit logs...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center border border-border rounded-xl bg-surface">
            <p className="text-sm text-muted">No matching log entries.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {filtered.map((entry) => {
              const ActorIcon = ACTOR_ICON[entry.actor];
              const isExpanded = expandedId === entry.id;
              return (
                <div
                  key={entry.id}
                  className={`rounded-xl border p-4 bg-surface transition-colors ${
                    entry.status === "Failed"
                      ? "border-danger/30"
                      : "border-border"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        entry.status === "Failed"
                          ? "bg-danger/10 text-danger"
                          : "bg-surface-muted text-secondary"
                      }`}
                    >
                      {entry.status === "Failed" ? (
                        <AlertTriangle size={14} />
                      ) : (
                        <ActorIcon size={14} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-medium text-primary">
                          {entry.actionType}
                        </p>
                        <div className="flex items-center gap-2 shrink-0">
                          <StatusBadge
                            label={entry.actor}
                            variant="neutral"
                          />
                          <StatusBadge
                            label={entry.status}
                            variant={
                              entry.status === "Success"
                                ? "success"
                                : "danger"
                            }
                          />
                        </div>
                      </div>
                      <p className="text-sm text-secondary mt-1">
                        {entry.description}
                      </p>
                      {entry.errorDetail && (
                        <p className="text-xs text-muted mt-1.5 pl-3 border-l-2 border-border-subtle">
                          {entry.errorDetail}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border-subtle text-[11px] text-muted font-mono">
                        <span>{formatTimestamp(entry.timestamp)}</span>
                        {entry.rawDetails && (
                          <button
                            type="button"
                            onClick={() => toggleExpand(entry.id)}
                            className="inline-flex items-center gap-1 text-secondary hover:text-primary transition-colors cursor-pointer"
                          >
                            <span>{isExpanded ? "Hide Details" : "View Payload"}</span>
                            {isExpanded ? (
                              <ChevronUp size={12} />
                            ) : (
                              <ChevronDown size={12} />
                            )}
                          </button>
                        )}
                      </div>

                      {isExpanded && entry.rawDetails && (
                        <div className="mt-3 p-3 rounded-lg bg-surface-muted border border-border overflow-x-auto text-[11px] font-mono text-secondary">
                          <pre>{JSON.stringify(entry.rawDetails, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {hasNextPage && (
              <div className="text-center pt-4 pb-2">
                <button
                  type="button"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="px-5 py-2.5 rounded-xl border border-border bg-surface hover:bg-surface-muted text-xs font-medium text-secondary hover:text-primary transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isFetchingNextPage ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 size={13} className="animate-spin text-brand" />
                      Loading more...
                    </span>
                  ) : (
                    "Load More Logs"
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}