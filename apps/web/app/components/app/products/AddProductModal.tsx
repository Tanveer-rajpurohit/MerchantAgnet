import { useState } from "react";
import type { ProductCreatePayload } from "../../../../types";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (payload: ProductCreatePayload) => Promise<void> | void;
  isPending?: boolean;
}

export function AddProductModal({
  isOpen,
  onClose,
  onAdd,
  isPending = false,
}: AddProductModalProps) {
  const [name, setName] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [currentStock, setCurrentStock] = useState("");
  const [lowStockAlert, setLowStockAlert] = useState("");

  if (!isOpen) return null;

  const handleClose = () => {
    setName("");
    setCostPrice("");
    setSellingPrice("");
    setCurrentStock("");
    setLowStockAlert("");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await onAdd({
      product_name: name.trim(),
      cost_price: Number(costPrice) || 0,
      selling_price: Number(sellingPrice) || 0,
      current_stock: Number(currentStock) || 0,
      low_stock_alert: lowStockAlert ? Number(lowStockAlert) : null,
    });

    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 font-intert shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-auto">
        <h2 className="text-lg font-instrument text-primary mb-1">
          Add Product
        </h2>
        <p className="text-xs text-muted mb-4">
          Add catalog item for AI stock inquiries and payment links.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-muted block mb-1 font-medium">
              Product Name *
            </label>
            <input
              required
              placeholder="e.g. Amul Butter 500g"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border bg-bg text-primary placeholder:text-muted focus:outline-none focus:border-brand/50 shadow-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted block mb-1 font-medium">
                Cost Price (₹) *
              </label>
              <input
                required
                type="number"
                step="any"
                placeholder="220"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border bg-bg text-primary placeholder:text-muted focus:outline-none focus:border-brand/50 shadow-xs"
              />
            </div>
            <div>
              <label className="text-xs text-muted block mb-1 font-medium">
                Selling Price (₹) *
              </label>
              <input
                required
                type="number"
                step="any"
                placeholder="250"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border bg-bg text-primary placeholder:text-muted focus:outline-none focus:border-brand/50 shadow-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted block mb-1 font-medium">
                Current Stock *
              </label>
              <input
                required
                type="number"
                placeholder="25"
                value={currentStock}
                onChange={(e) => setCurrentStock(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border bg-bg text-primary placeholder:text-muted focus:outline-none focus:border-brand/50 shadow-xs"
              />
            </div>
            <div>
              <label className="text-xs text-muted block mb-1 font-medium">
                Low Stock Alert
              </label>
              <input
                type="number"
                placeholder="5"
                value={lowStockAlert}
                onChange={(e) => setLowStockAlert(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border bg-bg text-primary placeholder:text-muted focus:outline-none focus:border-brand/50 shadow-xs"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isPending}
              className="px-4 py-2 rounded-xl text-sm text-secondary hover:bg-surface-muted transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !name.trim()}
              className="px-4 py-2 rounded-xl btn-brand-solid text-sm font-medium shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {isPending ? "Adding..." : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
