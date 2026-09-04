"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Phone,
  X,
} from "lucide-react";
import { useCustomerOrders } from "../../../../hooks/useOrders";
import { StatusBadge } from "../../../components/app/utils";
import type { OrderResponse, OrderStatus } from "../../../../types";

function getStatusBadgeVariant(
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
  return new Date(iso).toLocaleDateString("en-IN");
}

export default function UserOrdersPage() {
  const { data, isLoading } = useCustomerOrders();
  const orders = data?.items || [];
  const [expanded, setExpanded] = useState<string | null>(null);
  const [contactOrder, setContactOrder] = useState<OrderResponse | null>(null);

  return (
    <div className="w-full h-full overflow-y-auto font-intert">
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-10">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-instrument text-primary tracking-tight">
            My Orders &amp; Receipts
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Your purchases from local stores. Tap a card to see the itemized bill.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-brand border-t-transparent" />
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center border border-border rounded-2xl bg-surface">
            <ShoppingBag size={28} className="mx-auto text-muted mb-2" />
            <p className="text-sm font-medium text-primary">No orders placed yet</p>
            <p className="text-xs text-muted mt-1 max-w-sm mx-auto">
              Start a chat with any local store to place your first order — the
              AI Copilot will handle the bill and payment link for you.
            </p>
            <Link
              href="/user"
              className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-xl btn-brand-solid text-xs font-medium cursor-pointer"
            >
              <MessageSquare size={13} />
              <span>Browse Local Shops</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((ord) => {
              const total = Number(ord.total_amount) || 0;
              const isOpen = expanded === ord.id;

              return (
                <div
                  key={ord.id}
                  className="rounded-2xl border border-border bg-surface shadow-xs overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : ord.id)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-surface-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
                        <ShoppingBag size={15} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-primary truncate">
                          {ord.store_name}
                        </h3>
                        <p className="text-[11px] text-muted">
                          Order #{ord.id.slice(0, 8)} · {timeAgo(ord.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-instrument text-primary font-semibold">
                        ₹{total.toLocaleString("en-IN")}
                      </span>
                      <StatusBadge
                        label={formatStatusLabel(ord.status)}
                        variant={getStatusBadgeVariant(ord.status)}
                      />
                      {isOpen ? (
                        <ChevronUp size={14} className="text-muted" />
                      ) : (
                        <ChevronDown size={14} className="text-muted" />
                      )}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="border-t border-border">
                      <div className="px-5 py-3">
                        <p className="text-[10px] text-muted uppercase tracking-wide mb-2">
                          Items
                        </p>
                        <div className="divide-y divide-border-subtle">
                          {ord.items.map((it) => (
                            <div
                              key={it.id}
                              className="py-2.5 flex items-center justify-between text-xs"
                            >
                              <div className="min-w-0">
                                <p className="text-secondary font-medium truncate">
                                  {it.product_name_snapshot}
                                </p>
                                <p className="text-[11px] text-muted">
                                  {it.quantity} × ₹{Number(it.unit_price_snapshot).toLocaleString("en-IN")}
                                </p>
                              </div>
                              <span className="text-primary font-medium shrink-0 ml-3">
                                ₹{(Number(it.unit_price_snapshot) * it.quantity).toLocaleString("en-IN")}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-t border-border bg-bg/40">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-muted">Total:</span>
                          <span className="text-base font-instrument text-primary font-semibold">
                            ₹{total.toLocaleString("en-IN")}
                          </span>
                          {Number(ord.paid_amount) > 0 && Number(ord.paid_amount) < total && (
                            <span className="text-[11px] text-muted ml-1">
                              (₹{Number(ord.paid_amount).toLocaleString("en-IN")} paid)
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setContactOrder(ord)}
                            className="px-3.5 py-1.5 rounded-xl border border-border bg-surface hover:bg-surface-muted text-secondary hover:text-primary text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <MessageSquare size={12} />
                            <span>Request Change</span>
                          </button>
                          <Link
                            href="/user"
                            className="px-3.5 py-1.5 rounded-xl btn-brand-solid text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                          >
                            <ShoppingBag size={12} />
                            <span>Order Again</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {contactOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => setContactOrder(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-border bg-surface shadow-lg p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-base font-instrument text-primary">
                  Request a change
                </h3>
                <p className="text-xs text-muted mt-0.5">
                  Order #{contactOrder.id.slice(0, 8)} · {contactOrder.store_name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setContactOrder(null)}
                className="w-8 h-8 rounded-lg hover:bg-surface-muted flex items-center justify-center text-muted hover:text-primary transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="rounded-xl border border-border bg-bg/50 p-4 mb-4">
              <p className="text-sm text-secondary leading-relaxed">
                To change the items, quantity, or price of this order, message
                the store directly. The merchant will update the order on their
                side and send you a fresh payment link if needed.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted mb-4">
              <Phone size={12} />
              <span>You can also call the store directly if urgent.</span>
            </div>

            <div className="flex gap-2">
              <Link
                href="/user"
                className="flex-1 px-4 py-2.5 rounded-xl btn-brand-solid text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <MessageSquare size={13} />
                <span>Open Store Chat</span>
              </Link>
              <button
                type="button"
                onClick={() => setContactOrder(null)}
                className="px-4 py-2.5 rounded-xl border border-border bg-surface hover:bg-surface-muted text-secondary text-xs font-medium cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
