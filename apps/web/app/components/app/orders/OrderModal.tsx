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

export function OrderModal({
  isOpen,
  onClose,
  onSave,
  initialOrder,
  customers,
}: OrderModalProps) {
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerOption | null>(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [items, setItems] = useState<OrderItem[]>([
    { name: "", quantity: 1, unitPrice: 0 },
  ]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<
    number | null
  >(null);

  useEffect(() => {
    if (!isOpen) return;

    if (initialOrder) {
      const match = customers.find((c) => c.id === initialOrder.customerId) || {
        id: initialOrder.customerId,
        name: initialOrder.customerName,
        phone: initialOrder.customerPhone,
      };
      setSelectedCustomer(match);
      setCustomerSearch(match.name);
      setItems(
        initialOrder.items.length > 0
          ? initialOrder.items.map((it) => ({ ...it }))
          : [{ name: "", quantity: 1, unitPrice: 0 }],
      );
    } else {
      setSelectedCustomer(null);
      setCustomerSearch("");
      setItems([{ name: "", quantity: 1, unitPrice: 0 }]);
    }
    setIsCustomerDropdownOpen(false);
  }, [isOpen, initialOrder, customers]);

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

  if (!isOpen) return null;

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      (c.phone && c.phone.includes(customerSearch)),
  );

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

  const selectProductSuggestion = (
    index: number,
    suggestion: { name: string; price: number },
  ) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? { ...item, name: suggestion.name, unitPrice: suggestion.price }
          : item,
      ),
    );
    setActiveSuggestionIndex(null);
  };

  const total = items.reduce(
    (sum, item) =>
      sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
    0,
  );

  const handleSave = () => {
    if (!selectedCustomer || items.every((i) => !i.name.trim())) return;

    const validItems = items.filter((i) => i.name.trim().length > 0);
    const totalAmount = validItems.reduce(
      (sum, item) =>
        sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
      0,
    );

    onSave({
      id: initialOrder?.id,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      customerPhone: selectedCustomer.phone,
      items: validItems,
      totalAmount,
      paidAmount: initialOrder ? initialOrder.paidAmount : 0,
      status: initialOrder ? initialOrder.status : "Unpaid",
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-0 sm:px-4 backdrop-blur-xs font-intert">
      <div className="w-full sm:max-w-xl rounded-t-2xl sm:rounded-2xl border border-border bg-surface p-5 sm:p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
          <div>
            <h2 className="text-lg font-instrument text-primary">
              {initialOrder ? "Edit Order" : "New Order"}
            </h2>
            <p className="text-xs text-muted mt-0.5">
              {initialOrder
                ? `Update order items and prices for ${initialOrder.customerName}`
                : "Select a customer and add items they purchased"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-primary hover:bg-surface-muted transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mb-4 relative" ref={dropdownRef}>
          <label className="text-xs font-medium text-primary block mb-1.5">
            Customer
          </label>

          <div
            onClick={() => setIsCustomerDropdownOpen(true)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-border bg-bg text-sm cursor-pointer hover:border-brand/50 transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Search size={14} className="text-muted shrink-0" />
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
                placeholder="Search customer by name or phone..."
                className="w-full bg-transparent text-primary placeholder:text-muted focus:outline-none text-sm"
              />
            </div>
            <ChevronDown size={14} className="text-muted shrink-0 ml-2" />
          </div>

          {isCustomerDropdownOpen && (
            <div className="absolute left-0 right-0 top-full mt-1.5 z-30 bg-surface border border-border rounded-xl shadow-xl max-h-52 overflow-y-auto p-1.5">
              {filteredCustomers.length === 0 ? (
                <div className="py-3 px-3 text-center text-xs text-muted">
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
                    className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-colors cursor-pointer ${
                      selectedCustomer?.id === c.id
                        ? "bg-brand/10 text-brand"
                        : "hover:bg-surface-muted text-primary"
                    }`}
                  >
                    <div>
                      <p className="text-xs font-medium">{c.name}</p>
                      {c.phone && (
                        <p className="text-[11px] text-muted">{c.phone}</p>
                      )}
                    </div>
                    {selectedCustomer?.id === c.id && (
                      <UserCheck size={14} className="text-brand shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-primary">
              Order Items & Pricing
            </label>
            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center gap-1 text-xs font-medium link-brand cursor-pointer"
            >
              <Plus size={13} />
              Add item
            </button>
          </div>

          <div className="space-y-2.5">
            {items.map((item, idx) => {
              const lineTotal =
                (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
              const matchingSuggestions =
                item.name.length >= 2
                  ? CATALOG_SUGGESTIONS.filter((s) =>
                      s.name.toLowerCase().includes(item.name.toLowerCase()),
                    )
                  : [];

              return (
                <div
                  key={idx}
                  className="relative p-2.5 rounded-xl border border-border bg-bg"
                >
                  <div className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-12 sm:col-span-5 relative">
                      <label className="text-[10px] text-muted uppercase tracking-wider block mb-0.5 sm:hidden">
                        Item Name
                      </label>
                      <input
                        value={item.name}
                        onFocus={() => setActiveSuggestionIndex(idx)}
                        onChange={(e) => {
                          updateItem(idx, "name", e.target.value);
                          setActiveSuggestionIndex(idx);
                        }}
                        placeholder="Item name (e.g. Milk 1L)"
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-border bg-surface text-primary placeholder:text-muted focus:outline-none focus:border-brand/50"
                      />

                      {activeSuggestionIndex === idx &&
                        matchingSuggestions.length > 0 && (
                          <div className="absolute left-0 right-0 top-full mt-1 z-20 bg-surface border border-border rounded-lg shadow-lg p-1 max-h-36 overflow-y-auto">
                            {matchingSuggestions.map((sug) => (
                              <button
                                key={sug.name}
                                type="button"
                                onClick={() =>
                                  selectProductSuggestion(idx, sug)
                                }
                                className="w-full flex items-center justify-between p-1.5 text-left text-xs hover:bg-surface-muted rounded-md text-primary"
                              >
                                <span>{sug.name}</span>
                                <span className="text-muted font-intert">
                                  ₹{sug.price}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                    </div>

                    <div className="col-span-4 sm:col-span-2">
                      <label className="text-[10px] text-muted uppercase tracking-wider block mb-0.5 sm:hidden">
                        Qty
                      </label>
                      <input
                        type="number"
                        value={item.quantity || ""}
                        onChange={(e) =>
                          updateItem(
                            idx,
                            "quantity",
                            Math.max(1, Number(e.target.value) || 0),
                          )
                        }
                        placeholder="Qty"
                        min={1}
                        className="w-full px-2 py-1.5 text-xs text-center rounded-lg border border-border bg-surface text-primary focus:outline-none focus:border-brand/50"
                      />
                    </div>

                    <div className="col-span-4 sm:col-span-2">
                      <label className="text-[10px] text-muted uppercase tracking-wider block mb-0.5 sm:hidden">
                        Unit ₹
                      </label>
                      <input
                        type="number"
                        value={item.unitPrice || ""}
                        onChange={(e) =>
                          updateItem(
                            idx,
                            "unitPrice",
                            Math.max(0, Number(e.target.value) || 0),
                          )
                        }
                        placeholder="Unit ₹"
                        min={0}
                        className="w-full px-2 py-1.5 text-xs rounded-lg border border-border bg-surface text-primary focus:outline-none focus:border-brand/50"
                      />
                    </div>

                    <div className="col-span-3 sm:col-span-2 text-right">
                      <label className="text-[10px] text-muted uppercase tracking-wider block mb-0.5 sm:hidden">
                        Total
                      </label>
                      <span className="text-xs text-secondary block py-1.5 font-intert">
                        ₹{lineTotal}
                      </span>
                    </div>

                    <div className="col-span-1 sm:col-span-1 flex justify-end">
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          className="text-muted hover:text-danger p-1 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
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
