"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  MessageCircle,
} from "lucide-react";

interface PaymentLinkCardProps {
  customerName: string;
  customerPhone?: string;
  amount: string;
  description: string;
  linkUrl: string;
  status?: "active" | "paid" | "expired";
}

function RazorpayIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      className="shrink-0"
    >
      <path d="M22.436 0l-11.91 7.773-1.174 4.276 6.625-4.297L11.65 24h4.391l6.395-24zM14.26 10.098L3.389 17.166 1.564 24h9.008l3.688-13.902Z" />
    </svg>
  );
}

function WhatsAppIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className="shrink-0"
    >
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
    </svg>
  );
}

export function PaymentLinkCard({
  customerName,
  customerPhone,
  amount,
  description,
  linkUrl,
  status = "active",
}: PaymentLinkCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(linkUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = () => {
    const text = `Namaste ${customerName} ji! Please complete your payment of ${amount} for: ${description}.\n\nSecure payment link:\n${linkUrl}\n\nThank you for shopping with Sharma Store!`;
    const cleanPhone = (customerPhone || "").replace(/\D/g, "");
    const encoded = encodeURIComponent(text);
    const url = cleanPhone
      ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encoded}`
      : `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(url, "_blank");
  };

  return (
    <div className="w-full my-4 rounded-2xl border border-border bg-surface p-4 sm:p-5 font-intert">
      <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#02042B] text-[#3395FF] flex items-center justify-center shrink-0">
            <RazorpayIcon size={14} />
          </div>
          <div>
            <span className="text-xs font-semibold text-primary block leading-none">
              Razorpay Payment Link
            </span>
            <span className="text-[11px] text-muted">
              Instant payment request
            </span>
          </div>
        </div>

        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-medium border border-emerald-500/20">
          <ShieldCheck size={11} />
          <span>{status === "active" ? "Test Mode Active" : status}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div>
          <span className="text-[11px] text-muted uppercase tracking-wider block">
            Customer
          </span>
          <p className="text-sm font-medium text-primary mt-0.5">
            {customerName}
          </p>
        </div>

        <div>
          <span className="text-[11px] text-muted uppercase tracking-wider block">
            Amount Due
          </span>
          <p className="text-xl font-instrument text-primary mt-0.5">
            {amount}
          </p>
        </div>

        <div className="sm:col-span-2">
          <span className="text-[11px] text-muted uppercase tracking-wider block">
            Purpose
          </span>
          <p className="text-xs text-secondary mt-0.5">{description}</p>
        </div>
      </div>

      <div className="p-2.5 rounded-xl bg-bg border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
        <span className="font-mono text-xs text-primary truncate max-w-full sm:max-w-xs select-all">
          {linkUrl}
        </span>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-muted hover:bg-surface border border-border text-xs font-medium text-secondary hover:text-primary transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check size={12} className="text-emerald-500" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy size={12} />
                <span>Copy Link</span>
              </>
            )}
          </button>

          <a
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg btn-brand-solid text-xs font-medium transition-all"
          >
            <span>Open</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border-subtle">
        <button
          type="button"
          onClick={handleSendWhatsApp}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-medium transition-colors shadow-xs cursor-pointer"
        >
          <WhatsAppIcon size={14} />
          <span>Send on WhatsApp</span>
        </button>

        <Link
          href="/customers"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface hover:bg-surface-muted text-xs font-medium text-secondary hover:text-primary transition-colors"
        >
          <MessageCircle size={13} />
          <span>Send in Customer Chat</span>
        </Link>
      </div>
    </div>
  );
}
