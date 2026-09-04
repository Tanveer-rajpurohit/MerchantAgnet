"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { useProducts } from "../../../../hooks/useProducts";

export function LowStock() {
  const { data: products, isLoading } = useProducts();

  const lowStockItems =
    (products || []).filter(
      (p) => p.current_stock <= (p.low_stock_alert || 0)
    ) || [];

  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden">
      <div className="px-5 py-3.5 border-b border-border flex items-center gap-2">
        <AlertTriangle size={14} className="text-warning" />
        <h2 className="text-sm font-medium text-primary">Low Stock</h2>
      </div>
      <div>
        {isLoading ? (
          <div className="px-5 py-8 text-center">
            <div className="h-5 w-5 mx-auto animate-spin rounded-full border-2 border-brand border-t-transparent" />
          </div>
        ) : lowStockItems.length === 0 ? (
          <div className="px-5 py-6 text-center text-xs text-muted">
            All products are above their low-stock threshold.
          </div>
        ) : (
          lowStockItems.map((item) => (
            <div
              key={item.id}
              className="px-5 py-3 border-b border-border last:border-0"
            >
              <p className="text-sm text-primary">{item.product_name}</p>
              <p className="text-xs text-muted">
                {item.current_stock} left · alert at {item.low_stock_alert}
              </p>
            </div>
          ))
        )}
        <Link
          href="/products"
          className="block px-5 py-3 text-xs text-brand hover:underline"
        >
          View all products →
        </Link>
      </div>
    </div>
  );
}
