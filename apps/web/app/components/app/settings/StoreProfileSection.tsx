import Link from "next/link";
import { Globe, ArrowRight } from "lucide-react";

const PROFILE_FIELDS = [
  { label: "Business Name", value: "Sharma Store" },
  { label: "Category", value: "Kirana / Grocery" },
  { label: "Location", value: "Mumbai, Maharashtra" },
];

export function StoreProfileSection() {
  return (
    <section className="rounded-2xl border border-border bg-surface p-6">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-base font-medium font-intert text-primary">
            Store Profile
          </h2>
          <p className="text-xs text-muted font-intert mt-0.5">
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
        {PROFILE_FIELDS.map((field) => (
          <div
            key={field.label}
            className="p-3.5 rounded-xl border border-border bg-bg"
          >
            <span className="text-[11px] text-muted font-intert">
              {field.label}
            </span>
            <p className="text-sm font-medium font-intert text-primary mt-0.5">
              {field.value}
            </p>
          </div>
        ))}

        <div className="p-3.5 rounded-xl border border-border bg-bg">
          <span className="text-[11px] text-muted font-intert">
            Agent Language
          </span>
          <p className="text-sm font-medium font-intert text-primary mt-0.5 flex items-center gap-1.5">
            <Globe size={13} className="text-muted" />
            English / Hindi
          </p>
        </div>
      </div>
    </section>
  );
}
