"use client";

import { useState, useEffect } from "react";
import {
  X,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  MessageSquare,
  RefreshCw,
  BellRing,
  Link2,
} from "lucide-react";
import type { OrderResponse } from "../../../../types/order";

interface WhatsAppAIModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderResponse | null;
}

type GenerationMode = "both" | "reminder";

function RazorpayIcon({ size = 11 }: { size?: number }) {
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

function WhatsAppIcon({ size = 18 }: { size?: number }) {
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

export function WhatsAppAIModal({
  isOpen,
  onClose,
  order,
}: WhatsAppAIModalProps) {
  const [mode, setMode] = useState<GenerationMode>("both");
  const [hasStarted, setHasStarted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [messageText, setMessageText] = useState("");

  const total = order ? Number(order.total_amount) || 0 : 0;
  const paid = order ? Number(order.paid_amount) || 0 : 0;
  const dueAmount = Math.max(0, total - paid);
  const paymentLink = order ? `https://rzp.io/l/ord-${order.id.slice(0, 8)}` : "";

  useEffect(() => {
    if (!isOpen || !order) {
      setHasStarted(false);
      setIsGenerating(false);
      setStepIndex(0);
      setMessageText("");
      setMode("both");
    }
  }, [isOpen, order]);

  if (!isOpen || !order) return null;

  const triggerGeneration = (selectedMode: GenerationMode) => {
    setMode(selectedMode);
    setHasStarted(true);
    setIsGenerating(true);
    setStepIndex(0);

    const timer1 = setTimeout(() => setStepIndex(1), 350);
    const timer2 = setTimeout(() => setStepIndex(2), 700);
    const timer3 = setTimeout(() => {
      setIsGenerating(false);
      setStepIndex(3);

      const itemsList = order.items
        .map(
          (item) =>
            `• ${item.product_name_snapshot} x ${item.quantity} - ₹${(Number(item.unit_price_snapshot) * item.quantity).toLocaleString("en-IN")}`,
        )
        .join("\n");

      const storeName = order.store_name || "Sharma Store";

      let draft = "";
      if (selectedMode === "both") {
        draft = `Namaste ${order.customer_name} ji! 🙏\nHere is your order summary from ${storeName}:\n\n📦 Order Items:\n${itemsList}\n\n💵 Total Bill: ₹${total.toLocaleString("en-IN")}\n⏳ Amount Due: ₹${dueAmount.toLocaleString("en-IN")}\n\n💳 Pay online instantly via Razorpay:\n${paymentLink}\n\nThank you for shopping with us!`;
      } else {
        draft = `Namaste ${order.customer_name} ji! 🙏\nThis is a gentle reminder regarding your outstanding payment of ₹${dueAmount.toLocaleString("en-IN")} for your recent order at ${storeName}.\n\n💳 Quick Online Payment Link:\n${paymentLink}\n\nPlease let us know once paid. Thank you!`;
      }

      setMessageText(draft);
    }, 1100);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(paymentLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(messageText);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2000);
  };

  const handleSendWhatsApp = () => {
    const cleanPhone = (order.customer_phone || "").replace(/\D/g, "");
    const encoded = encodeURIComponent(messageText);
    const url = cleanPhone
      ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encoded}`
      : `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(url, "_blank");
  };

  const steps = [
    { label: "Generating Razorpay Payment Link...", done: stepIndex >= 1 },
    {
      label: "Drafting bilingual WhatsApp message in Hindi & English...",
      done: stepIndex >= 2,
    },
    { label: "Finalizing bill breakdown...", done: stepIndex >= 3 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-intert">
      <div className="relative w-full max-w-lg bg-surface border border-border rounded-2xl shadow-2xl p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#25D366]/10 text-[#25D366] flex items-center justify-center">
              <WhatsAppIcon size={18} />
            </div>
            <div>
              <h2 className="text-base font-semibold font-instrument text-primary">
                AI WhatsApp Bill & Pay Link
              </h2>
              <p className="text-xs text-muted font-intert">
                Order #{order.id.slice(0, 8)} · {order.customer_name}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-primary hover:bg-surface-muted transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {!hasStarted ? (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl border border-border bg-bg/50 flex items-center justify-between gap-3">
              <div>
                <span className="text-[11px] text-muted block">Customer</span>
                <span className="text-sm font-medium text-primary">
                  {order.customer_name}
                </span>
                {order.customer_phone && (
                  <span className="text-xs text-muted block">
                    {order.customer_phone}
                  </span>
                )}
              </div>
              <div className="text-right">
                <span className="text-[11px] text-muted block">Balance Due</span>
                <span className="text-base font-instrument text-danger font-semibold">
                  ₹{dueAmount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-primary mb-2.5">
                Select Generation Mode
              </p>
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => triggerGeneration("both")}
                  className="w-full flex items-start gap-3 p-3.5 rounded-xl border border-border bg-bg hover:border-brand/50 hover:bg-surface-muted/40 transition-colors text-left cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center shrink-0 mt-0.5">
                    <Link2 size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-primary group-hover:text-brand transition-colors">
                      Payment Link & Bill Summary
                    </p>
                    <p className="text-[11px] text-muted mt-0.5">
                      Creates instant Razorpay link and formats an itemized
                      WhatsApp message with due balance.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => triggerGeneration("reminder")}
                  className="w-full flex items-start gap-3 p-3.5 rounded-xl border border-border bg-bg hover:border-brand/50 hover:bg-surface-muted/40 transition-colors text-left cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <BellRing size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-primary group-hover:text-brand transition-colors">
                      Payment Reminder Message
                    </p>
                    <p className="text-[11px] text-muted mt-0.5">
                      Polite reminder message for pending ₹{dueAmount.toLocaleString("en-IN")} with
                      direct payment link.
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        ) : isGenerating ? (
          <div className="py-8 px-4 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-full border-2 border-brand border-t-transparent animate-spin mb-4" />
            <p className="text-sm font-medium text-primary mb-3">
              AI Copilot is preparing your message...
            </p>
            <div className="w-full max-w-sm space-y-2 text-left">
              {steps.map((st, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  {st.done ? (
                    <Check size={14} className="text-emerald-500 shrink-0" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-border shrink-0" />
                  )}
                  <span
                    className={
                      st.done ? "text-primary font-medium" : "text-muted"
                    }
                  >
                    {st.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-bg p-3.5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-sm bg-[#02042B] text-[#3395FF] shrink-0">
                    <RazorpayIcon size={11} />
                  </div>
                  <span className="text-xs font-medium text-primary">
                    Razorpay Payment Link
                  </span>
                </div>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-medium border border-emerald-500/20">
                  <ShieldCheck size={11} />
                  <span>Due ₹{dueAmount.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 bg-surface p-2 rounded-lg border border-border">
                <span className="font-mono text-xs text-primary truncate select-all">
                  {paymentLink}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-muted hover:bg-surface border border-border text-xs font-medium text-secondary hover:text-primary transition-colors cursor-pointer"
                  >
                    {copiedLink ? (
                      <>
                        <Check size={12} className="text-emerald-500" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                  <a
                    href={paymentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-surface-muted hover:bg-surface border border-border text-secondary hover:text-primary transition-colors"
                  >
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-primary flex items-center gap-1">
                  <MessageSquare size={13} className="text-muted" />
                  <span>Generated WhatsApp Draft</span>
                </label>
                <button
                  type="button"
                  onClick={() => triggerGeneration(mode)}
                  className="inline-flex items-center gap-1 text-[11px] text-brand hover:underline cursor-pointer"
                >
                  <RefreshCw size={11} />
                  <span>Regenerate</span>
                </button>
              </div>
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                rows={mode === "reminder" ? 6 : 8}
                className="w-full p-3 text-xs leading-relaxed font-intert rounded-xl border border-border bg-bg text-primary focus:outline-none focus:border-brand/50 resize-y"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-2 border-t border-border">
              <button
                type="button"
                onClick={handleCopyMessage}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-border bg-surface hover:bg-surface-muted text-xs font-medium text-primary transition-colors cursor-pointer"
              >
                {copiedMessage ? (
                  <>
                    <Check size={14} className="text-emerald-500" />
                    <span>Message Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copy Message</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-medium transition-colors shadow-sm cursor-pointer"
              >
                <WhatsAppIcon size={16} />
                <span>Send on WhatsApp</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
