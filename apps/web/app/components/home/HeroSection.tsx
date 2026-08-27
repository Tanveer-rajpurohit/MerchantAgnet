"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Store,
  CheckCircle2,
  Bot,
  Copy,
  Send,
  Layers,
  AlertTriangle,
  ShieldCheck,
  Check,
} from "lucide-react";

interface HeroSectionProps {
  activeCard: number;
}

export default function HeroSection({ activeCard }: HeroSectionProps) {
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="w-full pt-28 sm:pt-36 pb-12 sm:pb-16 flex flex-col items-center border-b border-border">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1 text-xs font-medium font-intert text-secondary shadow-xs mb-6 sm:mb-8">
          <span>Backed by:</span>
          <div className="flex items-center gap-1.5 font-semibold text-primary">
            <div className="flex h-4 w-4 items-center justify-center rounded-xs bg-brand/15 text-brand">
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

        <h1 className="w-full max-w-[820px] text-primary text-[32px] xs:text-[40px] sm:text-[54px] md:text-[68px] lg:text-[84px] font-normal leading-[1.08] font-instrument tracking-tight mb-5 sm:mb-6">
          Effortless custom commerce
          <br />
          by <span className="italic">MerchantAgent</span>
        </h1>

        <p className="w-full max-w-[540px] text-muted sm:text-lg md:text-xl leading-[1.45] font-intert font-normal mb-8 sm:mb-10">
          An AI agent that runs day-to-day growth actions for small Indian
          merchants — payment links, catalog sync, and gated campaigns.
        </p>

        <div className="flex items-center justify-center mb-10 sm:mb-14">
          <Link
            href="/merchant"
            className="h-11 sm:h-12 px-8 sm:px-10 py-2.5 bg-accent text-bg shadow-[0px_0px_0px_2.5px_var(--brand-subtle)_inset] rounded-full flex justify-center items-center hover:opacity-90 active:scale-95 transition-all text-sm sm:text-[15px] font-medium font-intert"
          >
            Meet your assistant
          </Link>
        </div>

        <div className="w-full bg-surface border border-border shadow-xl rounded-xl overflow-hidden text-left">
          <div className="w-full flex items-center justify-between border-b border-border px-5 py-3 bg-surface text-xs font-intert">
            <div className="flex items-center gap-2">
              <Store size={15} className="text-brand" />
              <span className="font-semibold text-primary">
                Sharma Kirana Store
              </span>
              <span className="text-muted hidden sm:inline">
                · Indiranagar, Bengaluru
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-success bg-success/10 px-2.5 py-0.5 rounded-full">
                <CheckCircle2 size={11} /> Razorpay Test Mode
              </span>
            </div>
          </div>

          <div className="w-full p-5 sm:p-7 bg-bg">
            {activeCard === 0 && (
              <div className="space-y-4">
                <div className="flex items-start gap-3 justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-tr-xs bg-accent text-bg px-4 py-2.5 text-xs sm:text-sm font-intert shadow-xs">
                    Send Rahul a ₹450 payment link for 2x Fortune Oil & 1x
                    Aashirvaad Atta
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-bg text-xs">
                    <Bot size={16} />
                  </div>
                  <div className="w-full max-w-[90%] rounded-2xl rounded-tl-xs border border-border bg-surface p-4 text-xs sm:text-sm font-intert text-primary shadow-xs space-y-3">
                    <div className="flex items-center justify-between text-xs text-muted border-b border-border pb-2">
                      <span className="font-mono">
                        tool: create_payment_link
                      </span>
                      <span className="text-success font-medium flex items-center gap-1">
                        <CheckCircle2 size={12} /> Bounded Action
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-sm text-primary">
                          Rahul Sharma
                        </p>
                        <p className="text-xs text-muted">
                          2x Fortune Oil, 1x Aashirvaad Atta
                        </p>
                      </div>
                      <div className="text-right font-mono font-bold text-base text-primary">
                        ₹450.00
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-bg px-3 py-1.5 text-xs font-medium font-intert text-primary hover:border-brand/40 transition-colors"
                      >
                        <Copy size={13} />
                        <span>{copied ? "Copied" : "Copy Razorpay Link"}</span>
                      </button>
                      <a
                        href="https://wa.me/?text=Here%20is%20your%20payment%20link:%20https://rzp.io/i/test_link"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-success text-bg px-3.5 py-1.5 text-xs font-medium font-intert hover:opacity-90 transition-opacity"
                      >
                        <Send size={12} />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeCard === 1 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <div className="text-xs font-semibold text-primary font-intert flex items-center gap-1.5">
                    <Layers size={14} className="text-brand" />
                    <span>Exact Catalog State (MCP Queryable)</span>
                  </div>
                  <span className="text-[11px] font-mono text-muted">
                    26 Products Synced
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-surface text-xs font-intert">
                    <div>
                      <p className="font-semibold text-primary">
                        Fortune Sunlite Sunflower Oil (1L)
                      </p>
                      <p className="text-muted font-mono">₹145.00</p>
                    </div>
                    <span className="inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded-md bg-warning/10 text-warning font-medium">
                      <AlertTriangle size={11} /> 3 left (Low stock)
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-surface text-xs font-intert">
                    <div>
                      <p className="font-semibold text-primary">
                        India Gate Super Basmati Rice (5kg)
                      </p>
                      <p className="text-muted font-mono">₹480.00</p>
                    </div>
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-success/10 text-success font-medium">
                      24 in stock
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-surface text-xs font-intert">
                    <div>
                      <p className="font-semibold text-primary">
                        Aashirvaad Shudh Chakki Atta (10kg)
                      </p>
                      <p className="text-muted font-mono">₹420.00</p>
                    </div>
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-success/10 text-success font-medium">
                      18 in stock
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeCard === 2 && (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-bg text-xs">
                    <Bot size={16} />
                  </div>
                  <div className="w-full max-w-[90%] rounded-2xl rounded-tl-xs border border-warning/30 bg-warning/5 p-4 text-xs sm:text-sm font-intert text-primary shadow-xs space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-warning font-semibold flex items-center gap-1">
                        <ShieldCheck size={14} /> Gated Approval Batch
                      </span>
                      <span className="text-muted font-mono">
                        10 customers drafted
                      </span>
                    </div>
                    <p className="text-xs text-secondary font-intert">
                      Festival Offer: ₹50 discount on orders above ₹500. Total
                      draft batch exposure: ₹4,500.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setConfirmed(!confirmed)}
                        className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium font-intert transition-colors ${
                          confirmed
                            ? "bg-success text-bg"
                            : "bg-accent text-bg hover:opacity-90"
                        }`}
                      >
                        <Check size={12} />
                        <span>
                          {confirmed
                            ? "Approved & Sent ✓"
                            : "Approve & Dispatch Batch"}
                        </span>
                      </button>
                      <button
                        type="button"
                        className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium font-intert text-muted hover:text-primary transition-colors"
                      >
                        Review Targets
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
