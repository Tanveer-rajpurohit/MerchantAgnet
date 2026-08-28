"use client";

import { useState } from "react";

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddCustomerModal({ isOpen, onClose }: AddCustomerModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  if (!isOpen) return null;

  const handleAdd = () => {
    onClose();
    setName("");
    setPhone("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-0 sm:px-4">
      <div className="w-full sm:max-w-sm rounded-t-2xl sm:rounded-xl border border-border bg-surface p-6">
        <h2 className="text-lg font-instrument text-primary mb-1">
          Add Customer
        </h2>
        <p className="text-xs text-muted mb-4">
          New contacts start as Pending until they purchase or accept your
          request.
        </p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Customer name"
          className="w-full mb-3 px-3 py-2.5 text-sm rounded-lg border border-border bg-bg text-primary placeholder:text-muted focus:outline-none focus:border-brand/50"
        />
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone number"
          className="w-full mb-5 px-3 py-2.5 text-sm rounded-lg border border-border bg-bg text-primary placeholder:text-muted focus:outline-none focus:border-brand/50"
        />
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-3.5 py-2 rounded-lg text-sm text-secondary hover:bg-surface-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            className="px-3.5 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
