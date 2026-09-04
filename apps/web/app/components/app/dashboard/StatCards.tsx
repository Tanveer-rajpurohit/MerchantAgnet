"use client";

import { useMemo } from "react";
import { usePaymentLinks } from "../../../../hooks/usePaymentLinks";
import { useOrders } from "../../../../hooks/useOrders";
import { useProducts } from "../../../../hooks/useProducts";

export function StatCards() {
  const { data: linkData } = usePaymentLinks({ page: 1, count: 100 });
  const { data: ordersData } = useOrders({ limit: 100 });
  const { data: products } = useProducts();

  const stats = useMemo(() => {
    const links = linkData?.items ?? [];
    const orders = ordersData?.items ?? [];
    const prods = products ?? [];

    const today = new Date();
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    ).getTime();
    const todayCollection = links
      .filter(
        (l) =>
          l.status === "paid" &&
          new Date(l.created_at).getTime() >= startOfToday
      )
      .reduce((sum, l) => sum + Number(l.amount), 0);

    const pendingLinks = links.filter(
      (l) => l.status === "created" || l.status === "partially_paid"
    ).length;

    const lowStockItems = prods.filter(
      (p) => p.current_stock <= (p.low_stock_alert || 0)
    ).length;

    const activeOrders = orders.filter((o) => o.status === "unpaid").length;

    return { todayCollection, pendingLinks, lowStockItems, activeOrders };
  }, [linkData, ordersData, products]);

  const fmtINR = (n: number) =>
    "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
      <StatCard
        label="Today's Collection"
        value={fmtINR(stats.todayCollection)}
      />
      <StatCard
        label="Pending Links"
        value={String(stats.pendingLinks)}
        accent={stats.pendingLinks > 0 ? "warning" : undefined}
      />
      <StatCard
        label="Low Stock Items"
        value={String(stats.lowStockItems)}
        accent={stats.lowStockItems > 0 ? "warning" : undefined}
      />
      <StatCard
        label="Active Orders"
        value={String(stats.activeOrders)}
        accent={stats.activeOrders > 0 ? "brand" : undefined}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "brand" | "warning";
}) {
  const valueColor =
    accent === "warning"
      ? "text-warning"
      : accent === "brand"
        ? "text-brand"
        : "text-primary";
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="text-xs text-muted uppercase tracking-wide mb-1.5">
        {label}
      </p>
      <p className={`text-2xl font-instrument ${valueColor}`}>{value}</p>
    </div>
  );
}
