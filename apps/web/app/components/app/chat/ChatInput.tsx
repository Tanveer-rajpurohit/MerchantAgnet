"use client";

import { useRef, useEffect, useState } from "react";
import {
  ArrowUp,
  Paperclip,
  Sparkles,
  Link2,
  Package,
  Megaphone,
  X,
  Users,
  ChevronDown,
  Check,
} from "lucide-react";
import { useCustomerConnections } from "../../../../hooks";
import type { CustomerConnectionResponse } from "../../../../types";

export type ActionMode = "default" | "payment-link" | "catalog" | "campaign";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (
    text: string,
    mode: ActionMode,
    attachedCustomers?: CustomerConnectionResponse[] | null,
  ) => void;
  placeholder?: string;
  autoFocus?: boolean;
  disabled?: boolean;
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Ask anything about payment links, stock, or campaigns...",
  autoFocus = false,
  disabled = false,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const customerDropdownRef = useRef<HTMLDivElement>(null);
  const [activeMode, setActiveMode] = useState<ActionMode>("default");
  const [deepReasoning, setDeepReasoning] = useState(false);
  const [selectedCustomers, setSelectedCustomers] = useState<CustomerConnectionResponse[]>([]);
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);

  const { customers, isLoading: isCustomersLoading } = useCustomerConnections();
  const connectedCustomers = customers.filter(
    (c) => c.status === "connected"
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        customerDropdownRef.current &&
        !customerDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCustomerDropdownOpen(false);
      }
    }
    if (isCustomerDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCustomerDropdownOpen]);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const handleInput = (val: string) => {
    onChange(val);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const nextHeight = Math.min(textareaRef.current.scrollHeight, 160);
      textareaRef.current.style.height = `${Math.max(nextHeight, 24)}px`;
    }
  };

  const handleSend = () => {
    if (!value.trim() || disabled) return;
    const textToSend = value.trim();
    onSubmit(
      textToSend,
      activeMode,
      selectedCustomers.length > 0 ? selectedCustomers : null
    );
    onChange("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const modeBadge = () => {
    if (activeMode === "payment-link") {
      return {
        label: "Payment Link Mode",
        icon: Link2,
        color: "bg-brand/15 text-brand border-brand/30",
      };
    }
    if (activeMode === "catalog") {
      return {
        label: "Stock & Catalog Mode",
        icon: Package,
        color: "bg-brand/15 text-brand border-brand/30",
      };
    }
    if (activeMode === "campaign") {
      return {
        label: "Campaign Offer Mode",
        icon: Megaphone,
        color: "bg-brand/15 text-brand border-brand/30",
      };
    }
    return null;
  };

  const badge = modeBadge();

  return (
    <div className="w-full">
      <div className="rounded-2xl border border-border bg-surface shadow-xs transition-all focus-within:border-brand/50 focus-within:bg-surface">
        {badge && (
          <div className="flex items-center gap-2 px-4 pt-3">
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border font-intert ${badge.color}`}
            >
              <badge.icon size={12} />
              <span>{badge.label}</span>
              <button
                type="button"
                onClick={() => setActiveMode("default")}
                className="ml-1 hover:opacity-75 cursor-pointer"
              >
                <X size={12} />
              </button>
            </div>
          </div>
        )}

        {selectedCustomers.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 px-4 pt-2.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium bg-brand/10 text-brand border border-brand/20 shadow-2xs">
              <Users size={12} className="shrink-0" />
              {selectedCustomers.length === 1 ? (
                <>
                  <span>To: <strong>{selectedCustomers[0].customer_name}</strong></span>
                  {selectedCustomers[0].customer_phone && (
                    <span className="text-[10px] text-muted">({selectedCustomers[0].customer_phone})</span>
                  )}
                </>
              ) : (
                <>
                  <span>
                    To: <strong>{selectedCustomers[0].customer_name}</strong> + {selectedCustomers.length - 1} other{selectedCustomers.length > 2 ? "s" : ""}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-brand/20 text-brand rounded-full font-semibold">
                    {selectedCustomers.length} selected
                  </span>
                </>
              )}
              <button
                type="button"
                onClick={() => setSelectedCustomers([])}
                className="ml-1 text-muted hover:text-primary transition-colors cursor-pointer"
                title="Clear customer selection"
              >
                <X size={12} />
              </button>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar text-[11px]">
              <button
                type="button"
                onClick={() =>
                  handleInput(
                    selectedCustomers.length > 1
                      ? "Please message all selected customers that their orders are ready for pickup."
                      : "Please message the customer that their order is ready for pickup."
                  )
                }
                className="px-2 py-0.5 rounded-lg border border-border bg-surface-muted hover:bg-border/40 text-secondary hover:text-primary transition-colors cursor-pointer whitespace-nowrap"
              >
                Ready for pickup
              </button>
              <button
                type="button"
                onClick={() =>
                  handleInput(
                    selectedCustomers.length > 1
                      ? "Send a payment link for ₹100 to all attached customers."
                      : "Send a payment link for ₹100 to this customer."
                  )
                }
                className="px-2 py-0.5 rounded-lg border border-border bg-surface-muted hover:bg-border/40 text-secondary hover:text-primary transition-colors cursor-pointer whitespace-nowrap"
              >
                Send Pay Link
              </button>
              <button
                type="button"
                onClick={() =>
                  handleInput(
                    selectedCustomers.length > 1
                      ? "Send an exclusive 10% discount offer note to all attached customers."
                      : "Send an exclusive 10% discount offer note to this customer."
                  )
                }
                className="px-2 py-0.5 rounded-lg border border-border bg-surface-muted hover:bg-border/40 text-secondary hover:text-primary transition-colors cursor-pointer whitespace-nowrap"
              >
                10% Off Note
              </button>
            </div>
          </div>
        )}

        <div className="px-4 pt-3 pb-2">
          <textarea
            ref={textareaRef}
            value={value}
            disabled={disabled}
            onChange={(e) => handleInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            className="w-full resize-none bg-transparent text-[15px] text-primary font-intert outline-none placeholder:text-muted/60 leading-relaxed disabled:opacity-50 max-h-[160px] overflow-y-auto"
            style={{ minHeight: "24px" }}
          />
        </div>

        <div className="flex items-center justify-between px-3 pb-3 pt-1 border-t border-border-subtle/60">
          <div className="flex items-center gap-1">
            <button
              type="button"
              title="Attach product catalog or invoice"
              className="flex items-center justify-center w-8 h-8 rounded-lg text-muted hover:text-secondary hover:bg-surface-muted transition-colors"
            >
              <Paperclip size={15} />
            </button>

            <button
              type="button"
              onClick={() =>
                setActiveMode(
                  activeMode === "payment-link" ? "default" : "payment-link",
                )
              }
              title="Create Payment Link"
              className={`flex items-center gap-1.5 px-2.5 h-8 rounded-lg text-xs font-medium font-intert transition-colors ${
                activeMode === "payment-link"
                  ? "bg-brand/15 text-brand"
                  : "text-muted hover:text-secondary hover:bg-surface-muted"
              }`}
            >
              <Link2 size={13} />
              <span className="hidden sm:inline">Pay Link</span>
            </button>

            <button
              type="button"
              onClick={() =>
                setActiveMode(activeMode === "catalog" ? "default" : "catalog")
              }
              title="Check Inventory & Catalog"
              className={`flex items-center gap-1.5 px-2.5 h-8 rounded-lg text-xs font-medium font-intert transition-colors ${
                activeMode === "catalog"
                  ? "bg-brand/15 text-brand"
                  : "text-muted hover:text-secondary hover:bg-surface-muted"
              }`}
            >
              <Package size={13} />
              <span className="hidden sm:inline">Catalog</span>
            </button>

            <button
              type="button"
              onClick={() =>
                setActiveMode(
                  activeMode === "campaign" ? "default" : "campaign",
                )
              }
              title="Draft Discount Campaign"
              className={`flex items-center gap-1.5 px-2.5 h-8 rounded-lg text-xs font-medium font-intert transition-colors ${
                activeMode === "campaign"
                  ? "bg-brand/15 text-brand"
                  : "text-muted hover:text-secondary hover:bg-surface-muted"
              }`}
            >
              <Megaphone size={13} />
              <span className="hidden sm:inline">Campaign</span>
            </button>

            <div className="relative" ref={customerDropdownRef}>
              <button
                type="button"
                onClick={() => setIsCustomerDropdownOpen((prev) => !prev)}
                title="Select Connected Customer(s) to message"
                className={`flex items-center gap-1.5 px-2.5 h-8 rounded-lg text-xs font-medium font-intert transition-colors cursor-pointer ${
                  selectedCustomers.length > 0 || isCustomerDropdownOpen
                    ? "bg-brand/15 text-brand border border-brand/25"
                    : "text-muted hover:text-secondary hover:bg-surface-muted"
                }`}
              >
                <Users size={13} />
                <span className="max-w-[85px] sm:max-w-[120px] truncate">
                  {selectedCustomers.length === 0
                    ? "Customer"
                    : selectedCustomers.length === 1
                    ? selectedCustomers[0].customer_name
                    : `${selectedCustomers.length} Customers`}
                </span>
                <ChevronDown
                  size={11}
                  className={`transition-transform duration-200 ${
                    isCustomerDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isCustomerDropdownOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-72 max-h-72 overflow-y-auto rounded-2xl border border-border bg-surface shadow-xl z-50 p-2 font-intert animate-in fade-in zoom-in-95 duration-100">
                  <div className="flex items-center justify-between px-2 py-1 text-[11px] font-semibold text-muted border-b border-border/50 mb-1.5">
                    <span>Connected Customers</span>
                    {connectedCustomers.length > 0 && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (selectedCustomers.length === connectedCustomers.length) {
                              setSelectedCustomers([]);
                            } else {
                              setSelectedCustomers([...connectedCustomers]);
                            }
                          }}
                          className="text-[10px] text-brand hover:underline cursor-pointer font-medium"
                        >
                          {selectedCustomers.length === connectedCustomers.length
                            ? "Deselect All"
                            : "Select All"}
                        </button>
                        {selectedCustomers.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setSelectedCustomers([])}
                            className="text-[10px] text-muted hover:text-danger cursor-pointer"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  {isCustomersLoading ? (
                    <div className="px-3 py-4 text-center text-xs text-muted">
                      Loading customers...
                    </div>
                  ) : connectedCustomers.length === 0 ? (
                    <div className="px-3 py-4 text-center text-xs text-muted">
                      No connected customers yet.
                    </div>
                  ) : (
                    <div className="space-y-0.5">
                      {connectedCustomers.map((cust) => {
                        const isSelected = selectedCustomers.some((c) => c.id === cust.id);
                        return (
                          <button
                            key={cust.id}
                            type="button"
                            onClick={() => {
                              setSelectedCustomers((prev) =>
                                isSelected
                                  ? prev.filter((c) => c.id !== cust.id)
                                  : [...prev, cust]
                              );
                            }}
                            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                              isSelected
                                ? "bg-brand/10 text-brand font-medium"
                                : "hover:bg-surface-muted text-primary"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 truncate pr-2">
                              <div
                                className={`w-4 h-4 rounded flex items-center justify-center border transition-colors shrink-0 ${
                                  isSelected
                                    ? "bg-brand border-brand text-white"
                                    : "border-border bg-surface-muted"
                                }`}
                              >
                                {isSelected && <Check size={11} strokeWidth={3} className="text-white" />}
                              </div>
                              <div className="truncate">
                                <p className="font-medium truncate">{cust.customer_name}</p>
                                <p className="text-[10px] text-muted truncate">
                                  {cust.customer_phone || cust.customer_email || "Connected via chat"}
                                </p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                      <div className="pt-2 mt-1 border-t border-border/50 flex items-center justify-between px-2 text-[11px]">
                        <span className="text-muted">
                          {selectedCustomers.length} selected
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsCustomerDropdownOpen(false)}
                          className="px-2.5 py-1 rounded-lg bg-brand text-white text-[11px] font-medium hover:bg-brand/90 transition-colors cursor-pointer"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setDeepReasoning(!deepReasoning)}
              title="Toggle Merchant Agent Deep Reasoning"
              className={`flex items-center gap-1.5 px-2.5 h-8 rounded-lg text-xs font-medium font-intert transition-colors ${
                deepReasoning
                  ? "bg-brand/15 text-brand"
                  : "text-muted hover:text-secondary hover:bg-surface-muted"
              }`}
            >
              <Sparkles size={13} />
              <span className="hidden md:inline">Agent Copilot</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleSend}
            disabled={!value.trim() || disabled}
            aria-label="Send message"
            className="flex items-center justify-center w-8 h-8 rounded-lg btn-brand-solid disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 shadow-xs"
          >
            <ArrowUp size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
