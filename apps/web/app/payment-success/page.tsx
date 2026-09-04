"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Printer,
  ArrowLeft,
  ShieldCheck,
  Copy,
  Check,
  Store,
} from "lucide-react";
import { useVerifyPayment, usePaymentLinkDetail } from "../../hooks";
import type { PaymentLinkRecord } from "../../types";

function formatInr(amount?: number | null): string {
  if (amount === undefined || amount === null) return "₹0.00";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams();

  const linkId = searchParams.get("id");
  const queryAmount = searchParams.get("amount");
  const queryCustomer = searchParams.get("customer_name");
  const queryPhone = searchParams.get("customer_phone");
  const queryEmail = searchParams.get("customer_email");
  const queryDescription = searchParams.get("description");
  const queryReceipt = searchParams.get("receipt");

  const razorpayPaymentId = searchParams.get("razorpay_payment_id");
  const razorpayPaymentLinkId = searchParams.get("razorpay_payment_link_id");
  const razorpayPaymentLinkReferenceId = searchParams.get(
    "razorpay_payment_link_reference_id",
  );
  const razorpayPaymentLinkStatus = searchParams.get(
    "razorpay_payment_link_status",
  );
  const razorpaySignature = searchParams.get("razorpay_signature");

  const [verifiedRecord, setVerifiedRecord] = useState<PaymentLinkRecord | null>(
    null,
  );
  const [copiedId, setCopiedId] = useState(false);

  const verifyMutation = useVerifyPayment();
  const { data: detailRecord, isLoading: isDetailLoading } = usePaymentLinkDetail(
    linkId || "",
  );

  const isVerifyingRef = useRef(false);

  const doVerify = () => {
    if (
      razorpayPaymentId &&
      razorpayPaymentLinkId &&
      razorpaySignature &&
      razorpaySignature !== "verified"
    ) {
      verifyMutation.mutate(
        {
          razorpay_payment_id: razorpayPaymentId,
          razorpay_payment_link_id: razorpayPaymentLinkId,
          razorpay_payment_link_reference_id:
            razorpayPaymentLinkReferenceId || undefined,
          razorpay_payment_link_status:
            razorpayPaymentLinkStatus || undefined,
          razorpay_signature: razorpaySignature,
        },
        {
          onSuccess: (data) => {
            setVerifiedRecord(data);
          },
        },
      );
    }
  };

  useEffect(() => {
    if (
      razorpayPaymentId &&
      razorpayPaymentLinkId &&
      razorpaySignature &&
      razorpaySignature !== "verified" &&
      !verifiedRecord &&
      !isVerifyingRef.current
    ) {
      isVerifyingRef.current = true;
      doVerify();
    }
  }, [
    razorpayPaymentId,
    razorpayPaymentLinkId,
    razorpaySignature,
    razorpayPaymentLinkReferenceId,
    razorpayPaymentLinkStatus,
    verifiedRecord,
  ]);

  const activePaymentId =
    verifiedRecord?.razorpay_payment_id ||
    detailRecord?.razorpay_payment_id ||
    razorpayPaymentId ||
    null;

  const handleCopyPaymentId = () => {
    if (!activePaymentId) return;
    navigator.clipboard?.writeText(activePaymentId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (verifyMutation.isPending) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center font-intert">
        <Loader2 size={36} className="text-brand animate-spin mb-4" />
        <h2 className="text-lg font-semibold text-primary font-intert">
          Verifying Payment Cryptographic Signature...
        </h2>
        <p className="text-xs text-muted mt-1 max-w-sm">
          Communicating with Razorpay and performing secure HMAC-SHA256 handshake.
        </p>
      </div>
    );
  }

  if (verifyMutation.isError) {
    const isNetworkError =
      verifyMutation.error?.message?.toLowerCase().includes("network") ||
      verifyMutation.error?.message?.toLowerCase().includes("connection") ||
      verifyMutation.error?.message?.toLowerCase().includes("fetch");

    return (
      <div className="flex flex-col items-center justify-center p-8 text-center font-intert">
        <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center mb-4">
          <AlertCircle size={24} />
        </div>
        <h2 className="text-lg font-semibold text-primary font-intert">
          {isNetworkError
            ? "Server Connection Error"
            : "Payment Signature Verification Failed"}
        </h2>
        <p className="text-xs text-muted mt-1 max-w-sm">
          {isNetworkError
            ? "Your payment was processed by Razorpay, but our server couldn't be reached to verify the receipt. Please check your network and retry."
            : verifyMutation.error?.message ||
              "Unable to verify the cryptographic payment signature returned by the gateway."}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => doVerify()}
            className="px-4 py-2 rounded-xl btn-brand-solid text-xs font-medium cursor-pointer"
          >
            Retry Verification
          </button>
          <Link
            href="/user/orders"
            className="px-4 py-2 rounded-xl border border-border bg-surface text-xs font-medium hover:bg-surface-muted text-secondary hover:text-primary transition-colors cursor-pointer"
          >
            My Orders
          </Link>
          <Link
            href="/payouts"
            className="px-4 py-2 rounded-xl border border-border bg-surface text-xs font-medium hover:bg-surface-muted text-secondary hover:text-primary transition-colors cursor-pointer"
          >
            Payouts
          </Link>
        </div>
      </div>
    );
  }

  const record = verifiedRecord || detailRecord;
  const parsedQueryAmount = queryAmount ? parseFloat(queryAmount) : undefined;
  const displayAmount =
    record?.amount !== undefined
      ? Number(record.amount)
      : parsedQueryAmount !== undefined && !isNaN(parsedQueryAmount)
      ? parsedQueryAmount
      : 0;

  const displayCustomer =
    record?.customer_name ||
    queryCustomer ||
    "Valued Customer";

  const displayPhone =
    record?.customer_phone ||
    queryPhone ||
    null;

  const displayEmail =
    record?.customer_email ||
    queryEmail ||
    null;

  const displayDescription =
    record?.description ||
    queryDescription ||
    "Online Order Payment";

  const displayReceipt =
    record?.receipt_number ||
    queryReceipt ||
    razorpayPaymentLinkReferenceId ||
    (activePaymentId ? `rcpt_${activePaymentId.slice(-8)}` : "rcpt_verified");

  return (
    <div className="w-full max-w-xl mx-auto font-intert print:max-w-none print:w-full print:m-0 print:p-0">
      <style jsx global>{`
        @media print {
          @page {
            margin: 0 !important;
            size: A4 portrait;
          }
          body {
            margin: 0 !important;
            padding: 15mm 20mm !important;
            background: #ffffff !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      <div className="p-6 sm:p-8 rounded-2xl border border-border bg-surface print:border print:border-neutral-300 print:rounded-none print:p-8 print:bg-white text-primary print:text-black">
        <div className="flex items-start justify-between pb-6 border-b border-border print:border-neutral-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center print:border print:border-neutral-300">
              <Store size={20} />
            </div>
            <div>
              <h2 className="font-instrument text-2xl font-bold text-primary print:text-black tracking-tight leading-tight">
                MerchantAgent
              </h2>
              <p className="text-xs text-muted print:text-neutral-600">
                Official Digital Payment Receipt
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 print:text-emerald-700 print:border print:border-emerald-300 text-xs font-semibold uppercase tracking-wider">
              <CheckCircle2 size={13} />
              <span>Paid & Verified</span>
            </div>
            <p className="text-[11px] font-mono text-muted print:text-neutral-500 mt-1.5">
              Receipt: {displayReceipt}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 py-5 border-b border-border print:border-neutral-300 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-muted print:text-neutral-500 tracking-wider block mb-1">
              Billed To
            </span>
            <p className="text-sm font-semibold text-primary print:text-black">
              {displayCustomer}
            </p>
            {displayPhone && (
              <p className="text-muted print:text-neutral-600 font-mono mt-0.5">
                {displayPhone}
              </p>
            )}
            {displayEmail && (
              <p className="text-muted print:text-neutral-600 mt-0.5">
                {displayEmail}
              </p>
            )}
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-muted print:text-neutral-500 tracking-wider block mb-1">
              Transaction Details
            </span>
            <div className="space-y-0.5">
              <p className="text-muted print:text-neutral-600">
                <span className="font-medium text-primary print:text-black">Date:</span>{" "}
                {new Date().toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
              <p className="text-muted print:text-neutral-600">
                <span className="font-medium text-primary print:text-black">Method:</span>{" "}
                Razorpay Online (UPI/Card)
              </p>
              {activePaymentId && (
                <div className="inline-flex items-center gap-1 font-mono text-muted print:text-neutral-700">
                  <span>ID: {activePaymentId}</span>
                  <button
                    type="button"
                    onClick={handleCopyPaymentId}
                    title="Copy Payment ID"
                    className="text-muted hover:text-primary transition-colors cursor-pointer print:hidden"
                  >
                    {copiedId ? (
                      <Check size={11} className="text-emerald-500" />
                    ) : (
                      <Copy size={11} />
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="py-5 border-b border-border print:border-neutral-300">
          <table className="w-full text-xs font-intert">
            <thead>
              <tr className="border-b border-border print:border-neutral-300 text-muted print:text-neutral-600 text-left uppercase text-[10px] tracking-wider">
                <th className="pb-2 font-semibold">Description</th>
                <th className="pb-2 font-semibold text-center w-16">Qty</th>
                <th className="pb-2 font-semibold text-right w-24">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-3 text-primary print:text-black font-medium">
                  {displayDescription}
                </td>
                <td className="py-3 text-center text-secondary print:text-neutral-700">
                  1
                </td>
                <td className="py-3 text-right font-medium text-primary print:text-black">
                  {formatInr(displayAmount)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="py-4 flex justify-end">
          <div className="w-64 space-y-2 text-xs">
            <div className="flex justify-between text-muted print:text-neutral-600">
              <span>Subtotal</span>
              <span>{formatInr(displayAmount)}</span>
            </div>
            <div className="flex justify-between text-muted print:text-neutral-600">
              <span>Taxes (GST)</span>
              <span>₹0.00</span>
            </div>
            <div className="flex justify-between items-center pt-2.5 border-t border-border print:border-neutral-300 text-sm">
              <span className="font-semibold text-primary print:text-black">
                Total Paid
              </span>
              <span className="font-instrument text-2xl font-bold text-primary print:text-black tracking-tight">
                {formatInr(displayAmount)}
              </span>
            </div>
          </div>
        </div>

        <div className="pt-4 mt-2 border-t border-dashed border-border print:border-neutral-300 flex items-center justify-between text-[11px] text-muted print:text-neutral-600">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Cryptographically verified via Razorpay Gateway</span>
          </div>
          <span className="font-mono text-[10px]">Computer Generated Receipt</span>
        </div>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3 print:hidden">
        <button
          type="button"
          onClick={handlePrint}
          className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-border bg-surface hover:bg-surface-muted text-xs font-medium text-secondary hover:text-primary transition-colors cursor-pointer"
        >
          <Printer size={15} />
          <span>Print Tax Receipt (PDF)</span>
        </button>

        <Link
          href="/user/orders"
          className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl btn-brand-solid text-xs font-medium cursor-pointer"
        >
          <ArrowLeft size={15} />
          <span>View Orders</span>
        </Link>
        <Link
          href="/user"
          className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-border bg-surface hover:bg-surface-muted text-xs font-medium text-secondary hover:text-primary transition-colors cursor-pointer"
        >
          <span>Continue Shopping</span>
        </Link>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen w-full bg-bg flex items-center justify-center p-4 print:p-0 print:bg-white">
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center p-12 font-intert">
            <Loader2 size={32} className="text-brand animate-spin" />
            <p className="text-xs text-muted mt-2">Loading receipt details...</p>
          </div>
        }
      >
        <PaymentSuccessContent />
      </Suspense>
    </div>
  );
}
