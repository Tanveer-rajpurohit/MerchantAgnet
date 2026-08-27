"use client";

import { useState } from "react";
import Link from "next/link";
import { CreditCard, Check } from "lucide-react";
import { Badge } from "../ui";

export default function PricingSection() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annually">(
    "annually",
  );

  const pricing = {
    starter: {
      monthly: 0,
      annually: 0,
    },
    professional: {
      monthly: 499,
      annually: 399,
    },
    enterprise: {
      monthly: 4999,
      annually: 3999,
    },
  };

  return (
    <section id="pricing" className="w-full border-b border-border">
      <div className="w-full max-w-6xl mx-auto">
        <div className="py-12 sm:py-16 px-4 sm:px-6 flex flex-col items-center text-center border-b border-border">
          <Badge icon={<CreditCard size={12} />} text="Plans & Pricing" />
          <div className="text-primary text-3xl md:text-5xl font-normal font-instrument tracking-tight mt-3 mb-2">
            Choose the perfect plan for your business
          </div>
          <div className="text-muted text-base font-intert max-w-lg">
            Scale your merchant operations with transparent pricing that grows
            with you.
          </div>
        </div>

        <div className="py-5 px-4 sm:px-6 flex justify-center border-b border-border">
          <div className="p-1 bg-surface border border-border rounded-full flex items-center">
            <button
              onClick={() => setBillingPeriod("annually")}
              className={`px-4 py-1.5 rounded-full text-xs font-medium font-intert transition-colors ${
                billingPeriod === "annually"
                  ? "bg-accent text-bg"
                  : "text-muted hover:text-primary"
              }`}
            >
              Annually (Save 20%)
            </button>
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-4 py-1.5 rounded-full text-xs font-medium font-intert transition-colors ${
                billingPeriod === "monthly"
                  ? "bg-accent text-bg"
                  : "text-muted hover:text-primary"
              }`}
            >
              Monthly
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3">
          <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-border flex flex-col justify-between gap-8">
            <div className="space-y-6">
              <div>
                <div className="text-lg font-semibold font-intert text-primary">
                  Starter
                </div>
                <div className="text-sm text-muted font-intert">
                  For local stores getting started with agentic links.
                </div>
              </div>
              <div>
                <div className="text-4xl font-instrument text-primary">
                  ₹{pricing.starter[billingPeriod]}
                </div>
                <div className="text-xs text-muted font-intert">
                  per month, forever free
                </div>
              </div>
              <Link
                href="/register"
                className="w-full py-2.5 rounded-lg border border-border bg-surface text-primary text-xs font-medium font-intert flex items-center justify-center hover:border-brand/40 transition-colors"
              >
                Start for free
              </Link>
            </div>
            <div className="space-y-2.5 text-xs font-intert text-secondary">
              {[
                "Up to 50 payment links / mo",
                "Razorpay test mode keys",
                "Basic catalog management",
                "Community support",
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Check size={14} className="text-success shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-border flex flex-col justify-between gap-8 bg-surface">
            <div className="space-y-6">
              <div>
                <div className="text-lg font-semibold font-intert text-primary flex items-center justify-between">
                  <span>Professional</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-brand/10 text-brand">
                    Popular
                  </span>
                </div>
                <div className="text-sm text-muted font-intert">
                  For scaling brands that need campaigns and MCP.
                </div>
              </div>
              <div>
                <div className="text-4xl font-instrument text-primary">
                  ₹{pricing.professional[billingPeriod]}
                </div>
                <div className="text-xs text-muted font-intert">
                  per month, billed {billingPeriod}
                </div>
              </div>
              <Link
                href="/register"
                className="w-full py-2.5 rounded-lg bg-accent text-bg text-xs font-medium font-intert flex items-center justify-center hover:opacity-90 transition-opacity"
              >
                Get started
              </Link>
            </div>
            <div className="space-y-2.5 text-xs font-intert text-secondary">
              {[
                "Unlimited payment links",
                "Agent-readable catalog MCP",
                "Campaign batch orchestrator",
                "Audit log retention",
                "Priority support",
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Check size={14} className="text-success shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 md:p-8 flex flex-col justify-between gap-8">
            <div className="space-y-6">
              <div>
                <div className="text-lg font-semibold font-intert text-primary">
                  Enterprise
                </div>
                <div className="text-sm text-muted font-intert">
                  Complete solution for multi-outlet retail networks.
                </div>
              </div>
              <div>
                <div className="text-4xl font-instrument text-primary">
                  ₹{pricing.enterprise[billingPeriod]}
                </div>
                <div className="text-xs text-muted font-intert">
                  per month, billed {billingPeriod}
                </div>
              </div>
              <Link
                href="/register"
                className="w-full py-2.5 rounded-lg border border-border bg-surface text-primary text-xs font-medium font-intert flex items-center justify-center hover:border-brand/40 transition-colors"
              >
                Contact sales
              </Link>
            </div>
            <div className="space-y-2.5 text-xs font-intert text-secondary">
              {[
                "Custom Claude Agent SDK tools",
                "Dedicated ERP connectors",
                "24/7 account manager",
                "Custom SLA & SOC2 audit trail",
                "White-label customer checkout",
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Check size={14} className="text-success shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
