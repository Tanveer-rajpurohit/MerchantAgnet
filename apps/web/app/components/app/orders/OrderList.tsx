"use client";

import { useState, useEffect, useRef } from "react";
import {
  ChevronDown,
  ChevronUp,
  Edit2,
  CheckCircle2,
  XCircle,
  Check,
} from "lucide-react";
import type { OrderResponse, OrderStatus } from "../../../../types";
import { StatusBadge } from "../utils";

interface OrderListProps {
  orders: OrderResponse[];
  onEditOrder: (order: OrderResponse) => void;
  onCancelOrder: (orderId: string) => void;
  onMarkPaid: (orderId: string, totalAmount: number) => void;
  onWhatsAppClick?: (order: OrderResponse) => void;
  isLoading?: boolean;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

function WhatsAppIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className="shrink-0"
    >
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
    </svg>
  );
}

function getInitials(name: string): string {
  if (!name) return "O";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getStatusVariant(
  status: OrderStatus,
): "success" | "warning" | "danger" | "neutral" {
  if (status === "paid") return "success";
  if (status === "unpaid") return "warning";
  if (status === "cancelled") return "danger";
  return "neutral";
}

function formatStatusLabel(status: OrderStatus): string {
  if (status === "paid") return "Paid";
  if (status === "unpaid") return "Unpaid";
  if (status === "cancelled") return "Cancelled";
  if (status === "partially_paid") return "Partially Paid";
  return status;
}

function OrderRow({
  order,
  onEditOrder,
  onCancelOrder,
  onMarkPaid,
  onWhatsAppClick,
}: {
  order: OrderResponse;
  onEditOrder: (order: OrderResponse) => void;
  onCancelOrder: (orderId: string) => void;
  onMarkPaid: (orderId: string, totalAmount: number) => void;
  onWhatsAppClick?: (order: OrderResponse) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const total = Number(order.total_amount) || 0;
  const paid = Number(order.paid_amount) || 0;
  const remaining = Math.max(0, total - paid);

  const formattedDate = new Date(order.created_at).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3.5 py-3.5 px-2 text-left hover:bg-surface-muted/40 transition-colors group cursor-pointer"
      >
        <div className="w-10 h-10 rounded-full bg-surface-muted flex items-center justify-center shrink-0 text-xs font-medium text-secondary">
          {getInitials(order.customer_name)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm font-semibold text-primary truncate font-intert">
                {order.customer_name}
              </span>
              <StatusBadge
                label={formatStatusLabel(order.status)}
                variant={getStatusVariant(order.status)}
              />
            </div>
            <span className="text-[11px] text-muted shrink-0 font-intert">
              {formattedDate}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 mt-0.5">
            <p className="text-xs text-muted truncate font-intert">
              Order #{order.id.slice(0, 8)} · {order.items.length}{" "}
              {order.items.length === 1 ? "item" : "items"} · ₹{total.toLocaleString("en-IN")}
            </p>
            <div className="flex items-center gap-2 shrink-0">
              {remaining > 0 && order.status !== "cancelled" && (
                <span className="text-xs font-medium text-danger">
                  ₹{remaining.toLocaleString("en-IN")} due
                </span>
              )}
              {expanded ? (
                <ChevronUp size={14} className="text-muted" />
              ) : (
                <ChevronDown size={14} className="text-muted" />
              )}
            </div>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="px-2 pb-4 pl-3 sm:pl-[58px]">
          <div className="rounded-xl border border-border bg-bg overflow-hidden mb-3">
            <table className="w-full text-xs font-intert">
              <thead>
                <tr className="border-b border-border bg-surface-muted text-left text-[11px] text-muted uppercase tracking-wide">
                  <th className="px-3 py-2 font-medium">Item Name</th>
                  <th className="px-3 py-2 font-medium text-center">Quantity</th>
                  <th className="px-3 py-2 font-medium text-right">Unit Price</th>
                  <th className="px-3 py-2 font-medium text-right">Line Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, idx) => (
                  <tr key={idx} className="border-b border-border last:border-0">
                    <td className="px-3 py-2 text-primary">{item.product_name_snapshot}</td>
                    <td className="px-3 py-2 text-secondary text-center">{item.quantity}</td>
                    <td className="px-3 py-2 text-secondary text-right font-mono">
                      ₹{Number(item.unit_price_snapshot).toLocaleString("en-IN")}
                    </td>
                    <td className="px-3 py-2 text-primary text-right font-mono">
                      ₹{(Number(item.unit_price_snapshot) * item.quantity).toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-intert mb-3.5 bg-surface-muted/50 p-2.5 rounded-xl border border-border">
            <div className="flex items-center gap-4">
              <span className="text-muted">
                Total Bill:{" "}
                <span className="text-primary font-medium">
                  ₹{total.toLocaleString("en-IN")}
                </span>
              </span>
              <span className="text-muted">
                Paid:{" "}
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  ₹{paid.toLocaleString("en-IN")}
                </span>
              </span>
              {remaining > 0 && order.status !== "cancelled" && (
                <span className="text-muted">
                  Balance Due:{" "}
                  <span className="text-danger font-semibold">
                    ₹{remaining.toLocaleString("en-IN")}
                  </span>
                </span>
              )}
            </div>

            {order.customer_phone && (
              <span className="text-[11px] text-muted">
                Phone: <span className="text-secondary">{order.customer_phone}</span>
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {order.status !== "cancelled" && remaining > 0 && (
              <button
                type="button"
                onClick={() => onWhatsAppClick?.(order)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-medium transition-colors shadow-xs cursor-pointer"
              >
                <WhatsAppIcon size={14} />
                <span>AI WhatsApp Bill & Pay Link</span>
              </button>
            )}

            {order.status !== "paid" && order.status !== "cancelled" && (
              <button
                type="button"
                onClick={() => onMarkPaid(order.id, total)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium transition-colors cursor-pointer"
              >
                <CheckCircle2 size={13} />
                <span>Mark as Paid</span>
              </button>
            )}

            {order.status !== "cancelled" && (
              <button
                type="button"
                onClick={() => onEditOrder(order)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-surface hover:bg-surface-muted text-xs font-medium text-secondary hover:text-primary transition-colors cursor-pointer"
              >
                <Edit2 size={13} />
                <span>Edit Items</span>
              </button>
            )}

            {order.status !== "cancelled" && order.status !== "paid" && (
              <button
                type="button"
                onClick={() => onCancelOrder(order.id)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-surface hover:bg-red-500/10 hover:text-red-600 hover:border-red-500/20 text-xs font-medium text-muted transition-colors cursor-pointer"
              >
                <XCircle size={13} />
                <span>Cancel Order</span>
              </button>
            )}

            {order.status === "paid" && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <Check size={13} />
                  Fully Paid
                </span>
                <button
                  type="button"
                  onClick={() => onWhatsAppClick?.(order)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-surface hover:bg-surface-muted text-xs font-medium text-secondary cursor-pointer"
                >
                  <WhatsAppIcon size={13} />
                  <span>Send Receipt</span>
                </button>
              </div>
            )}

            {order.status === "cancelled" && (
              <span className="text-xs text-muted">This order was cancelled.</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function OrderList({
  orders,
  onEditOrder,
  onCancelOrder,
  onMarkPaid,
  onWhatsAppClick,
  isLoading = false,
  isLoadingMore = false,
  hasMore = false,
  onLoadMore,
}: OrderListProps) {
  const bottomSentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!onLoadMore) return;
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

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="py-16 text-center border border-border rounded-xl bg-surface font-intert">
        <p className="text-sm text-muted">No orders found.</p>
      </div>
    );
  }

  return (
    <div className="font-intert">
      {orders.map((order) => (
        <OrderRow
          key={order.id}
          order={order}
          onEditOrder={onEditOrder}
          onCancelOrder={onCancelOrder}
          onMarkPaid={onMarkPaid}
          onWhatsAppClick={onWhatsAppClick}
        />
      ))}

      <div ref={bottomSentinelRef} className="py-3 flex justify-center">
        {isLoadingMore && (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        )}
      </div>
    </div>
  );
}
