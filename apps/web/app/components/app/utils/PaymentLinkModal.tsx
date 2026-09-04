"use client";

import { useState } from "react";
import Link from "next/link";
import {
  X,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  MessageCircle,
  RotateCcw,
  AlertCircle,
} from "lucide-react";
import { useCreatePaymentLink } from "../../../../hooks";

interface PaymentLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCustomerName?: string;
  defaultAmount?: string;
}

const PRESET_PROMPTS = [
  "Create a ₹500 payment link for Rahul Sharma for monthly staples",
  "Generate a ₹1,200 payment link for Priya Mehta for grocery basket",
  "Create a ₹350 link for Sunita Rao for dairy and provisions",
];

const QUICK_CUSTOMERS = [
  { name: "Rahul Sharma", phone: "+91 98765 43210" },
  { name: "Priya Mehta", phone: "+91 98123 45678" },
  { name: "Ankit Verma", phone: "+91 98989 89898" },
  { name: "Sunita Rao", phone: "+91 98456 78901" },
  { name: "Vikram Patel", phone: "+91 97654 32109" },
  { name: "Neha Gupta", phone: "+91 98234 56789" },
];

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

function WhatsAppIcon({ size = 16 }: { size?: number }) {
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

export function PaymentLinkModal({
  isOpen,
  onClose,
  defaultCustomerName = "",
  defaultAmount = "",
}: PaymentLinkModalProps) {
  const [tab, setTab] = useState<"ai" | "manual">("ai");
  const [aiPrompt, setAiPrompt] = useState(
    PRESET_PROMPTS[0] ?? "Create a ₹500 payment link for Rahul Sharma",
  );
  const [customerName, setCustomerName] = useState(
    defaultCustomerName || "Rahul Sharma",
  );
  const [customerPhone, setCustomerPhone] = useState("+91 98765 43210");
  const [amount, setAmount] = useState(defaultAmount || "500");
  const [purpose, setPurpose] = useState("Kirana staples and grocery order");

  const [generatedLink, setGeneratedLink] = useState<{
    url: string;
    customer: string;
    phone: string;
    amount: string;
    purpose: string;
  } | null>(null);

  const [copied, setCopied] = useState(false);
  const createMutation = useCreatePaymentLink();

  if (!isOpen) return null;

  const handleGenerateAi = async () => {
    if (!aiPrompt.trim()) return;
    const parsedAmountMatch = aiPrompt.match(/₹?(\d+[\d,]*)/)?.[1]?.replace(/,/g, "");
    const cleanAmount = Number(parsedAmountMatch || "500");
    const parsedName =
      QUICK_CUSTOMERS.find((c) => {
        const firstName = c.name.toLowerCase().split(" ")[0] ?? "";
        return firstName ? aiPrompt.toLowerCase().includes(firstName) : false;
      })?.name || "Customer";

    const matchedPhone =
      QUICK_CUSTOMERS.find((c) => c.name === parsedName)?.phone || undefined;

    try {
      const res = await createMutation.mutateAsync({
        customer_name: parsedName,
        customer_phone: matchedPhone,
        amount: cleanAmount,
        description: aiPrompt.trim(),
      });
      setGeneratedLink({
        url: res.razorpay_link_url || "",
        customer: res.customer_name,
        phone: res.customer_phone || "",
        amount: `₹${res.amount}`,
        purpose: res.description,
      });
    } catch {
    }
  };

  const handleGenerateManual = async () => {
    if (!customerName.trim() || !amount.trim()) return;
    const cleanAmount = Number(amount.replace(/[^0-9.]/g, ""));
    if (isNaN(cleanAmount) || cleanAmount <= 0) return;

    try {
      const res = await createMutation.mutateAsync({
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim() || undefined,
        amount: cleanAmount,
        description: purpose.trim() || "Store purchase",
      });
      setGeneratedLink({
        url: res.razorpay_link_url || "",
        customer: res.customer_name,
        phone: res.customer_phone || "",
        amount: `₹${res.amount}`,
        purpose: res.description,
      });
    } catch {
    }
  };

  const handleCopy = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setGeneratedLink(null);
    setCustomerName(defaultCustomerName || "Rahul Sharma");
    setAmount(defaultAmount || "500");
  };

  const handleSendWhatsApp = () => {
    if (!generatedLink) return;
    const cleanPhone = generatedLink.phone.replace(/[^0-9]/g, "");
    const shareText = encodeURIComponent(
      `Hi ${generatedLink.customer}, here is your payment link of ${generatedLink.amount} for "${generatedLink.purpose}": ${generatedLink.url}`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${shareText}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/40 backdrop-blur-xs cursor-pointer"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-surface p-5 shadow-2xl font-intert overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#02042B] text-[#3395FF] flex items-center justify-center text-xs">
              <RazorpayIcon size={12} />
            </div>
            <h2 className="text-sm font-semibold text-primary">
              Generate Payment Link
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-primary transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {createMutation.isError && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0" />
            <span className="truncate">
              {createMutation.error?.message || "Failed to generate Razorpay link"}
            </span>
          </div>
        )}

        {!generatedLink ? (
          <div>
            <div className="flex rounded-lg bg-bg p-1 border border-border mb-4">
              <button
                type="button"
                onClick={() => setTab("ai")}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  tab === "ai"
                    ? "bg-surface text-primary shadow-xs font-semibold"
                    : "text-muted hover:text-primary"
                }`}
              >
                <Sparkles size={13} className="text-brand" />
                <span>AI Prompt</span>
              </button>
              <button
                type="button"
                onClick={() => setTab("manual")}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  tab === "manual"
                    ? "bg-surface text-primary shadow-xs font-semibold"
                    : "text-muted hover:text-primary"
                }`}
              >
                <RazorpayIcon size={12} />
                <span>Manual Form</span>
              </button>
            </div>

            {tab === "ai" ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-primary block mb-1">
                    Describe the payment in natural language
                  </label>
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    rows={3}
                    placeholder="e.g. Generate ₹850 link for Sharmaji for oil and grains"
                    className="w-full p-2.5 text-xs rounded-xl border border-border bg-bg text-primary placeholder:text-muted focus:outline-none focus:border-brand/50 resize-none font-intert"
                  />
                </div>

                <div>
                  <p className="text-[11px] text-muted mb-1.5 font-medium">
                    Try quick presets:
                  </p>
                  <div className="space-y-1">
                    {PRESET_PROMPTS.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setAiPrompt(p)}
                        className="w-full text-left p-2 rounded-lg bg-bg hover:bg-surface-muted border border-border/60 text-[11px] text-secondary hover:text-primary transition-colors cursor-pointer truncate"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleGenerateAi}
                    disabled={createMutation.isPending || !aiPrompt.trim()}
                    className="w-full py-2.5 rounded-xl btn-brand-solid text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                  >
                    {createMutation.isPending ? (
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    ) : (
                      <>
                        <Sparkles size={14} />
                        <span>Generate Link via AI</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-primary block mb-1">
                    Customer Name
                  </label>
                  <input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Customer Name"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-bg text-primary focus:outline-none focus:border-brand/50"
                  />
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {QUICK_CUSTOMERS.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => {
                          setCustomerName(c.name);
                          setCustomerPhone(c.phone);
                        }}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-surface-muted hover:bg-brand/10 hover:text-brand border border-border transition-colors cursor-pointer text-muted"
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-xs font-medium text-primary block mb-1">
                      Phone Number
                    </label>
                    <input
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+91 98..."
                      className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-bg text-primary focus:outline-none focus:border-brand/50"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-primary block mb-1">
                      Amount (₹)
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="500"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-bg text-primary focus:outline-none focus:border-brand/50 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-primary block mb-1">
                    Payment Purpose / Description
                  </label>
                  <input
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="Provisions and groceries"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-bg text-primary focus:outline-none focus:border-brand/50"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleGenerateManual}
                    disabled={
                      createMutation.isPending || !customerName.trim() || !amount.trim()
                    }
                    className="w-full py-2.5 rounded-xl btn-brand-solid text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                  >
                    {createMutation.isPending ? (
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    ) : (
                      <>
                        <RazorpayIcon size={14} />
                        <span>Create Razorpay Payment Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-bg p-3.5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded bg-[#02042B] text-[#3395FF] flex items-center justify-center text-[10px]">
                    <RazorpayIcon size={11} />
                  </div>
                  <span className="text-xs font-medium text-primary">
                    Razorpay Payment Link Ready
                  </span>
                </div>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-medium border border-emerald-500/20">
                  <ShieldCheck size={11} />
                  <span>Test Mode</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-border my-2">
                <div>
                  <span className="text-[10px] text-muted uppercase">
                    Customer
                  </span>
                  <p className="font-medium text-primary">
                    {generatedLink.customer}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-muted uppercase">
                    Amount
                  </span>
                  <p className="font-bold text-primary font-mono">
                    {generatedLink.amount}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 bg-surface p-2 rounded-lg border border-border mt-2">
                <span className="font-mono text-xs text-primary truncate select-all">
                  {generatedLink.url}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-muted hover:bg-surface border border-border text-xs font-medium text-secondary hover:text-primary transition-colors cursor-pointer shrink-0"
                >
                  {copied ? (
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
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="w-full py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <WhatsAppIcon size={16} />
                <span>Send on WhatsApp</span>
              </button>

              <Link
                href="/customers"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl border border-border bg-bg hover:bg-surface-muted text-xs font-medium text-secondary hover:text-primary flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle size={14} />
                <span>Send in Customer Chat</span>
              </Link>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1 text-xs text-muted hover:text-primary cursor-pointer"
              >
                <RotateCcw size={12} />
                <span>Create another link</span>
              </button>

              <a
                href={generatedLink.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-brand hover:underline font-medium cursor-pointer"
              >
                <span>Open checkout</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
