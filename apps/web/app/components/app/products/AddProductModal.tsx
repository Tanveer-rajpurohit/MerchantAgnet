import { useState } from "react";
import type { ProductRow } from "../../../types/onboarding";

export type ProductFormData = Omit<ProductRow, "id">;

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (formData: ProductFormData) => void;
}

const EMPTY_FORM: ProductFormData = {
  name: "",
  costPrice: "",
  sellingPrice: "",
  currentStock: "",
  lowStockAlert: "",
};

export function AddProductModal({
  isOpen,
  onClose,
  onAdd,
}: AddProductModalProps) {
  const [form, setForm] = useState<ProductFormData>(EMPTY_FORM);

  if (!isOpen) return null;

  const handleFormChange = (field: keyof ProductFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleClose = () => {
    setForm(EMPTY_FORM);
    onClose();
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    onAdd(form);
    setForm(EMPTY_FORM);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-0 sm:px-4">
      <div className="w-full sm:max-w-sm rounded-t-2xl sm:rounded-xl border border-border bg-surface p-6 font-intert">
        <h2 className="text-lg font-instrument text-primary mb-1">
          Add Product
        </h2>
        <p className="text-xs text-muted mb-4">
          Add it once here - the agent uses this for stock checks and payment
          links.
        </p>
        <input
          placeholder="Product name"
          value={form.name}
          onChange={(e) => handleFormChange("name", e.target.value)}
          className="w-full mb-3 px-3 py-2.5 text-sm rounded-lg border border-border bg-bg text-primary placeholder:text-muted focus:outline-none focus:border-brand/50"
        />
        <div className="grid grid-cols-2 gap-3 mb-3">
          <input
            inputMode="numeric"
            placeholder="Cost price (₹)"
            value={form.costPrice}
            onChange={(e) => handleFormChange("costPrice", e.target.value)}
            className="px-3 py-2.5 text-sm rounded-lg border border-border bg-bg text-primary placeholder:text-muted focus:outline-none focus:border-brand/50"
          />
          <input
            inputMode="numeric"
            placeholder="Selling price (₹)"
            value={form.sellingPrice}
            onChange={(e) => handleFormChange("sellingPrice", e.target.value)}
            className="px-3 py-2.5 text-sm rounded-lg border border-border bg-bg text-primary placeholder:text-muted focus:outline-none focus:border-brand/50"
          />
        </div>
        <div className="grid grid-cols-2 gap-3 mb-5">
          <input
            inputMode="numeric"
            placeholder="Current stock"
            value={form.currentStock}
            onChange={(e) => handleFormChange("currentStock", e.target.value)}
            className="px-3 py-2.5 text-sm rounded-lg border border-border bg-bg text-primary placeholder:text-muted focus:outline-none focus:border-brand/50"
          />
          <input
            inputMode="numeric"
            placeholder="Low stock alert"
            value={form.lowStockAlert}
            onChange={(e) => handleFormChange("lowStockAlert", e.target.value)}
            className="px-3 py-2.5 text-sm rounded-lg border border-border bg-bg text-primary placeholder:text-muted focus:outline-none focus:border-brand/50"
          />
        </div>
        <div className="flex items-center gap-2 justify-end">
          <button
            type="button"
            onClick={handleClose}
            className="px-3.5 py-2 rounded-lg text-sm text-secondary hover:bg-surface-muted transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-3.5 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Add Product
          </button>
        </div>
      </div>
    </div>
  );
}
