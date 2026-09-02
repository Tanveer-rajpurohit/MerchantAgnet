"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Bot, User, Server } from "lucide-react";
import { SearchInput, StatusBadge } from "../../components/app/utils";
import { Select } from "../../components/ui/Select";
import { AUDIT_LOG } from "../../components/app/audit-log/data";
import type { ComponentType } from "react";
import type { AuditActor } from "../../../types";

const ACTOR_ICON: Record<AuditActor, ComponentType<{ size?: number; className?: string }>> = {
  "AI Agent": Bot,
  Merchant: User,
  System: Server,
};

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function AuditLogPage() {
  const [search, setSearch] = useState("");
  const [actorFilter, setActorFilter] = useState("All");

  const filtered = useMemo(() => {
    return AUDIT_LOG.filter((entry) => {
      const matchesSearch =
        entry.description.toLowerCase().includes(search.toLowerCase()) ||
        entry.actionType.toLowerCase().includes(search.toLowerCase());
      const matchesActor =
        actorFilter === "All" || entry.actor === actorFilter;
      return matchesSearch && matchesActor;
    }).sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }, [search, actorFilter]);

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

        {filtered.length === 0 ? (
          <div className="py-16 text-center border border-border rounded-xl bg-surface">
            <p className="text-sm text-muted">No matching log entries.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {filtered.map((entry) => {
              const ActorIcon = ACTOR_ICON[entry.actor];
              return (
                <div
                  key={entry.id}
                  className={`rounded-xl border p-4 bg-surface ${
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
                      <p className="text-[11px] text-muted font-mono mt-2">
                        {formatTimestamp(entry.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}