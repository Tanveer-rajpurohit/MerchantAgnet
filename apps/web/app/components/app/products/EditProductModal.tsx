import { useState, useEffect } from "react";
import type { ProductResponse, ProductUpdatePayload } from "../../../../types";
import { Checkbox } from "../../../components/ui/Checkbox";

interface EditProductModalProps {
  product: ProductResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, payload: ProductUpdatePayload) => Promise<void> | void;
  isPending?: boolean;
}

export function EditProductModal({
  product,
  isOpen,
  onClose,
  onUpdate,
  isPending = false,
}: EditProductModalProps) {
  const [name, setName] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [currentStock, setCurrentStock] = useState("");
  const [lowStockAlert, setLowStockAlert] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (product) {
      setName(product.product_name);
      setCostPrice(String(product.cost_price));
      setSellingPrice(String(product.selling_price));
      setCurrentStock(String(product.current_stock));
      setLowStockAlert(product.low_stock_alert ? String(product.low_stock_alert) : "");
      setIsActive(product.is_active);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await onUpdate(product.id, {
      product_name: name.trim(),
      cost_price: Number(costPrice) || 0,
      selling_price: Number(sellingPrice) || 0,
      current_stock: Number(currentStock) || 0,
      low_stock_alert: lowStockAlert ? Number(lowStockAlert) : null,
      is_active: isActive,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 font-intert shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-auto">
        <h2 className="text-lg font-instrument text-primary mb-1">
          Edit Product
        </h2>
        <p className="text-xs text-muted mb-4">
          Update pricing, stock count, or active visibility in store catalog.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-muted block mb-1 font-medium">
              Product Name *
            </label>
            <input
              required
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
                value={lowStockAlert}
                onChange={(e) => setLowStockAlert(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border bg-bg text-primary placeholder:text-muted focus:outline-none focus:border-brand/50 shadow-xs"
              />
            </div>
          </div>

          <div className="pt-1">
            <Checkbox
              id="isActive"
              checked={isActive}
              onChange={setIsActive}
              label="Active in Store Catalog"
            />
          </div>

          <div className="flex items-center gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
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
              {isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
