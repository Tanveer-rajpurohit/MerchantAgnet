"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Search, ChevronDown, UserCheck } from "lucide-react";
import { Select } from "../../ui/Select";
import { useCustomerConnections } from "../../../../hooks/useCustomerConnections";
import { useProducts } from "../../../../hooks/useProducts";
import type {
  OrderResponse,
  OrderStatus,
  OrderCreatePayload,
  OrderItemCreate,
  ProductResponse,
  CustomerConnectionResponse,
} from "../../../../types";

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: OrderCreatePayload) => Promise<void> | void;
  initialOrder?: OrderResponse | null;
  isPending?: boolean;
}

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "unpaid", label: "Unpaid" },
  { value: "partially_paid", label: "Partially Paid" },
  { value: "paid", label: "Paid" },
  { value: "cancelled", label: "Cancelled" },
];

export function OrderModal({
  isOpen,
  onClose,
  onSave,
  initialOrder,
  isPending = false,
}: OrderModalProps) {
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerConnectionResponse | null>(null);
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const itemsContainerRef = useRef<HTMLDivElement>(null);

  const [orderStatus, setOrderStatus] = useState<OrderStatus>("unpaid");
  const [items, setItems] = useState<OrderItemCreate[]>([
    { product_name_snapshot: "", quantity: 1, unit_price_snapshot: 0 },
  ]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<number | null>(null);

  const { customers = [] } = useCustomerConnections({
    search: customerSearch,
  });

  const { data: products = [] } = useProducts();

  useEffect(() => {
    if (initialOrder) {
      setCustomerSearch(initialOrder.customer_name);
      setOrderStatus(initialOrder.status);
      setItems(
        initialOrder.items.map((it) => ({
          product_id: it.product_id,
          product_name_snapshot: it.product_name_snapshot,
          quantity: it.quantity,
          unit_price_snapshot: Number(it.unit_price_snapshot) || 0,
        })),
      );
    } else {
      setSelectedCustomer(null);
      setCustomerSearch("");
      setOrderStatus("unpaid");
      setItems([
        { product_name_snapshot: "", quantity: 1, unit_price_snapshot: 0 },
      ]);
    }
  }, [initialOrder, isOpen]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsCustomerDropdownOpen(false);
      }
      if (
        itemsContainerRef.current &&
        !itemsContainerRef.current.contains(e.target as Node)
      ) {
        setActiveSuggestionIndex(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      { product_name_snapshot: "", quantity: 1, unit_price_snapshot: 0 },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) =>
      prev.length > 1 ? prev.filter((_, i) => i !== index) : prev,
    );
  };

  const handleItemChange = (
    index: number,
    field: keyof OrderItemCreate,
    value: string | number,
  ) => {
    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, [field]: value } : it)),
    );
  };

  const handleSelectProduct = (
    index: number,
    product: ProductResponse,
  ) => {
    setItems((prev) =>
      prev.map((it, i) =>
        i === index
          ? {
              ...it,
              product_id: product.id,
              product_name_snapshot: product.product_name,
              unit_price_snapshot: Number(product.selling_price) || 0,
            }
          : it,
      ),
    );
    setActiveSuggestionIndex(null);
  };

  const totalAmount = items.reduce(
    (acc, it) =>
      acc + (Number(it.quantity) || 0) * (Number(it.unit_price_snapshot) || 0),
    0,
  );

  const submitLabel = isPending ? "Saving..." : initialOrder ? "Save Changes" : "Create Order";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const customerId = selectedCustomer?.customer_id || initialOrder?.customer_id;
    if (!customerId) return;

    const validItems = items.filter(
      (it) => it.product_name_snapshot.trim() !== "",
    );
    if (validItems.length === 0) return;

    await onSave({
      customer_id: customerId,
      customer_connection_id: selectedCustomer?.id || initialOrder?.customer_connection_id || undefined,
      items: validItems.map((it) => ({
        product_id: it.product_id || null,
        product_name_snapshot: it.product_name_snapshot.trim(),
        quantity: Number(it.quantity) || 1,
        unit_price_snapshot: Number(it.unit_price_snapshot) || 0,
      })),
      status: orderStatus,
      created_by: "merchant",
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto font-intert">
      <div className="w-full max-w-2xl rounded-2xl border border-border bg-surface p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-auto">
        <h2 className="text-lg font-instrument text-primary font-normal mb-1">
          {initialOrder ? "Edit Order" : "Create New Order"}
        </h2>
        <p className="text-xs text-muted mb-5">
          Select a customer and pick items from your catalog or enter custom products.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div ref={dropdownRef} className="relative z-30">
            <label className="text-xs text-muted block mb-1 font-normal">
              Customer *
            </label>
            <div className="relative">
              <input
                required
                value={customerSearch}
                onChange={(e) => {
                  setCustomerSearch(e.target.value);
                  setIsCustomerDropdownOpen(true);
                  if (selectedCustomer && selectedCustomer.customer_name !== e.target.value) {
                    setSelectedCustomer(null);
                  }
                }}
                onFocus={() => setIsCustomerDropdownOpen(true)}
                placeholder="Search by customer name, phone, or email..."
                className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-xl border border-border bg-bg text-primary placeholder:text-muted focus:outline-none focus:border-brand/50 shadow-xs"
              />
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <button
                type="button"
                onClick={() => setIsCustomerDropdownOpen(!isCustomerDropdownOpen)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-primary cursor-pointer"
              >
                <ChevronDown size={14} />
              </button>
            </div>

            {isCustomerDropdownOpen && (
              <div className="absolute z-50 w-full mt-1.5 py-1 bg-surface border border-border rounded-xl shadow-2xl max-h-44 overflow-y-auto">
                {customers.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setSelectedCustomer(c);
                      setCustomerSearch(c.customer_name);
                      setIsCustomerDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 hover:bg-surface-muted transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                      selectedCustomer?.id === c.id ? "bg-brand/5 text-brand" : "text-primary"
                    }`}
                  >
                    <div>
                      <p className="text-xs font-normal">{c.customer_name}</p>
                      <p className="text-[10px] text-muted">
                        {c.customer_phone || c.customer_email || "No contact info"}
                      </p>
                    </div>
                    {selectedCustomer?.id === c.id && (
                      <UserCheck size={14} className="text-brand shrink-0" />
                    )}
                  </button>
                ))}
                {customers.length === 0 && (
                  <div className="px-3.5 py-3 text-xs text-muted text-center">
                    No customers found matching search.
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-muted font-normal">Order Items *</label>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1 text-xs text-brand hover:opacity-80 font-normal cursor-pointer"
              >
                <Plus size={13} />
                <span>Add Item</span>
              </button>
            </div>

            <div className="grid grid-cols-12 gap-2 px-1 text-[11px] font-normal text-muted mb-1.5">
              <div className="col-span-6">Item / Product</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-2 text-right">Price (₹)</div>
              <div className="col-span-2 text-right">Subtotal</div>
            </div>

            <div ref={itemsContainerRef} className="space-y-2.5">
              {items.map((it, idx) => {
                const itemSubtotal = (Number(it.quantity) || 0) * (Number(it.unit_price_snapshot) || 0);
                const queryStr = it.product_name_snapshot.trim().toLowerCase();
                const filteredProducts = queryStr.length > 0
                  ? (products || []).filter(
                      (p) =>
                        p.product_name.toLowerCase().includes(queryStr) ||
                        (p.category && p.category.toLowerCase().includes(queryStr)),
                    )
                  : products || [];

                const isThisActive = activeSuggestionIndex === idx;

                return (
                  <div
                    key={idx}
                    className={`grid grid-cols-12 gap-2 items-center relative ${
                      isThisActive ? "z-40" : "z-10"
                    }`}
                  >
                    <div className="col-span-6 relative">
                      <div className="relative">
                        <input
                          required
                          value={it.product_name_snapshot}
                          onChange={(e) => {
                            handleItemChange(idx, "product_name_snapshot", e.target.value);
                            setActiveSuggestionIndex(idx);
                          }}
                          onFocus={() => setActiveSuggestionIndex(idx)}
                          placeholder="Search catalog or type custom item..."
                          className="w-full pl-3 pr-7 py-2 text-xs rounded-xl border border-border bg-bg text-primary placeholder:text-muted focus:outline-none focus:border-brand/50 shadow-xs font-normal"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setActiveSuggestionIndex(
                              isThisActive ? null : idx,
                            )
                          }
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-primary cursor-pointer"
                          title="Browse catalog"
                        >
                          <ChevronDown size={13} />
                        </button>
                      </div>

                      {isThisActive && (
                        <div className="absolute z-50 left-0 top-full mt-1.5 w-full sm:w-80 bg-surface border border-border rounded-xl shadow-2xl max-h-44 overflow-y-auto py-1 animate-in fade-in zoom-in-95 duration-100">
                          {filteredProducts.length > 0 && (
                            <div className="px-3 py-1 text-[10px] font-normal text-muted uppercase tracking-wider">
                              Catalog Products
                            </div>
                          )}

                          {filteredProducts.map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => handleSelectProduct(idx, p)}
                              className="w-full text-left px-3 py-2 hover:bg-surface-muted text-xs flex items-center justify-between gap-2 border-b border-border/40 last:border-b-0 cursor-pointer"
                            >
                              <div className="min-w-0">
                                <p className="font-normal text-primary truncate">
                                  {p.product_name}
                                </p>
                                {p.category && (
                                  <p className="text-[10px] text-muted truncate">
                                    {p.category}
                                  </p>
                                )}
                              </div>
                              <span className="text-brand font-mono font-normal shrink-0">
                                ₹{Number(p.selling_price).toLocaleString("en-IN")}
                              </span>
                            </button>
                          ))}

                          {queryStr.length > 0 && (
                            <div className="p-1.5 border-t border-border/50 bg-bg/50">
                              <button
                                type="button"
                                onClick={() => setActiveSuggestionIndex(null)}
                                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-surface-muted text-xs text-secondary hover:text-primary transition-colors flex items-center justify-between cursor-pointer"
                              >
                                <span className="truncate font-normal">Use custom: "{it.product_name_snapshot}"</span>
                                <span className="text-[10px] text-muted font-normal shrink-0">Custom</span>
                              </button>
                            </div>
                          )}

                          {filteredProducts.length === 0 && queryStr.length === 0 && (
                            <div className="px-3 py-3 text-xs text-muted text-center font-normal">
                              No products in catalog yet. Type a custom name & price.
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="col-span-2">
                      <input
                        required
                        type="number"
                        min="1"
                        value={it.quantity}
                        onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                        placeholder="1"
                        className="w-full px-2.5 py-2 text-xs rounded-xl border border-border bg-bg text-primary focus:outline-none focus:border-brand/50 text-center shadow-xs font-normal"
                      />
                    </div>

                    <div className="col-span-2">
                      <input
                        required
                        type="number"
                        step="any"
                        min="0"
                        value={it.unit_price_snapshot}
                        onChange={(e) => handleItemChange(idx, "unit_price_snapshot", e.target.value)}
                        placeholder="0"
                        className="w-full px-2.5 py-2 text-xs rounded-xl border border-border bg-bg text-primary focus:outline-none focus:border-brand/50 text-right shadow-xs font-mono font-normal"
                      />
                    </div>

                    <div className="col-span-2 flex items-center justify-end gap-1.5">
                      <span className="font-mono text-xs text-secondary font-normal">
                        ₹{itemSubtotal.toLocaleString("en-IN")}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        disabled={items.length <= 1}
                        className="p-1.5 text-muted hover:text-danger disabled:opacity-20 transition-colors cursor-pointer shrink-0"
                        title="Remove item"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl border border-border bg-surface-muted/30">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-secondary shrink-0">
                Order Status:
              </span>
              <Select
                size="sm"
                className="w-36"
                value={orderStatus}
                onChange={(val) => setOrderStatus(val as OrderStatus)}
                options={STATUS_OPTIONS}
              />
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-3">
              <span className="text-xs text-muted">Total Amount</span>
              <span className="text-base sm:text-lg font-instrument text-primary font-medium">
                ₹{totalAmount.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 justify-end pt-2 relative z-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 rounded-xl text-sm text-secondary hover:bg-surface-muted transition-colors cursor-pointer font-normal"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || (!selectedCustomer && !initialOrder) || totalAmount <= 0}
              className="px-4 py-2 rounded-xl btn-brand-solid text-sm font-medium shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
