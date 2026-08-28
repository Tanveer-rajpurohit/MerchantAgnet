import { Trash2, AlertTriangle } from "lucide-react";
import type { ProductRow } from "../../../types/onboarding";

interface ProductMobileListProps {
  products: ProductRow[];
  handleDelete: (id: string) => void;
  handleChange?: (id: string, field: keyof ProductRow, value: string) => void;
}

export function ProductMobileList({
  products,
  handleDelete,
}: ProductMobileListProps) {
  return (
    <div className="sm:hidden flex flex-col gap-2.5">
      {products.map((row) => {
        const stock = Number(row.currentStock) || 0;
        const alert = Number(row.lowStockAlert) || 0;
        const isLow = alert > 0 && stock <= alert;
        return (
          <div
            key={row.id}
            className="rounded-xl border border-border bg-surface p-4"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <p className="text-sm font-medium text-primary">
                {row.name || "Unnamed product"}
              </p>
              <button
                onClick={() => handleDelete(row.id)}
                className="text-muted hover:text-danger transition-colors shrink-0"
              >
                <Trash2 size={14} />
              </button>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted">
              <span>Cost ₹{row.costPrice}</span>
              <span>Sell ₹{row.sellingPrice}</span>
              <span className="flex items-center gap-1">
                Stock {row.currentStock}
                {isLow && <AlertTriangle size={12} className="text-warning" />}
              </span>
            </div>
          </div>
        );
      })}
      {products.length === 0 && (
        <div className="py-10 text-center text-muted text-sm border border-border rounded-xl bg-surface">
          No products found.
        </div>
      )}
    </div>
  );
}
