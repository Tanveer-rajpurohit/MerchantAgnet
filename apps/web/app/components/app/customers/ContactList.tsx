"use client";

import { useState } from "react";
import Link from "next/link";
import { UserPlus, Lock, MessageCircle } from "lucide-react";
import type { Customer, ConnectionStatus } from "../../../types/customer";
import { SearchInput, StatusBadge } from "../utils";
import { MESSAGE_LIMIT } from "./data";

interface ContactListProps {
  customers: Customer[];
  onAddCustomer: () => void;
}

const TABS: { id: "all" | ConnectionStatus; label: string }[] = [
  { id: "all", label: "All" },
  { id: "Connected", label: "Connected" },
  { id: "Pending", label: "Pending" },
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function ContactList({ customers, onAddCustomer }: ContactListProps) {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"all" | ConnectionStatus>("all");
  const [visibleCount, setVisibleCount] = useState(20);

  const filtered = customers.filter((c) => {
    const matchesTab = tab === "all" ? true : c.status === tab;
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-instrument text-primary tracking-tight">
            Customers
          </h1>
          <p className="text-sm text-muted font-intert mt-1 max-w-lg">
            Connected customers have completed a purchase or accepted your
            request. Pending contacts get up to {MESSAGE_LIMIT} messages before
            a real connection is required.
          </p>
        </div>
        <button
          onClick={onAddCustomer}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 sm:py-2 rounded-lg bg-brand text-white text-sm font-medium hover:opacity-90 transition-opacity shrink-0"
        >
          <UserPlus size={14} />
          Add Customer
        </button>
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 mt-6 mb-5">
        <div className="flex items-center gap-1 border-b border-border">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
                tab === t.id
                  ? "border-brand text-primary"
                  : "border-transparent text-muted hover:text-secondary"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search customers..."
          className="w-full sm:w-96"
        />
      </div>

      {visible.length === 0 ? (
        <div className="py-16 text-center border border-border rounded-xl bg-surface">
          <p className="text-sm text-muted font-intert">No customers found.</p>
        </div>
      ) : (
        <div>
          {visible.map((c) => {
            const remaining = MESSAGE_LIMIT - c.messagesUsed;
            const isBlocked = c.status === "Pending" && remaining <= 0;

            return (
              <Link
                key={c.id}
                href={`/customers/${c.id}`}
                className="flex items-center gap-3.5 py-3.5 px-2 border-b border-border hover:bg-surface-muted/40 transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-surface-muted flex items-center justify-center shrink-0 text-xs font-medium text-secondary">
                  {getInitials(c.name)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <p className="text-sm font-medium text-primary truncate">
                        {c.name}
                      </p>
                      {c.status === "Pending" && (
                        <StatusBadge label="Pending" variant="warning" />
                      )}
                    </div>
                    <span className="text-[11px] text-muted shrink-0">
                      {c.lastMessageTime}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <p className="text-xs text-muted truncate">
                      {c.lastMessage || "No messages yet"}
                    </p>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {c.unread && c.unread > 0 && (
                        <span className="w-5 h-5 rounded-full bg-brand text-white text-[10px] font-medium flex items-center justify-center">
                          {c.unread}
                        </span>
                      )}
                      {isBlocked ? (
                        <Lock size={12} className="text-muted" />
                      ) : (
                        <MessageCircle
                          size={12}
                          className="text-muted opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                      )}
                    </div>
                  </div>

                  {c.status === "Pending" && (
                    <p className="text-[10px] text-muted mt-0.5">
                      {remaining > 0
                        ? `${c.messagesUsed}/${MESSAGE_LIMIT} messages used`
                        : "Message limit reached"}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}

          {hasMore && (
            <div className="py-4 text-center">
              <button
                onClick={() => setVisibleCount((prev) => prev + 20)}
                className="text-sm font-medium link-brand cursor-pointer"
              >
                Load more
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
