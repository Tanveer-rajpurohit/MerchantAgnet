"use client";

import { useState } from "react";
import {
  PayoutsHeader,
  AccountOverview,
  PayoutHistoryTable,
  PaymentLinksTable,
  WithdrawModal,
} from "../../components/app/payouts";
import { PaymentLinkModal } from "../../components/app/utils";
import { usePaymentLinks, useSettlements } from "../../../hooks";
import type { PaymentLinkStatus, SettlementStatus } from "../../../types";

const ITEMS_PER_PAGE = 10;

type PayoutsTab = "payouts" | "payment-links";

export default function PayoutsPage() {
  const [activeTab, setActiveTab] = useState<PayoutsTab>("payment-links");
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showPaymentLinkModal, setShowPaymentLinkModal] = useState(false);

  const [payoutSearch, setPayoutSearch] = useState("");
  const [payoutStatusFilter, setPayoutStatusFilter] = useState("All");
  const [payoutDateFilter, setPayoutDateFilter] = useState("");
  const [payoutPage, setPayoutPage] = useState(1);

  const [linkSearch, setLinkSearch] = useState("");
  const [linkStatusFilter, setLinkStatusFilter] = useState("All");
  const [linkDateFilter, setLinkDateFilter] = useState("");
  const [linkPage, setLinkPage] = useState(1);

  const { data: settlementsData, isLoading: isSettlementsLoading } = useSettlements({
    page: payoutPage,
    count: ITEMS_PER_PAGE,
    status:
      payoutStatusFilter !== "All"
        ? (payoutStatusFilter as SettlementStatus)
        : undefined,
  });

  const { data: paymentLinksData, isLoading: isLinksLoading } = usePaymentLinks({
    page: linkPage,
    count: ITEMS_PER_PAGE,
    status:
      linkStatusFilter !== "All"
        ? (linkStatusFilter as PaymentLinkStatus)
        : undefined,
    search: linkSearch || undefined,
  });

  const TABS: { id: PayoutsTab; label: string }[] = [
    { id: "payment-links", label: "Payment Links" },
    { id: "payouts", label: "Bank Settlements" },
  ];

  return (
    <div className="w-full h-full overflow-y-auto font-intert">
      <div className="px-4 sm:px-10 lg:px-16 py-6 sm:py-10">
        <PayoutsHeader
          onCreateLinkClick={() => setShowPaymentLinkModal(true)}
        />

        <AccountOverview
          onWithdrawClick={() => setShowWithdrawModal(true)}
          onCreateLinkClick={() => setShowPaymentLinkModal(true)}
        />

        <div className="flex items-center gap-1 mb-3 border-b border-border">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium font-intert border-b-2 -mb-px transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? "border-brand text-primary font-semibold"
                  : "border-transparent text-muted hover:text-secondary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mb-6 p-3.5 rounded-xl border border-border bg-surface">
          <p className="text-xs font-semibold text-primary">
            {activeTab === "payment-links"
              ? "Customer Payment Links"
              : "Bank Account Settlements"}
          </p>
          <p className="text-[11px] text-muted mt-0.5">
            {activeTab === "payment-links"
              ? "Generate online payment links for orders and share via WhatsApp or SMS. Real-time collection status and digital receipts."
              : "Automated payouts transferred directly by Razorpay into your registered bank account with UTR tracking and fee deductions."}
          </p>
        </div>

        {activeTab === "payouts" ? (
          <PayoutHistoryTable
            records={settlementsData?.items || []}
            totalRecordsCount={settlementsData?.total_count || 0}
            totalPages={settlementsData?.total_pages || 1}
            search={payoutSearch}
            onSearchChange={(v) => {
              setPayoutSearch(v);
              setPayoutPage(1);
            }}
            statusFilter={payoutStatusFilter}
            onStatusFilterChange={(v) => {
              setPayoutStatusFilter(v);
              setPayoutPage(1);
            }}
            dateFilter={payoutDateFilter}
            onDateChange={(v) => {
              setPayoutDateFilter(v);
              setPayoutPage(1);
            }}
            currentPage={payoutPage}
            onPageChange={setPayoutPage}
            itemsPerPage={ITEMS_PER_PAGE}
            isLoading={isSettlementsLoading}
          />
        ) : (
          <PaymentLinksTable
            records={paymentLinksData?.items || []}
            totalRecordsCount={paymentLinksData?.total_count || 0}
            totalPages={paymentLinksData?.total_pages || 1}
            currentPage={linkPage}
            onPageChange={setLinkPage}
            itemsPerPage={ITEMS_PER_PAGE}
            search={linkSearch}
            onSearchChange={(v) => {
              setLinkSearch(v);
              setLinkPage(1);
            }}
            statusFilter={linkStatusFilter}
            onStatusFilterChange={(v) => {
              setLinkStatusFilter(v);
              setLinkPage(1);
            }}
            dateFilter={linkDateFilter}
            onDateFilterChange={(v) => {
              setLinkDateFilter(v);
              setLinkPage(1);
            }}
            onCreateLinkClick={() => setShowPaymentLinkModal(true)}
            isLoading={isLinksLoading}
          />
        )}
      </div>

      <WithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
      />

      <PaymentLinkModal
        isOpen={showPaymentLinkModal}
        onClose={() => setShowPaymentLinkModal(false)}
      />
    </div>
  );
}
