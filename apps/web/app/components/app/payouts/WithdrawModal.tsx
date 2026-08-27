import { useState } from "react";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance?: string;
  onConfirm?: (amount: string) => void;
}

export function WithdrawModal({
  isOpen,
  onClose,
  availableBalance = "₹8,247.50",
  onConfirm,
}: WithdrawModalProps) {
  const [withdrawAmount, setWithdrawAmount] = useState("");

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm?.(withdrawAmount);
    setWithdrawAmount("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/40 backdrop-blur-xs cursor-pointer"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-border bg-bg p-6 shadow-2xl font-intert">
        <h3 className="text-base font-semibold text-primary mb-1">
          Withdraw to Bank
        </h3>
        <p className="text-xs text-muted mb-5">
          Transfer your available Razorpay balance to HDFC Bank ****4821.
        </p>

        <div>
          <label className="text-xs font-medium text-secondary block mb-1.5">
            Amount
          </label>
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-border bg-surface focus-within:border-brand transition-colors">
            <span className="text-muted text-sm font-mono">₹</span>
            <input
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="0.00"
              className="flex-1 bg-transparent text-sm text-primary outline-none placeholder:text-muted font-mono"
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-muted mt-1.5">
            <span>Available: {availableBalance}</span>
            <button
              type="button"
              onClick={() => setWithdrawAmount("8247.50")}
              className="link-brand cursor-pointer font-medium"
            >
              Use max
            </button>
          </div>
        </div>

        <div className="flex gap-2.5 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-surface hover:bg-surface-muted text-sm font-medium text-secondary hover:text-primary transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl btn-brand-solid text-sm font-medium cursor-pointer"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
