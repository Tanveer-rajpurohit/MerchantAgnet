import { CheckCircle2 } from "lucide-react";

export function RazorpaySection() {
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
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium font-intert border border-emerald-500/20">
          <CheckCircle2 size={13} />
          Connected (Test Mode)
        </div>
      </div>

      <div className="p-4 rounded-xl border border-border bg-bg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] text-muted font-intert">
            Active Key ID
          </span>
          <p className="font-mono text-xs text-primary mt-0.5">
            rzp_test_98kLsM2109xPQ
          </p>
        </div>
        <span className="text-xs font-intert text-muted">
          Zero platform fees enabled
        </span>
      </div>
    </section>
  );
}
