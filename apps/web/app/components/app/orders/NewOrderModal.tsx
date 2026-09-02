"use client";

import { useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import type { OrderItem } from "../../../../types";

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: { id: string; name: string }[];
}

export function NewOrderModal({
  isOpen,
  onClose,
  customers,
}: NewOrderModalProps) {
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [items, setItems] = useState<OrderItem[]>([
    { name: "", quantity: 1, unitPrice: 0 },
  ]);

  if (!isOpen) return null;

  const addItem = () => {
    setItems((prev) => [...prev, { name: "", quantity: 1, unitPrice: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItem = (
    index: number,
    field: keyof OrderItem,
    value: string | number,
  ) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const total = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );

  const handleCreate = () => {
    if (!selectedCustomer || items.every((i) => !i.name.trim())) return;
    onClose();
    setSelectedCustomer("");
    setItems([{ name: "", quantity: 1, unitPrice: 0 }]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-0 sm:px-4">
      <div className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-xl border border-border bg-surface p-6 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-instrument text-primary">New Order</h2>
            <p className="text-xs text-muted font-intert mt-0.5">
              Pick a customer and add items they purchased.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted hover:text-primary hover:bg-surface-muted transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mb-4">
          <label className="text-xs text-muted font-intert block mb-1.5">
            Customer
          </label>
          <select
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
            className="w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-bg text-primary focus:outline-none focus:border-brand/50 cursor-pointer"
          >
            <option value="">Select a customer</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-muted font-intert">Items</label>
            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center gap-1 text-xs text-brand hover:underline cursor-pointer"
            >
              <Plus size={12} />
              Add item
            </button>
          </div>

          <div className="space-y-2">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <input
                  value={item.name}
                  onChange={(e) => updateItem(idx, "name", e.target.value)}
                  placeholder="Item name"
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-border bg-bg text-primary placeholder:text-muted focus:outline-none focus:border-brand/50"
                />
                <input
                  type="number"
                  value={item.quantity || ""}
                  onChange={(e) =>
                    updateItem(idx, "quantity", Number(e.target.value) || 0)
                  }
                  placeholder="Qty"
                  min={1}
                  className="w-16 px-2 py-2 text-sm rounded-lg border border-border bg-bg text-primary text-center focus:outline-none focus:border-brand/50"
                />
                <input
                  type="number"
                  value={item.unitPrice || ""}
                  onChange={(e) =>
                    updateItem(idx, "unitPrice", Number(e.target.value) || 0)
                  }
                  placeholder="₹ Price"
                  min={0}
                  className="w-24 px-2 py-2 text-sm rounded-lg border border-border bg-bg text-primary focus:outline-none focus:border-brand/50"
                />
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    className="mt-2 text-muted hover:text-danger transition-colors shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between py-3 px-3 rounded-xl bg-surface-muted mb-5">
          <span className="text-xs text-muted font-intert">Total</span>
          <span className="text-lg font-instrument text-primary">
            ₹{total.toLocaleString("en-IN")}
          </span>
        </div>

        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-3.5 py-2 rounded-lg text-sm text-secondary hover:bg-surface-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!selectedCustomer || total === 0}
            className="px-3.5 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-default"
          >
            Create Order
          </button>
        </div>
      </div>
    </div>
  );
}
