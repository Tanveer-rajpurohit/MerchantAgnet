"use client";

import { useState, useMemo } from "react";
import {
  PayoutsHeader,
  AccountOverview,
  PayoutHistoryTable,
  PaymentLinksTable,
  WithdrawModal,
} from "../../components/app/payouts";
import { PaymentLinkModal } from "../../components/app/utils";
import type { PayoutRecord, PaymentLinkRecord } from "../../types/payout/types";

const ALL_RECORDS: PayoutRecord[] = [
  {
    id: "p-01",
    description: "Payment from Rahul Sharma",
    amount: "₹500.00",
    method: "UPI",
    date: "2026-08-27",
    status: "Settled",
  },
  {
    id: "p-02",
    description: "Payment from Priya Mehta",
    amount: "₹1,200.00",
    method: "Card",
    date: "2026-08-27",
    status: "Pending",
  },
  {
    id: "p-03",
    description: "Payment from Ankit Verma",
    amount: "₹750.00",
    method: "UPI",
    date: "2026-08-26",
    status: "Settled",
  },
  {
    id: "p-04",
    description: "Payout to HDFC Bank",
    amount: "₹8,250.00",
    method: "NEFT",
    date: "2026-08-26",
    status: "Settled",
  },
  {
    id: "p-05",
    description: "Payment from Sunita Rao",
    amount: "₹350.00",
    method: "UPI",
    date: "2026-08-26",
    status: "Settled",
  },
  {
    id: "p-06",
    description: "Payment from Vikram Patel",
    amount: "₹2,100.00",
    method: "Card",
    date: "2026-08-25",
    status: "Settled",
  },
  {
    id: "p-07",
    description: "Payment from Neha Gupta",
    amount: "₹480.00",
    method: "UPI",
    date: "2026-08-25",
    status: "Settled",
  },
  {
    id: "p-08",
    description: "Payout to HDFC Bank",
    amount: "₹3,600.00",
    method: "NEFT",
    date: "2026-08-24",
    status: "Settled",
  },
  {
    id: "p-09",
    description: "Payment from Ramesh Kumar",
    amount: "₹1,750.00",
    method: "Net Banking",
    date: "2026-08-24",
    status: "Settled",
  },
  {
    id: "p-10",
    description: "Payment from Pooja Singh",
    amount: "₹620.00",
    method: "UPI",
    date: "2026-08-24",
    status: "Settled",
  },
  {
    id: "p-11",
    description: "Payment from Amit Joshi",
    amount: "₹3,450.00",
    method: "Card",
    date: "2026-08-23",
    status: "Settled",
  },
  {
    id: "p-12",
    description: "Payout to HDFC Bank",
    amount: "₹5,120.00",
    method: "NEFT",
    date: "2026-08-22",
    status: "Settled",
  },
  {
    id: "p-13",
    description: "Payment from Deepak Yadav",
    amount: "₹890.00",
    method: "UPI",
    date: "2026-08-22",
    status: "Settled",
  },
  {
    id: "p-14",
    description: "Payment from Kavita Nair",
    amount: "₹1,450.00",
    method: "Card",
    date: "2026-08-21",
    status: "Settled",
  },
  {
    id: "p-15",
    description: "Payment from Suresh Reddy",
    amount: "₹2,750.50",
    method: "Net Banking",
    date: "2026-08-20",
    status: "Settled",
  },
  {
    id: "p-16",
    description: "Payout to HDFC Bank",
    amount: "₹4,200.00",
    method: "NEFT",
    date: "2026-08-20",
    status: "Settled",
  },
  {
    id: "p-17",
    description: "Payment from Meena Iyer",
    amount: "₹975.00",
    method: "UPI",
    date: "2026-08-19",
    status: "Settled",
  },
  {
    id: "p-18",
    description: "Payment from Ravi Tiwari",
    amount: "₹1,890.25",
    method: "Card",
    date: "2026-08-18",
    status: "Settled",
  },
  {
    id: "p-19",
    description: "Payment from Geeta Desai",
    amount: "₹560.00",
    method: "UPI",
    date: "2026-08-17",
    status: "Settled",
  },
  {
    id: "p-20",
    description: "Payout to HDFC Bank",
    amount: "₹6,300.00",
    method: "NEFT",
    date: "2026-08-16",
    status: "Settled",
  },
  {
    id: "p-21",
    description: "Payment from Arun Pillai",
    amount: "₹1,320.00",
    method: "Net Banking",
    date: "2026-08-15",
    status: "Settled",
  },
  {
    id: "p-22",
    description: "Payment from Sita Devi",
    amount: "₹430.00",
    method: "UPI",
    date: "2026-08-14",
    status: "Settled",
  },
  {
    id: "p-23",
    description: "Payment from Mohan Das",
    amount: "₹2,800.00",
    method: "Card",
    date: "2026-08-13",
    status: "Settled",
  },
];

