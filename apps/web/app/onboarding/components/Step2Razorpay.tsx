"use client";

import { Check, ExternalLink } from "lucide-react";
import { RazorpayKeys } from "../types";

export function Step2Razorpay({
  keys,
  setKeys,
}: {
  keys: RazorpayKeys;
  setKeys: (k: RazorpayKeys) => void;
}) {
  const handleConnect = () => {
    if (keys.keyId.trim() && keys.keySecret.trim()) {
      setKeys({ ...keys, connected: true });
    }
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
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
            <Check size={28} className="text-success" />
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
            onClick={() =>
              setKeys({ keyId: "", keySecret: "", connected: false })
            }
            className="text-xs font-intert text-muted hover:text-primary transition-colors"
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

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-primary font-intert">
              Key ID
            </label>
            <input
              type="text"
              placeholder="rzp_test_..."
              value={keys.keyId}
              onChange={(e) => setKeys({ ...keys, keyId: e.target.value })}
              className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-primary font-mono text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-primary font-intert">
              Key Secret
            </label>
            <input
              type="password"
              placeholder="Enter your key secret"
              value={keys.keySecret}
              onChange={(e) => setKeys({ ...keys, keySecret: e.target.value })}
              className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-primary font-mono text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all"
            />
          </div>

          <button
            type="button"
            onClick={handleConnect}
            disabled={!keys.keyId.trim() || !keys.keySecret.trim()}
            className="w-full py-2.5 rounded-xl bg-accent text-bg font-medium font-intert text-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Connect Razorpay Test Account
          </button>
        </div>
      )}
    </div>
  );
}
