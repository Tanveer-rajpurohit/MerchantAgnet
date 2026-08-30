"use client";

import Link from "next/link";
import { Globe, ArrowRight } from "lucide-react";
import { useProfile } from "../../../../hooks";

export function StoreProfileSection() {
  const { profile } = useProfile();

  const businessName =
    profile?.merchant_profile?.business_name ||
    profile?.full_name ||
    "Sharma Store";
  const category =
    profile?.merchant_profile?.business_type || "Kirana / Grocery";
  const location = profile?.address?.city
    ? `${profile.address.city}, ${profile.address.state || "India"}`
    : "Mumbai, Maharashtra";
  const language =
    profile?.merchant_profile?.preferred_language || "English / Hindi";

  const profileFields = [
    { label: "Business Name", value: businessName },
    { label: "Category", value: category },
    { label: "Location", value: location },
  ];

  return (
    <section className="rounded-2xl border border-border bg-surface p-6 font-intert">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-base font-medium text-primary">Store Profile</h2>
          <p className="text-xs text-muted mt-0.5">
            Business details and merchant credentials.
          </p>
        </div>

        <Link
          href="/profile"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-bg hover:bg-surface-muted text-xs font-medium text-secondary hover:text-primary transition-colors"
        >
          <span>Edit Profile</span>
          <ArrowRight size={12} />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {profileFields.map((field) => (
          <div
            key={field.label}
            className="p-3.5 rounded-xl border border-border bg-bg"
          >
            <span className="text-[11px] text-muted">{field.label}</span>
            <p className="text-sm font-medium text-primary mt-0.5">
              {field.value}
            </p>
          </div>
        ))}

        <div className="p-3.5 rounded-xl border border-border bg-bg">
          <span className="text-[11px] text-muted">Agent Language</span>
          <p className="text-sm font-medium text-primary mt-0.5 flex items-center gap-1.5">
            <Globe size={13} className="text-muted" />
            {language}
          </p>
        </div>
      </div>
    </section>
  );
}