const PAYMENT_LINK_RECORDS: PaymentLinkRecord[] = [
  {
    id: "pl-01",
    customerName: "Rahul Sharma",
    description: "Kirana staples and daily provisions",
    amount: "₹500.00",
    status: "Paid",
    date: "2026-08-27",
    linkUrl: "https://rzp.io/l/test-rahul500",
  },
  {
    id: "pl-02",
    customerName: "Priya Mehta",
    description: "Monthly grocery order",
    amount: "₹1,200.00",
    status: "Pending",
    date: "2026-08-27",
    linkUrl: "https://rzp.io/l/test-priya1200",
  },
  {
    id: "pl-03",
    customerName: "Ankit Verma",
    description: "Diwali festival offer",
    amount: "₹750.00",
    status: "Paid",
    date: "2026-08-26",
    linkUrl: "https://rzp.io/l/test-ankit750",
  },
  {
    id: "pl-04",
    customerName: "Sunita Rao",
    description: "Dairy & essentials",
    amount: "₹350.00",
    status: "Paid",
    date: "2026-08-26",
    linkUrl: "https://rzp.io/l/test-sunita350",
  },
  {
    id: "pl-05",
    customerName: "Vikram Patel",
    description: "Bulk order - staff canteen",
    amount: "₹2,100.00",
    status: "Expired",
    date: "2026-08-20",
    linkUrl: "https://rzp.io/l/test-vikram2100",
  },
  {
    id: "pl-06",
    customerName: "Neha Gupta",
    description: "Weekly vegetable basket",
    amount: "₹280.00",
    status: "Paid",
    date: "2026-08-25",
    linkUrl: "https://rzp.io/l/test-neha280",
  },
  {
    id: "pl-07",
    customerName: "Ramesh Kumar",
    description: "Cooking oil & pulses",
    amount: "₹640.00",
    status: "Pending",
    date: "2026-08-24",
    linkUrl: "https://rzp.io/l/test-ramesh640",
  },
  {
    id: "pl-08",
    customerName: "Pooja Singh",
    description: "Baby care essentials",
    amount: "₹910.00",
    status: "Paid",
    date: "2026-08-23",
    linkUrl: "https://rzp.io/l/test-pooja910",
  },
  {
    id: "pl-09",
    customerName: "Amit Joshi",
    description: "Diwali festival offer",
    amount: "₹450.00",
    status: "Paid",
    date: "2026-08-23",
    linkUrl: "https://rzp.io/l/test-amit450",
  },
  {
    id: "pl-10",
    customerName: "Deepak Yadav",
    description: "Monthly grocery order",
    amount: "₹1,050.00",
    status: "Expired",
    date: "2026-08-19",
    linkUrl: "https://rzp.io/l/test-deepak1050",
  },
  {
    id: "pl-11",
    customerName: "Kavita Nair",
    description: "Snacks and beverages",
    amount: "₹320.00",
    status: "Paid",
    date: "2026-08-22",
    linkUrl: "https://rzp.io/l/test-kavita320",
  },
  {
    id: "pl-12",
    customerName: "Suresh Reddy",
    description: "Bulk order - office pantry",
    amount: "₹1,780.00",
    status: "Pending",
    date: "2026-08-21",
    linkUrl: "https://rzp.io/l/test-suresh1780",
  },
  {
    id: "pl-13",
    customerName: "Rahul Sharma",
    description: "Follow-up dairy order",
    amount: "₹190.00",
    status: "Paid",
    date: "2026-08-18",
    linkUrl: "https://rzp.io/l/test-rahul190",
  },
  {
    id: "pl-14",
    customerName: "Priya Mehta",
    description: "Festival gifting hamper",
    amount: "₹1,500.00",
    status: "Paid",
    date: "2026-08-17",
    linkUrl: "https://rzp.io/l/test-priya1500",
  },
  {
    id: "pl-15",
    customerName: "Ankit Verma",
    description: "Stationery restock",
    amount: "₹210.00",
    status: "Expired",
    date: "2026-08-16",
    linkUrl: "https://rzp.io/l/test-ankit210",
  },
];

