"use client";

import { Plus, Trash2 } from "lucide-react";
import { ProductRow } from "../../../types";

const generateId = () => Math.random().toString(36).slice(2, 9);

export function Step4Products({
  products,
  setProducts,
  skipInventory,
  setSkipInventory,
}: {
  products: ProductRow[];
  setProducts: (p: ProductRow[]) => void;
  skipInventory: boolean;
  setSkipInventory: (v: boolean) => void;
}) {
  const addRow = () => {
    setProducts([
      ...products,
      {
        id: generateId(),
        name: "",
        costPrice: "",
        sellingPrice: "",
        currentStock: "",
        lowStockAlert: "",
      },
    ]);
  };

  const removeRow = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  const updateRow = (id: string, field: keyof ProductRow, value: string) => {
    setProducts(
      products.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-instrument text-3xl text-primary mb-2">
          Products & Inventory
        </h2>
        <p className="font-intert text-secondary text-sm">
          Add your catalog so AI can create payment links and track stock.
        </p>
      </div>

      <div className="flex items-center gap-3 p-4 rounded-xl bg-surface border border-border">
        <button
          type="button"
          onClick={() => setSkipInventory(!skipInventory)}
          className={`w-10 h-5 rounded-full transition-colors relative shrink-0 ${
            skipInventory ? "bg-brand" : "bg-border"
          }`}
        >
          <div
            className={`w-4 h-4 rounded-full bg-bg absolute top-0.5 transition-all ${
              skipInventory ? "left-5" : "left-0.5"
            }`}
          />
        </button>
        <span className="text-sm font-intert text-secondary">
          I don't track inventory
        </span>
      </div>

      {!skipInventory && (
        <div className="border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-intert">
              <thead>
                <tr className="bg-surface-muted border-b border-border">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                    Product Name
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                    Cost (₹)
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                    Sell (₹)
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider hidden sm:table-cell">
                    Stock
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider hidden sm:table-cell">
                    Low Alert
                  </th>
                  <th className="w-12 px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {products.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-border last:border-b-0"
                  >
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        placeholder="Maggi 12-pack"
                        value={row.name}
                        onChange={(e) =>
                          updateRow(row.id, "name", e.target.value)
                        }
                        className="w-full bg-transparent text-primary placeholder:text-muted focus:outline-none py-1"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        placeholder="120"
                        value={row.costPrice}
                        onChange={(e) =>
                          updateRow(row.id, "costPrice", e.target.value)
                        }
                        className="w-full bg-transparent text-primary font-mono placeholder:text-muted focus:outline-none py-1 w-20"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        placeholder="145"
                        value={row.sellingPrice}
                        onChange={(e) =>
                          updateRow(row.id, "sellingPrice", e.target.value)
                        }
                        className="w-full bg-transparent text-primary font-mono placeholder:text-muted focus:outline-none py-1 w-20"
                      />
                    </td>
                    <td className="px-4 py-2 hidden sm:table-cell">
                      <input
                        type="text"
                        placeholder="48"
                        value={row.currentStock}
                        onChange={(e) =>
                          updateRow(row.id, "currentStock", e.target.value)
                        }
                        className="w-full bg-transparent text-primary font-mono placeholder:text-muted focus:outline-none py-1 w-16"
                      />
                    </td>
                    <td className="px-4 py-2 hidden sm:table-cell">
                      <input
                        type="text"
                        placeholder="10"
                        value={row.lowStockAlert}
                        onChange={(e) =>
                          updateRow(row.id, "lowStockAlert", e.target.value)
                        }
                        className="w-full bg-transparent text-primary font-mono placeholder:text-muted focus:outline-none py-1 w-16"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <button
                        type="button"
                        onClick={() => removeRow(row.id)}
                        className="text-muted hover:text-danger transition-colors p-1"
                        aria-label="Delete row"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 bg-surface-muted border-t border-border">
            <button
              type="button"
              onClick={addRow}
              className="inline-flex items-center gap-1.5 text-xs font-medium font-intert text-brand hover:text-brand-subtle transition-colors"
            >
              <Plus size={14} /> Add product
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
