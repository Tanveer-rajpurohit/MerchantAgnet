"use client";

import { useMemo } from "react";
import { useInfiniteAuditLogs } from "../../../../hooks/useAuditLogs";
import type { AuditLogRecord } from "../../../../types";

function describeAction(record: AuditLogRecord): { type: string; detail: string } {
  const d = record.details || {};
  switch (record.action) {
    case "payment_link.created":
      return {
        type: "Payment Link",
        detail: `₹${d.amount ?? "-"} to ${d.customer_name ?? "customer"} - Created`,
      };
    case "payment_link.paid":
      return {
        type: "Payment",
        detail: `₹${d.amount ?? "-"} collected from ${d.customer_name ?? "customer"}`,
      };
    case "payment_link.status_checked":
      return { type: "Payment Check", detail: `Status: ${d.status ?? "-"} for ${d.razorpay_status ?? "-"}` };
    case "order.created":
      return {
        type: "Order",
        detail: `₹${d.total_amount ?? "-"} for ${d.customer_id ?? "customer"} - ${d.item_count ?? 0} item(s)`,
      };
    case "order.status_updated":
      return { type: "Order", detail: `Status updated to ${d.new_status ?? "-"}` };
    case "expense.created":
      return { type: "Expense", detail: `₹${d.amount ?? "-"} under ${d.category ?? "-"}` };
    case "expense.updated":
      return { type: "Expense", detail: `${d.category ?? "-"} updated` };
    case "expense.deleted":
      return { type: "Expense", detail: `${d.category ?? "-"} deleted` };
    case "product.created":
      return { type: "Product", detail: `Added ${d.name ?? "-"}` };
    case "product.updated":
      return { type: "Product", detail: `Updated ${d.name ?? "-"}` };
    case "product.deleted":
      return { type: "Product", detail: `Deleted ${d.name ?? "-"}` };
    case "customer.message_sent":
      return { type: "Message", detail: `Sent to ${d.customer_name ?? "customer"}` };
    case "campaign.drafted":
      return { type: "Campaign", detail: `${d.offer ?? "-"} for ${d.target_count ?? 0} customers - awaiting approval` };
    case "campaign.approved":
      return { type: "Campaign", detail: `Approved — ${d.sent ?? 0} sent, ${d.failed ?? 0} failed` };
    case "campaign.declined":
      return { type: "Campaign", detail: `Declined` };
    default:
      return { type: record.entity_type, detail: record.action };
  }
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
  return new Date(iso).toLocaleDateString();
}

export function RecentActivity() {
  const { data, isLoading } = useInfiniteAuditLogs({ limit: 10 });
  const items = useMemo(() => {
    const pages = data?.pages ?? [];
    const all: AuditLogRecord[] = [];
    for (const p of pages) all.push(...(p.items ?? []));
    return all.slice(0, 6);
  }, [data]);

  return (
    <div className="lg:col-span-2 rounded-xl border border-border bg-surface overflow-hidden">
      <div className="px-5 py-3.5 border-b border-border">
        <h2 className="text-sm font-medium text-primary">Recent Activity</h2>
      </div>
      <div>
        {isLoading ? (
          <div className="px-5 py-8 text-center">
            <div className="h-5 w-5 mx-auto animate-spin rounded-full border-2 border-brand border-t-transparent" />
          </div>
        ) : items.length === 0 ? (
          <div className="px-5 py-8 text-center text-xs text-muted">
            No recent activity yet. Start by creating a payment link or an order.
          </div>
        ) : (
          items.map((item) => {
            const { type, detail } = describeAction(item);
            return (
              <div
                key={item.id}
                className="flex items-center justify-between px-5 py-3 border-b border-border last:border-0"
              >
                <div className="min-w-0">
                  <p className="text-xs text-muted mb-0.5">{type}</p>
                  <p className="text-sm text-primary truncate">{detail}</p>
                </div>
                <p className="text-xs text-muted shrink-0 ml-4">
                  {timeAgo(item.created_at)}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
