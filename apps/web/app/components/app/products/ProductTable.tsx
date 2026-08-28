import { Trash2, AlertTriangle } from "lucide-react";
import type { ProductRow } from "../../../types/onboarding";

interface ProductTableProps {
  products: ProductRow[];
  handleChange: (id: string, field: keyof ProductRow, value: string) => void;
  handleDelete: (id: string) => void;
}

export function ProductTable({
  products,
  handleChange,
  handleDelete,
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
            <th className="px-5 py-3 font-medium">Low Alert</th>
            <th className="px-5 py-3 font-medium text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {products.map((row) => {
            const stock = Number(row.currentStock) || 0;
            const alert = Number(row.lowStockAlert) || 0;
            const isLow = alert > 0 && stock <= alert;
            return (
              <tr
                key={row.id}
                className="border-b border-border last:border-0 hover:bg-surface-muted/60 transition-colors"
              >
                <td className="px-5 py-2.5">
                  <input
                    value={row.name}
                    onChange={(e) =>
                      handleChange(row.id, "name", e.target.value)
                    }
                    className="w-full bg-transparent text-primary font-medium focus:outline-none"
                  />
                </td>
                <td className="px-5 py-2.5">
                  <input
                    inputMode="numeric"
                    value={row.costPrice}
                    onChange={(e) =>
                      handleChange(row.id, "costPrice", e.target.value)
                    }
                    className="w-16 bg-transparent text-secondary focus:outline-none"
                  />
                </td>
                <td className="px-5 py-2.5">
                  <input
                    inputMode="numeric"
                    value={row.sellingPrice}
                    onChange={(e) =>
                      handleChange(row.id, "sellingPrice", e.target.value)
                    }
                    className="w-16 bg-transparent text-secondary focus:outline-none"
                  />
                </td>
                <td className="px-5 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <input
                      inputMode="numeric"
                      value={row.currentStock}
                      onChange={(e) =>
                        handleChange(row.id, "currentStock", e.target.value)
                      }
                      className="w-14 bg-transparent text-secondary focus:outline-none"
                    />
                    {isLow && (
                      <AlertTriangle size={13} className="text-warning" />
                    )}
                  </div>
                </td>
                <td className="px-5 py-2.5">
                  <input
                    inputMode="numeric"
                    value={row.lowStockAlert}
                    onChange={(e) =>
                      handleChange(row.id, "lowStockAlert", e.target.value)
                    }
                    className="w-14 bg-transparent text-secondary focus:outline-none"
                  />
                </td>
                <td className="px-5 py-2.5 text-right">
                  <button
                    onClick={() => handleDelete(row.id)}
                    className="text-muted hover:text-danger transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            );
          })}
          {products.length === 0 && (
            <tr>
              <td colSpan={6} className="px-5 py-10 text-center text-muted">
                No products found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
