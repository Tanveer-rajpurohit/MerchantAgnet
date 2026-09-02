import { Trash2, Edit2, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import type { ProductResponse } from "../../../../types";

interface ProductTableProps {
  products: ProductResponse[];
  onEdit: (product: ProductResponse) => void;
  onDelete: (id: string) => void;
}

export function ProductTable({
  products,
  onEdit,
  onDelete,
}: ProductTableProps) {
  return (
    <div className="hidden sm:block rounded-xl border border-border bg-surface overflow-hidden">
      <table className="w-full text-sm font-intert">
        <thead>
          <tr className="border-b border-border bg-surface-muted text-left text-xs text-muted uppercase tracking-wide">
            <th className="px-5 py-3 font-medium">Product Name</th>
            <th className="px-5 py-3 font-medium">Cost (₹)</th>
            <th className="px-5 py-3 font-medium">Sell (₹)</th>
            <th className="px-5 py-3 font-medium">Stock</th>
            <th className="px-5 py-3 font-medium">Status</th>
            <th className="px-5 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((row) => {
            const stock = Number(row.current_stock) || 0;
            const alert = Number(row.low_stock_alert) || 0;
            const isLow = alert > 0 && stock <= alert;

            return (
              <tr
                key={row.id}
                className="border-b border-border last:border-0 hover:bg-surface-muted/60 transition-colors"
              >
                <td className="px-5 py-3 font-medium text-primary">
                  {row.product_name}
                </td>
                <td className="px-5 py-3 text-secondary">
                  ₹{row.cost_price}
                </td>
                <td className="px-5 py-3 text-primary font-medium">
                  ₹{row.selling_price}
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-1.5 text-secondary">
                    <span>{row.current_stock}</span>
                    {isLow && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                        <AlertTriangle size={12} />
                        <span>Low</span>
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-3">
                  {row.is_active ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium border border-emerald-500/20">
                      <CheckCircle2 size={11} />
                      <span>Active</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-muted text-muted text-xs font-medium border border-border">
                      <XCircle size={11} />
                      <span>Inactive</span>
                    </span>
                  )}
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(row)}
                      className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-surface-muted transition-colors cursor-pointer"
                      title="Edit Product"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(row.id)}
                      className="p-1.5 rounded-lg text-muted hover:text-red-600 hover:bg-red-500/10 transition-colors cursor-pointer"
                      title="Delete Product"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
          {products.length === 0 && (
            <tr>
              <td colSpan={6} className="px-5 py-10 text-center text-muted">
                No products found in catalog.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
