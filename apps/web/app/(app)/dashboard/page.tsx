"use client";

import { useState } from "react";
import {
  StatCards,
  QuickActions,
  RecentActivity,
  LowStock,
} from "../../components/app/dashboard";
import { PaymentLinkModal } from "../../components/app/utils";

export default function DashboardPage() {
  const [showPaymentLinkModal, setShowPaymentLinkModal] = useState(false);

  return (
    <div className="w-full h-full overflow-y-auto font-intert">
      <div className="px-6 sm:px-10 lg:px-16 py-8 sm:py-10">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-instrument text-primary tracking-tight">
            Good to see you, Sharma Store
          </h1>
          <p className="text-sm text-muted font-intert mt-1">
            Here&apos;s what&apos;s happening across your store today.
          </p>
        </div>

        <StatCards />

        <QuickActions
          onGeneratePaymentLink={() => setShowPaymentLinkModal(true)}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <RecentActivity />
          <LowStock />
        </div>
      </div>

      <PaymentLinkModal
        isOpen={showPaymentLinkModal}
        onClose={() => setShowPaymentLinkModal(false)}
      />
    </div>
  );
}
