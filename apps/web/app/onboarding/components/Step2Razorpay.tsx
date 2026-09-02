"use client";

import { useState } from "react";
import { Check, ExternalLink, Loader2, AlertCircle } from "lucide-react";
import { useRazorpay } from "../../../hooks";
import type { RazorpayKeys } from "../../types/onboarding";

interface Step2RazorpayProps {
  keys: RazorpayKeys;
  setKeys: (k: RazorpayKeys) => void;
}

export function Step2Razorpay({ keys, setKeys }: Step2RazorpayProps) {
  const { connectKeys, isConnecting } = useRazorpay();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleConnect = async () => {
    if (!keys.keyId.trim() || !keys.keySecret.trim()) return;
    setErrorMessage(null);

    try {
      await connectKeys({
        key_id: keys.keyId.trim(),
        key_secret: keys.keySecret.trim(),
      });
      setKeys({ ...keys, connected: true });
    } catch {
      setErrorMessage("Invalid Key ID or Secret. Please verify keys in your Razorpay Dashboard.");
    }
  };

  const handleReset = () => {
    setKeys({ keyId: "", keySecret: "", connected: false });
    setErrorMessage(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-instrument text-3xl text-primary mb-2">
          Connect Razorpay Test Account
        </h2>
        <p className="font-intert text-secondary text-sm">
          Only Test Mode. No real money moves. Perfect for demo.
        </p>
      </div>

      {keys.connected ? (
        <div className="flex flex-col items-center gap-4 py-12">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <Check size={28} className="text-emerald-500" />
          </div>
          <div className="text-center">
            <p className="font-intert text-primary font-medium text-lg">
              Razorpay Connected
            </p>
            <p className="font-intert text-muted text-sm mt-1">
              Test mode keys verified successfully
            </p>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="text-xs font-intert text-muted hover:text-primary transition-colors cursor-pointer"
          >
            Reconnect with different keys
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-surface border border-border flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#02042B] flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#3395FF">
                <path d="M22.436 0l-11.91 7.773-1.174 4.276 6.625-4.297L11.65 24h4.391l6.395-24zM14.26 10.098L3.389 17.166 1.564 24h9.008l3.688-13.902Z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-intert text-primary font-medium text-sm">
                Razorpay Test Mode
              </p>
              <p className="font-intert text-muted text-xs">
                Paste your test API keys below
              </p>
            </div>
            <a
              href="https://dashboard.razorpay.com/app/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-intert text-brand hover:text-brand-subtle transition-colors"
            >
              How to get keys <ExternalLink size={11} />
            </a>
          </div>

          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-intert">
              <AlertCircle size={14} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="razorpayKeyId"
              className="text-sm font-medium text-primary font-intert"
            >
              Key ID
            </label>
            <input
              id="razorpayKeyId"
              type="text"
              autoComplete="off"
              placeholder="rzp_test_..."
              value={keys.keyId}
              onChange={(e) => {
                setKeys({ ...keys, keyId: e.target.value });
                if (errorMessage) setErrorMessage(null);
              }}
              className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-primary font-mono text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="razorpayKeySecret"
              className="text-sm font-medium text-primary font-intert"
            >
              Key Secret
            </label>
            <input
              id="razorpayKeySecret"
              type="password"
              autoComplete="off"
              placeholder="Enter your key secret"
              value={keys.keySecret}
              onChange={(e) => {
                setKeys({ ...keys, keySecret: e.target.value });
                if (errorMessage) setErrorMessage(null);
              }}
              className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-primary font-mono text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all"
            />
          </div>

          <button
            type="button"
            onClick={handleConnect}
            disabled={!keys.keyId.trim() || !keys.keySecret.trim() || isConnecting}
            className={`w-full py-3 rounded-xl font-medium font-intert text-sm transition-all flex items-center justify-center gap-2 ${
              keys.keyId.trim() && keys.keySecret.trim() && !isConnecting
                ? "btn-brand-solid shadow-xs cursor-pointer"
                : "bg-surface-muted text-muted border border-border cursor-not-allowed opacity-90"
            }`}
          >
            {isConnecting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Verifying credentials...</span>
              </>
            ) : (
              <span>Connect Razorpay Test Account</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
