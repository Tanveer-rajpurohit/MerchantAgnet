"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function FooterSection() {
  return (
    <footer className="w-full bg-bg">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between pt-12 pb-10 gap-8">
        <div className="space-y-3">
          <Link
            href="/"
            className="text-primary text-2xl font-normal font-instrument italic hover:opacity-85 transition-opacity"
          >
            MerchantAgent
          </Link>
          <p className="text-muted text-xs sm:text-sm font-intert max-w-xs">
            Autonomous growth actions and catalog synchronization for Indian
            merchants.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <span className="inline-flex items-center gap-1.5 text-xs font-mono text-secondary bg-surface border border-border px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
              Track 1 · Agentic Commerce
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-12 text-xs font-intert text-secondary">
          <div className="space-y-2.5">
            <div className="text-muted font-semibold uppercase tracking-wider font-mono">
              Product
            </div>
            <div className="space-y-1.5">
              <div>
                <Link
                  href="#product"
                  className="hover:text-primary transition-colors"
                >
                  Payment Links
                </Link>
              </div>
              <div>
                <Link
                  href="#product"
                  className="hover:text-primary transition-colors"
                >
                  Catalog MCP
                </Link>
              </div>
              <div>
                <Link
                  href="#product"
                  className="hover:text-primary transition-colors"
                >
                  Campaign Batches
                </Link>
              </div>
              <div>
                <Link
                  href="#product"
                  className="hover:text-primary transition-colors"
                >
                  Audit Trail
                </Link>
              </div>
            </div>
          </div>
          <div className="space-y-2.5">
            <div className="text-muted font-semibold uppercase tracking-wider font-mono">
              Company
            </div>
            <div className="space-y-1.5">
              <div>
                <Link
                  href="#faq"
                  className="hover:text-primary transition-colors"
                >
                  Documentation
                </Link>
              </div>
              <div>
                <Link
                  href="#pricing"
                  className="hover:text-primary transition-colors"
                >
                  Pricing
                </Link>
              </div>
              <div>
                <Link
                  href="#faq"
                  className="hover:text-primary transition-colors"
                >
                  Razorpay Integration
                </Link>
              </div>
              <div>
                <Link
                  href="/merchant"
                  className="hover:text-primary transition-colors"
                >
                  Launch Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full bg-bg border-t border-border py-4 px-4 sm:px-6">
        <div className="w-full max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted font-intert">
          <div>© 2026 MerchantAgent · Built for Razorpay Buildathon</div>
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-success">
            <CheckCircle2 size={12} />
            <span>Razorpay Test Mode Connected</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
