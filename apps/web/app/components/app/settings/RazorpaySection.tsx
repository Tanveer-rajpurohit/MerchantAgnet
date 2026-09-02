"use client";

import { CheckCircle2, AlertCircle, RefreshCw, KeyRound, Unlink } from "lucide-react";
import { useRazorpay } from "../../../../hooks";

interface RazorpaySectionProps {
  onOpenModal: () => void;
  onOpenDisconnectModal: () => void;
}

export function RazorpaySection({
  onOpenModal,
  onOpenDisconnectModal,
}: RazorpaySectionProps) {
  const { status, isLoading } = useRazorpay();

  if (isLoading) {
    return (
      <section className="rounded-2xl border border-border bg-surface p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="h-6 w-40 bg-surface-muted rounded-lg animate-pulse" />
          <div className="h-6 w-28 bg-surface-muted rounded-full animate-pulse" />
        </div>
        <div className="h-16 w-full bg-surface-muted rounded-xl animate-pulse" />
      </section>
    );
  }

  const isConnected = Boolean(status?.is_connected);
  const modeLabel = status?.mode === "live" ? "Live Mode" : "Test Mode";

  return (
    <section className="rounded-2xl border border-border bg-surface p-6">
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-[18px] w-[18px] items-center justify-center rounded-xs bg-[#02042B] text-[#3395FF]">
              <svg
                viewBox="0 0 24 24"
                width="10"
                height="10"
                fill="currentColor"
              >
                <path d="M22.436 0l-11.91 7.773-1.174 4.276 6.625-4.297L11.65 24h4.391l6.395-24zM14.26 10.098L3.389 17.166 1.564 24h9.008l3.688-13.902Z" />
              </svg>
            </div>
            <h2 className="text-base font-medium font-intert text-primary">
              Razorpay Integration
            </h2>
          </div>
          <p className="text-xs text-muted font-intert mt-0.5">
            Payment gateway connection for automated link generation.
          </p>
        </div>

        {isConnected ? (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium font-intert border border-emerald-500/20">
            <CheckCircle2 size={13} />
            Connected ({modeLabel})
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-medium font-intert border border-amber-500/20">
            <AlertCircle size={13} />
            Not Connected
          </div>
        )}
      </div>

      {isConnected ? (
        <div className="p-4 rounded-xl border border-border bg-bg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] text-muted font-intert">
              Active Key ID
            </span>
            <p className="font-mono text-xs text-primary mt-0.5">
              {status?.key_id_masked || "Configured"}
            </p>
            <p className="text-[11px] text-muted font-intert mt-1">
              Zero platform fees enabled
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-surface hover:bg-surface-muted text-xs font-medium font-intert text-secondary hover:text-primary transition-colors cursor-pointer"
            >
              <KeyRound size={13} />
              <span>Update Keys</span>
            </button>
            <button
              type="button"
              onClick={onOpenDisconnectModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-surface hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-600 text-xs font-medium font-intert text-secondary transition-colors cursor-pointer"
            >
              <Unlink size={13} />
              <span>Disconnect</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl border border-border bg-bg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-primary font-intert">
              No active gateway configured
            </p>
            <p className="text-[11px] text-muted font-intert mt-0.5">
              Connect your test keys to enable automated customer checkout links.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenModal}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl btn-brand-solid text-xs font-medium font-intert cursor-pointer shadow-xs"
          >
            <RefreshCw size={13} />
            <span>Connect Razorpay</span>
          </button>
        </div>
      )}
    </section>
  );
}