const ITEMS_PER_PAGE = 10;

type PayoutsTab = "payouts" | "payment-links";

export default function PayoutsPage() {
  const [activeTab, setActiveTab] = useState<PayoutsTab>("payouts");
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

  const filteredRecords = useMemo(() => {
    return ALL_RECORDS.filter((r) => {
      const matchesSearch = r.description
        .toLowerCase()
        .includes(payoutSearch.toLowerCase());
      const matchesStatus =
        payoutStatusFilter === "All" || r.status === payoutStatusFilter;
      const matchesDate = !payoutDateFilter || r.date === payoutDateFilter;
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [payoutSearch, payoutStatusFilter, payoutDateFilter]);

  const payoutTotalPages = Math.max(
    1,
    Math.ceil(filteredRecords.length / ITEMS_PER_PAGE),
  );
  const safePayoutPage = Math.min(payoutPage, payoutTotalPages);
  const payoutStartIdx = (safePayoutPage - 1) * ITEMS_PER_PAGE;
  const pagePayoutRecords = filteredRecords.slice(
    payoutStartIdx,
    payoutStartIdx + ITEMS_PER_PAGE,
  );

  const filteredLinkRecords = useMemo(() => {
    return PAYMENT_LINK_RECORDS.filter((r) => {
      const matchesSearch = r.customerName
        .toLowerCase()
        .includes(linkSearch.toLowerCase());
      const matchesStatus =
        linkStatusFilter === "All" || r.status === linkStatusFilter;
      const matchesDate = !linkDateFilter || r.date === linkDateFilter;
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [linkSearch, linkStatusFilter, linkDateFilter]);

  const linkTotalPages = Math.max(
    1,
    Math.ceil(filteredLinkRecords.length / ITEMS_PER_PAGE),
  );
  const safeLinkPage = Math.min(linkPage, linkTotalPages);
  const linkStartIdx = (safeLinkPage - 1) * ITEMS_PER_PAGE;
  const pageLinkRecords = filteredLinkRecords.slice(
    linkStartIdx,
    linkStartIdx + ITEMS_PER_PAGE,
  );

  const TABS: { id: PayoutsTab; label: string }[] = [
    { id: "payouts", label: "Payouts" },
    { id: "payment-links", label: "Payment Links" },
  ];

  return (
    <div className="w-full h-full overflow-y-auto font-intert">
      <div className="px-4 sm:px-10 lg:px-16 py-6 sm:py-10">
        <PayoutsHeader
          onCreateLinkClick={() => setShowPaymentLinkModal(true)}
        />

        <AccountOverview onWithdrawClick={() => setShowWithdrawModal(true)} />

        <div className="flex items-center gap-1 mb-5 border-b border-border">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium font-intert border-b-2 -mb-px transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-brand text-primary"
                  : "border-transparent text-muted hover:text-secondary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "payouts" ? (
          <PayoutHistoryTable
            records={pagePayoutRecords}
            totalRecordsCount={filteredRecords.length}
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
            currentPage={safePayoutPage}
            onPageChange={setPayoutPage}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        ) : (
          <PaymentLinksTable
            records={pageLinkRecords}
            totalRecordsCount={filteredLinkRecords.length}
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
            currentPage={safeLinkPage}
            onPageChange={setLinkPage}
            itemsPerPage={ITEMS_PER_PAGE}
            onCreateLinkClick={() => setShowPaymentLinkModal(true)}
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
