"use client";

import { useState, useMemo } from "react";
import {
  PayoutsHeader,
  AccountOverview,
  PayoutHistoryTable,
  WithdrawModal,
  PayoutRecord,
} from "../../components/app/payouts";

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

const ITEMS_PER_PAGE = 10;

export default function PayoutsPage() {
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFilter, setDateFilter] = useState("");

  const filteredRecords = useMemo(() => {
    if (!dateFilter) return ALL_RECORDS;
    return ALL_RECORDS.filter((r) => r.date === dateFilter);
  }, [dateFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRecords.length / ITEMS_PER_PAGE),
  );
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * ITEMS_PER_PAGE;
  const pageRecords = filteredRecords.slice(
    startIdx,
    startIdx + ITEMS_PER_PAGE,
  );

  const handleDateChange = (val: string) => {
    setDateFilter(val);
    setCurrentPage(1);
  };

  return (
    <div className="w-full h-full overflow-y-auto font-intert">
      <div className="px-6 sm:px-10 lg:px-16 py-8 sm:py-10">
        <PayoutsHeader />

        <AccountOverview onWithdrawClick={() => setShowWithdrawModal(true)} />

        <PayoutHistoryTable
          records={pageRecords}
          totalRecordsCount={filteredRecords.length}
          dateFilter={dateFilter}
          onDateChange={handleDateChange}
          currentPage={safePage}
          onPageChange={setCurrentPage}
          itemsPerPage={ITEMS_PER_PAGE}
        />
      </div>

      <WithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
      />
    </div>
  );
}
