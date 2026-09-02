"use client";

import { useState } from "react";
import { Loader2, AlertCircle, X, ExternalLink } from "lucide-react";
import { useRazorpay } from "../../../../hooks";

interface RazorpayModalProps {
  isOpen: boolean;
  onClose: () => void;
  isUpdate: boolean;
}

export function RazorpayModal({
  isOpen,
  onClose,
  isUpdate,
}: RazorpayModalProps) {
  const { connectKeys, isConnecting } = useRazorpay();
  const [keyId, setKeyId] = useState("");
  const [keySecret, setKeySecret] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyId.trim() || !keySecret.trim()) return;
    setErrorMessage(null);

    try {
      await connectKeys({
        key_id: keyId.trim(),
        key_secret: keySecret.trim(),
      });
      setKeyId("");
      setKeySecret("");
      onClose();
    } catch {
      setErrorMessage("Invalid Key ID or Secret. Please verify keys in your Razorpay Dashboard.");
    }
  };

  const handleClose = () => {
    setKeyId("");
    setKeySecret("");
    setErrorMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-intert overflow-y-auto">
      <button
        type="button"
        aria-label="Close"
        className="fixed inset-0 bg-black/50 backdrop-blur-xs cursor-pointer"
        onClick={handleClose}
      />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-auto">
        <div className="flex items-center justify-between pb-3.5 border-b border-border mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#02042B] text-[#3395FF] flex items-center justify-center shrink-0">
              <svg
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="currentColor"
              >
                <path d="M22.436 0l-11.91 7.773-1.174 4.276 6.625-4.297L11.65 24h4.391l6.395-24zM14.26 10.098L3.389 17.166 1.564 24h9.008l3.688-13.902Z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-semibold text-primary">
                {isUpdate ? "Update Razorpay Keys" : "Connect Razorpay Account"}
              </h2>
              <p className="text-xs text-muted">
                Configure your API credentials for automated payment links
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-primary hover:bg-surface-muted transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {errorMessage && (
          <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs">
            <AlertCircle size={14} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="modalRazorpayKeyId"
                className="text-xs font-medium text-primary"
              >
                Key ID
              </label>
              <a
                href="https://dashboard.razorpay.com/app/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-brand hover:text-brand-subtle transition-colors"
              >
                Get Keys <ExternalLink size={10} />
              </a>
            </div>
            <input
              id="modalRazorpayKeyId"
              type="text"
              autoComplete="off"
              value={keyId}
              onChange={(e) => {
                setKeyId(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="rzp_test_..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-bg text-primary placeholder:text-muted focus:outline-none focus:border-brand/50 font-mono"
            />
          </div>

          <div>
            <label
              htmlFor="modalRazorpayKeySecret"
              className="text-xs font-medium text-primary block mb-1"
            >
              Key Secret
            </label>
            <input
              id="modalRazorpayKeySecret"
              type="password"
              autoComplete="off"
              value={keySecret}
              onChange={(e) => {
                setKeySecret(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="Enter your key secret"
              className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-bg text-primary placeholder:text-muted focus:outline-none focus:border-brand/50 font-mono"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border mt-5">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-lg border border-border bg-surface text-secondary hover:text-primary text-xs font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!keyId.trim() || !keySecret.trim() || isConnecting}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
                keyId.trim() && keySecret.trim() && !isConnecting
                  ? "btn-brand-solid cursor-pointer shadow-xs"
                  : "bg-surface-muted text-muted border border-border cursor-not-allowed opacity-90"
              }`}
            >
              {isConnecting && <Loader2 size={13} className="animate-spin" />}
              <span>{isUpdate ? "Save New Keys" : "Verify & Connect"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
