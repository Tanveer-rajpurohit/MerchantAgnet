"use client";

import Link from "next/link";
import { ShoppingBag, MessageSquare } from "lucide-react";
import { useCustomerOrders } from "../../../../hooks/useOrders";
import { StatusBadge } from "../../../components/app/utils";
import type { OrderStatus } from "../../../../types";

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

export default function UserOrdersPage() {
  const { data, isLoading } = useCustomerOrders();
  const orders = data?.items || [];

  return (
    <div className="w-full h-full overflow-y-auto font-intert">
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-10">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-instrument text-primary tracking-tight">
            My Orders & Receipts
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Track your grocery and store purchases made via AI Copilot.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-brand border-t-transparent" />
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center border border-border rounded-2xl bg-surface">
            <p className="text-sm font-medium text-primary">No orders placed yet</p>
            <p className="text-xs text-muted mt-1">
              Start a chat with any local store to place your first automated grocery order.
            </p>
            <Link
              href="/shops"
              className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-xl btn-brand-solid text-xs font-medium cursor-pointer"
            >
              <MessageSquare size={13} />
              <span>Browse Local Shops</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((ord) => {
              const total = Number(ord.total_amount) || 0;
              const formattedDate = new Date(ord.created_at).toLocaleDateString("en-IN", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              return (
                <div
                  key={ord.id}
                  className="p-5 rounded-2xl border border-border bg-surface shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
                        <ShoppingBag size={14} />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-primary">
                          {ord.store_name}
                        </h3>
                        <p className="text-[11px] text-muted">
                          Order #{ord.id.slice(0, 8)} · {formattedDate}
                        </p>
                      </div>
                    </div>
                    <StatusBadge
                      label={formatStatusLabel(ord.status)}
                      variant={getStatusBadgeVariant(ord.status)}
                    />
                  </div>

                  <div className="divide-y divide-border-subtle mb-4">
                    {ord.items.map((it) => (
                      <div
                        key={it.id}
                        className="py-2 flex items-center justify-between text-xs"
                      >
                        <span className="text-secondary font-medium">
                          {it.product_name_snapshot}{" "}
                          <span className="text-muted">× {it.quantity}</span>
                        </span>
                        <span className="text-primary font-medium">
                          ₹{(Number(it.unit_price_snapshot) * it.quantity).toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-muted">Total:</span>
                      <span className="text-base font-instrument text-primary font-semibold">
                        ₹{total.toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href="/shops"
                        className="px-3.5 py-1.5 rounded-xl btn-brand-solid text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                      >
                        <MessageSquare size={12} />
                        <span>Order Again</span>
                      </Link>
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
