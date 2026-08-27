"use client";

import Link from "next/link";
import {
  Check,
  Copy,
  Send,
  Store,
  Clock,
  Layers,
  CreditCard,
  Plus,
} from "lucide-react";
import { useState } from "react";

export default function HeroSection() {
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative pt-32 md:pt-40 overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-surface/90 px-3.5 py-1 text-xs font-medium font-intert text-secondary shadow-xs mb-8">
          <span>Backed by:</span>
          <div className="flex items-center gap-1.5 font-semibold text-primary">
            <div className="flex h-4 w-4 items-center justify-center rounded-xs bg-[#0C2340] text-[#528FF0]">
              <svg
                viewBox="0 0 24 24"
                width="11"
                height="11"
                fill="currentColor"
              >
                <path d="M22.436 0l-11.91 7.773-1.174 4.276 6.625-4.297L11.65 24h4.391l6.395-24zM14.26 10.098L3.389 17.166 1.564 24h9.008l3.688-13.902Z" />
              </svg>
            </div>
            <span>Razorpay</span>
          </div>
        </div>

        <h1 className="mx-auto max-w-5xl text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-instrument font-normal tracking-tight text-primary leading-[1.08] mb-6">
          <span className="text-muted/40 font-light select-none mr-2 sm:mr-3">
            (
          </span>
          The store{" "}
          <span className="italic font-normal text-primary">runs itself</span>
          <span className="text-muted/40 font-light select-none ml-2 sm:ml-3">
            )
          </span>
        </h1>

        <p className="mx-auto max-w-2xl text-base sm:text-lg md:text-xl font-intert text-secondary font-normal leading-relaxed mb-9">
          An AI platform that runs day-to-day growth and commerce for Indian
          merchants. Automating payment links, catalog sync, and gated campaigns
          that scale your business.
        </p>

        <div className="flex items-center justify-center mb-16 sm:mb-20">
          <Link
            href="/merchant"
            className="inline-flex items-center justify-center rounded-xl bg-accent px-8 py-3.5 text-sm sm:text-base font-medium font-intert text-bg transition-all hover:opacity-90 active:scale-95 shadow-sm"
          >
            Meet your assistant
          </Link>
        </div>

        <div className="relative mx-auto max-w-5xl">
          <div className="relative rounded-t-2xl sm:rounded-t-3xl border-t border-x border-border/80 bg-surface shadow-2xl shadow-black/10 overflow-hidden text-left max-h-[380px] sm:max-h-[440px]">
            <div className="flex items-center justify-between border-b border-border/70 px-5 sm:px-7 py-3.5 bg-surface">
              <div className="flex items-center gap-3">
                <Store size={16} className="text-muted" />
                <span className="text-xs sm:text-sm font-satoshi font-medium text-primary">
                  Sharma Kirana Store, Indiranagar, Bengaluru, 560038
                </span>
                <span className="hidden sm:inline-block text-xs font-mono text-muted">
                  Settles Apr 13, 2026
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-xs font-intert text-secondary">
                  <span className="h-2 w-2 rounded-full bg-success" />
                  <span className="hidden sm:inline">Tanveer (Owner)</span>
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-bg">
                    TS
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-12 min-h-[460px]">
              <div className="hidden sm:flex sm:col-span-3 border-r border-border/70 p-4 flex-col justify-between bg-surface/50 text-xs font-intert space-y-4">
                <div className="space-y-3">
                  <div className="text-[11px] font-mono text-muted uppercase tracking-wider">
                    Agent Actions
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-bg text-primary font-medium border border-border/60">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                      <span>Payment Links</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg text-secondary hover:bg-surface transition-colors">
                      <span className="h-1.5 w-1.5 rounded-full bg-muted/40" />
                      <span>Catalog MCP</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg text-secondary hover:bg-surface transition-colors">
                      <span className="h-1.5 w-1.5 rounded-full bg-muted/40" />
                      <span>Campaign Batches</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg text-secondary hover:bg-surface transition-colors">
                      <span className="h-1.5 w-1.5 rounded-full bg-muted/40" />
                      <span>Audit Logs</span>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg border border-border/60 bg-bg text-[11px] font-mono text-muted space-y-1">
                  <div className="text-primary font-semibold">
                    Razorpay Test Mode
                  </div>
                  <div>Keys connected & verified</div>
                </div>
              </div>

              <div className="col-span-12 sm:col-span-9 p-5 sm:p-7 space-y-5 bg-bg">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-sm font-satoshi font-semibold text-primary">
                      Documents & Actions
                    </h2>
                    <span className="inline-flex items-center gap-1 rounded-md bg-warning/10 px-2 py-0.5 text-[11px] font-mono text-warning font-medium">
                      <Clock size={11} /> Waiting
                    </span>
                  </div>
                  <p className="text-xs text-muted font-intert">
                    Nothing to do right now — waiting on customer deposit.
                    MerchantAgent surfaces actions the moment they land.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/80 bg-surface/60">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface border border-border text-primary">
                        <Layers size={15} />
                      </div>
                      <div>
                        <p className="text-xs font-satoshi font-semibold text-primary">
                          26 products — purchase catalog + 25 addendums
                        </p>
                        <p className="text-[11px] text-muted font-intert">
                          Received with the order · split and filed
                          automatically
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-mono text-success font-medium bg-success/10 px-2.5 py-1 rounded-md">
                      <Check size={12} /> Received
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-border/80 bg-surface/60 gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface border border-border text-primary">
                        <CreditCard size={15} />
                      </div>
                      <div>
                        <p className="text-xs font-satoshi font-semibold text-primary">
                          Earnest payment link: Rahul Sharma
                        </p>
                        <p className="text-[11px] text-muted font-intert">
                          Received ₹450.00 intent · the contract calls for it
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-bg px-3 py-1.5 text-xs font-medium font-intert text-primary hover:border-brand/40 transition-colors"
                      >
                        <Copy size={12} />
                        <span>{copied ? "Copied" : "Copy"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmed(!confirmed)}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium font-intert transition-colors ${
                          confirmed
                            ? "bg-success text-white"
                            : "bg-accent text-bg hover:opacity-90"
                        }`}
                      >
                        <Send size={12} />
                        <span>{confirmed ? "Dispatched" : "Send Link"}</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-center p-3 rounded-xl border border-dashed border-border text-xs font-intert text-muted hover:text-primary transition-colors cursor-pointer gap-1.5">
                    <Plus size={14} />
                    <span>+ Add document</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-bg via-bg/70 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
