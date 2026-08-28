"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, X, Search, ChevronDown, UserCheck } from "lucide-react";
import type { Order, OrderItem } from "../../../types/order";
import { CATALOG_SUGGESTIONS } from "./data";

interface CustomerOption {
  id: string;
  name: string;
  phone?: string;
}

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (orderData: Omit<Order, "id" | "date"> & { id?: string }) => void;
  initialOrder?: Order | null;
  customers: CustomerOption[];
}

function OrderModalContent({
  onClose,
  onSave,
  initialOrder,
  customers,
}: Omit<OrderModalProps, "isOpen">) {
  const initialMatch = initialOrder
    ? customers.find((c) => c.id === initialOrder.customerId) || {
        id: initialOrder.customerId,
        name: initialOrder.customerName,
        phone: initialOrder.customerPhone,
      }
    : null;

  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerOption | null>(initialMatch);
  const [customerSearch, setCustomerSearch] = useState(
    initialMatch ? initialMatch.name : "",
  );
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [items, setItems] = useState<OrderItem[]>(
    initialOrder && initialOrder.items.length > 0
      ? initialOrder.items.map((it) => ({ ...it }))
      : [{ name: "", quantity: 1, unitPrice: 0 }],
  );
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<
    number | null
  >(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsCustomerDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      (c.phone && c.phone.includes(customerSearch)),
  );

  const handleAddItem = () => {
    setItems((prev) => [...prev, { name: "", quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) =>
      prev.length > 1 ? prev.filter((_, i) => i !== index) : prev,
    );
  };

  const handleItemChange = (
    index: number,
    field: keyof OrderItem,
    value: string | number,
  ) => {
    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, [field]: value } : it)),
    );
  };

  const handleSelectSuggestion = (
    index: number,
    product: (typeof CATALOG_SUGGESTIONS)[number],
  ) => {
    setItems((prev) =>
      prev.map((it, i) =>
        i === index
          ? {
              ...it,
              name: product.name,
              unitPrice: product.price,
            }
          : it,
      ),
    );
    setActiveSuggestionIndex(null);
  };

  const total = items.reduce(
    (acc, it) => acc + (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0),
    0,
  );

  const handleSave = () => {
    if (!selectedCustomer) return;
    const validItems = items.filter((i) => i.name.trim() !== "");
    if (validItems.length === 0) return;

    onSave({
      id: initialOrder?.id,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      customerPhone: selectedCustomer.phone || "",
      items: validItems,
      totalAmount: total,
      paidAmount: initialOrder ? initialOrder.paidAmount : 0,
      status: initialOrder ? initialOrder.status : "Unpaid",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-0 sm:px-4 backdrop-blur-xs font-intert">
      <div className="w-full sm:max-w-xl rounded-t-2xl sm:rounded-2xl border border-border bg-surface p-5 sm:p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between pb-3.5 border-b border-border mb-4">
          <div>
            <h2 className="text-base font-semibold text-primary">
              {initialOrder ? "Edit Order Items" : "Create New Customer Order"}
            </h2>
            <p className="text-xs text-muted">
              {initialOrder
                ? `Modifying order #${initialOrder.id} records`
                : "Record goods bought by customer and calculate bill"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-primary hover:bg-surface-muted transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mb-4" ref={dropdownRef}>
          <label className="text-xs font-medium text-primary block mb-1.5">
            Select Customer
          </label>
          <div className="relative">
            <div className="relative flex items-center">
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                value={customerSearch}
                onChange={(e) => {
                  setCustomerSearch(e.target.value);
                  setIsCustomerDropdownOpen(true);
                  if (
                    selectedCustomer &&
                    selectedCustomer.name !== e.target.value
                  ) {
                    setSelectedCustomer(null);
                  }
                }}
                onFocus={() => setIsCustomerDropdownOpen(true)}
                placeholder="Search by customer name or phone..."
                className="w-full pl-8 pr-8 py-2 text-xs rounded-xl border border-border bg-bg text-primary focus:outline-none focus:border-brand/50"
              />
              <button
                type="button"
                onClick={() =>
                  setIsCustomerDropdownOpen(!isCustomerDropdownOpen)
                }
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-primary cursor-pointer"
              >
                <ChevronDown size={13} />
              </button>
            </div>

            {selectedCustomer && (
              <div className="mt-1.5 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand/10 border border-brand/20 text-brand text-xs">
                <UserCheck size={12} />
                <span className="font-medium">{selectedCustomer.name}</span>
                {selectedCustomer.phone && (
                  <span className="text-[11px] text-muted ml-1">
                    ({selectedCustomer.phone})
                  </span>
                )}
              </div>
            )}

            {isCustomerDropdownOpen && (
              <div className="absolute left-0 right-0 z-50 mt-1 max-h-48 overflow-y-auto bg-surface border border-border rounded-xl shadow-lg py-1">
                {filteredCustomers.length === 0 ? (
                  <div className="p-3 text-center text-xs text-muted">
                    No customers found matching &quot;{customerSearch}&quot;
                  </div>
                ) : (
                  filteredCustomers.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setSelectedCustomer(c);
                        setCustomerSearch(c.name);
                        setIsCustomerDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-xs transition-colors flex items-center justify-between cursor-pointer ${
                        selectedCustomer?.id === c.id
                          ? "bg-brand/10 text-brand font-medium"
                          : "text-secondary hover:text-primary hover:bg-surface-muted"
                      }`}
                    >
                      <span>{c.name}</span>
                      {c.phone && (
                        <span className="text-[11px] text-muted">
                          {c.phone}
                        </span>
                      )}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-primary">
              Purchased Items
            </label>
            <button
              type="button"
              onClick={handleAddItem}
              className="inline-flex items-center gap-1 text-xs link-brand cursor-pointer"
            >
              <Plus size={13} />
              <span>Add Item</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {items.map((item, idx) => {
              const rowSuggestions =
                item.name.length >= 2
                  ? CATALOG_SUGGESTIONS.filter((s) =>
                      s.name.toLowerCase().includes(item.name.toLowerCase()),
                    )
                  : [];

              return (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl border border-border bg-bg space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        value={item.name}
                        onChange={(e) => {
                          handleItemChange(idx, "name", e.target.value);
                          if (e.target.value.length >= 2) {
                            setActiveSuggestionIndex(idx);
                          } else {
                            setActiveSuggestionIndex(null);
                          }
                        }}
                        onFocus={() => {
                          if (item.name.length >= 2) {
                            setActiveSuggestionIndex(idx);
                          }
                        }}
                        placeholder="Item name (e.g. Amul Milk, Atta...)"
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-surface text-primary focus:outline-none focus:border-brand/50"
                      />

                      {activeSuggestionIndex === idx &&
                        rowSuggestions.length > 0 && (
                          <div className="absolute left-0 right-0 z-40 mt-1 max-h-36 overflow-y-auto bg-surface border border-border rounded-xl shadow-lg py-1">
                            {rowSuggestions.map((sug) => (
                              <button
                                key={sug.name}
                                type="button"
                                onClick={() => handleSelectSuggestion(idx, sug)}
                                className="w-full px-3 py-1.5 text-left text-xs text-secondary hover:text-primary hover:bg-surface-muted flex items-center justify-between cursor-pointer"
                              >
                                <span>{sug.name}</span>
                                <span className="text-[11px] text-muted">
                                  ₹{sug.price}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                    </div>

                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="p-1.5 text-muted hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                        title="Remove Item"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-muted block mb-0.5">
                        Qty
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(
                            idx,
                            "quantity",
                            Math.max(1, parseInt(e.target.value, 10) || 1),
                          )
                        }
                        className="w-full px-2.5 py-1 text-xs rounded-lg border border-border bg-surface text-primary focus:outline-none focus:border-brand/50"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-muted block mb-0.5">
                        Price (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={item.unitPrice || ""}
                        onChange={(e) =>
                          handleItemChange(
                            idx,
                            "unitPrice",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        placeholder="0"
                        className="w-full px-2.5 py-1 text-xs rounded-lg border border-border bg-surface text-primary focus:outline-none focus:border-brand/50"
                      />
                    </div>

                    <div className="text-right flex flex-col justify-end pb-1 pr-1">
                      <span className="text-[10px] text-muted block">
                        Line Total
                      </span>
                      <span className="text-xs font-medium text-primary">
                        ₹
                        {(item.quantity * item.unitPrice).toLocaleString(
                          "en-IN",
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-surface-muted mb-5 border border-border">
          <div>
            <span className="text-xs text-muted font-intert block">
              Total Bill
            </span>
            <span className="text-[11px] text-muted">
              {items.filter((i) => i.name.trim()).length} unique items
            </span>
          </div>
          <span className="text-xl font-instrument text-primary">
            ₹{total.toLocaleString("en-IN")}
          </span>
        </div>

        <div className="flex items-center gap-2 justify-end pt-2 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-secondary hover:bg-surface-muted transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!selectedCustomer || total === 0}
            className="px-5 py-2 rounded-xl btn-brand-solid text-xs font-medium transition-opacity disabled:opacity-40 disabled:cursor-default cursor-pointer"
          >
            {initialOrder ? "Save Changes" : "Create Order"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function OrderModal({
  isOpen,
  onClose,
  onSave,
  initialOrder,
  customers,
}: OrderModalProps) {
  if (!isOpen) return null;

  return (
    <OrderModalContent
      key={initialOrder?.id ?? "new"}
      onClose={onClose}
      onSave={onSave}
      initialOrder={initialOrder}
      customers={customers}
    />
  );
}
