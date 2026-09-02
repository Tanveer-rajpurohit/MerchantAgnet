"use client";

import { AlertTriangle, Loader2, X } from "lucide-react";

interface DisconnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  isDisconnecting: boolean;
  keyIdMasked: string | null;
}

export function DisconnectModal({
  isOpen,
  onClose,
  onConfirm,
  isDisconnecting,
  keyIdMasked,
}: DisconnectModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-intert overflow-y-auto">
      <button
        type="button"
        aria-label="Close"
        className="fixed inset-0 bg-black/50 backdrop-blur-xs cursor-pointer"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-auto">
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
            <AlertTriangle size={20} />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-primary hover:bg-surface-muted transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div>
          <h3 className="text-base font-semibold text-primary">
            Disconnect Razorpay
          </h3>
          <p className="text-xs text-muted mt-1.5 leading-relaxed">
            Are you sure you want to disconnect this Razorpay integration? Your encrypted API credentials will be permanently revoked from this workspace.
          </p>
        </div>

        {keyIdMasked && (
          <div className="my-4 p-3.5 rounded-xl border border-border bg-bg">
            <span className="text-[11px] text-muted block">
              Connected Key ID
            </span>
            <span className="font-mono text-xs text-primary font-medium mt-0.5 block">
              {keyIdMasked}
            </span>
          </div>
        )}

        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-300 leading-relaxed mb-6">
          You will not be able to generate payment links or process automated checkouts until you reconnect your API keys.
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            disabled={isDisconnecting}
            className="px-4 py-2 rounded-xl border border-border bg-surface text-secondary hover:text-primary text-xs font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDisconnecting}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-medium transition-all flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
          >
            {isDisconnecting && <Loader2 size={13} className="animate-spin" />}
            <span>Disconnect Account</span>
          </button>
        </div>
      </div>
    </div>
  );
}
