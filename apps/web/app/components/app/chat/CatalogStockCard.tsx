"use client";

import { Package, AlertTriangle, CheckCircle2 } from "lucide-react";

export interface StockItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  threshold: number;
  sellingPrice: string;
  status: "low" | "ok" | "critical";
}

interface CatalogStockCardProps {
  title?: string;
  items: StockItem[];
}

export function CatalogStockCard({
  title = "Live Inventory & Stock Status",
  items,
}: CatalogStockCardProps) {
  return (
    <div className="w-full my-4 rounded-2xl border border-border bg-surface p-4 sm:p-5 font-intert">
      <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand/15 text-brand flex items-center justify-center shrink-0">
            <Package size={15} />
          </div>
          <div>
            <span className="text-xs font-semibold text-primary block leading-none">
              {title}
            </span>
            <span className="text-[11px] text-muted">
              Exact store inventory records
            </span>
          </div>
        </div>

        <span className="text-xs text-muted font-mono">
          {items.length} items checked
        </span>
      </div>

      <div className="divide-y divide-border-subtle overflow-hidden">
        {items.map((item) => (
          <div
            key={item.id}
            className="py-2.5 flex items-center justify-between gap-3 text-xs"
          >
            <div className="min-w-0 flex-1">
              <p className="font-medium text-primary truncate">{item.name}</p>
              <p className="text-[11px] text-muted">{item.category}</p>
            </div>

            <div className="text-right">
              <span className="font-mono font-medium text-primary block">
                {item.sellingPrice}
              </span>
              <span className="text-[11px] text-muted">
                Stock: {item.currentStock} / Alert at {item.threshold}
              </span>
            </div>

            <div className="shrink-0 pl-2">
              {item.status === "critical" || item.status === "low" ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-semibold border border-amber-500/20">
                  <AlertTriangle size={10} />
                  <span>Low Stock</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">
                  <CheckCircle2 size={10} />
                  <span>In Stock</span>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
