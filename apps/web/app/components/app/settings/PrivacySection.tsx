"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function PrivacySection() {
  const [showPhone, setShowPhone] = useState(true);

  return (
    <section className="rounded-2xl border border-border bg-surface p-6">
      <div className="mb-5">
        <h2 className="text-base font-medium font-intert text-primary">
          Privacy
        </h2>
        <p className="text-xs text-muted font-intert mt-0.5">
          Control what customers can see about your business.
        </p>
      </div>

      <div className="p-4 rounded-xl border border-border bg-bg flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-surface-muted flex items-center justify-center">
            {showPhone ? (
              <Eye size={15} className="text-secondary" />
            ) : (
              <EyeOff size={15} className="text-muted" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium font-intert text-primary">
              Show Mobile Number
            </p>
            <p className="text-xs text-muted font-intert mt-0.5">
              Allow customers to see your phone number in chat.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowPhone(!showPhone)}
          className={`relative w-10 h-[22px] rounded-full transition-colors shrink-0 cursor-pointer ${
            showPhone ? "bg-brand" : "bg-surface-muted border border-border"
          }`}
        >
          <span
            className={`absolute top-0.5 w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-transform ${
              showPhone ? "left-[21px]" : "left-0.5"
            }`}
          />
        </button>
      </div>
    </section>
  );
}
