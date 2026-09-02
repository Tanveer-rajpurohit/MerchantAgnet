import { Trash2, Edit2, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import type { ProductResponse } from "../../../../types";

interface ProductMobileListProps {
  products: ProductResponse[];
  onEdit: (product: ProductResponse) => void;
  onDelete: (id: string) => void;
}

export function ProductMobileList({
  products,
  onEdit,
  onDelete,
}: ProductMobileListProps) {
  return (
    <div className="sm:hidden flex flex-col gap-2.5">
      {products.map((row) => {
        const stock = Number(row.current_stock) || 0;
        const alert = Number(row.low_stock_alert) || 0;
        const isLow = alert > 0 && stock <= alert;

        return (
          <div
            key={row.id}
            className="rounded-xl border border-border bg-surface p-4 font-intert"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <p className="text-sm font-medium text-primary">
                  {row.product_name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {row.is_active ? (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-medium border border-emerald-500/20">
                      <CheckCircle2 size={10} />
                      <span>Active</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-surface-muted text-muted text-[10px] font-medium border border-border">
                      <XCircle size={10} />
                      <span>Inactive</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onEdit(row)}
                  className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-surface-muted transition-colors cursor-pointer"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(row.id)}
                  className="p-1.5 rounded-lg text-muted hover:text-danger transition-colors cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-muted pt-2 border-t border-border mt-2">
              <span>Cost ₹{row.cost_price}</span>
              <span className="font-medium text-primary">Sell ₹{row.selling_price}</span>
              <span className="flex items-center gap-1">
                Stock {row.current_stock}
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
