"use client";

import { Store, Tag, MapPin, FileText } from "lucide-react";

export interface StoreDetailsData {
  storeName?: string;
  category?: string;
  address?: string;
  cityState?: string;
  gstin?: string;
}

interface StoreDetailsSectionProps {
  data?: StoreDetailsData;
}

const CATEGORIES = [
  "Kirana / Grocery",
  "Dairy & Daily Provisions",
  "Supermarket / FMCG",
  "Fresh Fruits & Vegetables",
  "Pharmacy / Medical Store",
  "General Retail",
];

export function StoreDetailsSection({ data }: StoreDetailsSectionProps) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6 font-intert">
      <div className="mb-4 pb-3 border-b border-border">
        <h3 className="text-sm sm:text-base font-semibold text-primary">
          Store & Business Profile
        </h3>
        <p className="text-xs text-muted mt-0.5">
          Store identity and location details displayed on digital receipts and
          invoices.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-primary block mb-1.5 flex items-center gap-1.5">
            <Store size={13} className="text-muted" />
            <span>Store / Business Name</span>
          </label>
          <input
            name="storeName"
            type="text"
            defaultValue={data?.storeName || ""}
            key={data?.storeName || ""}
            placeholder="Sharma Store"
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-border bg-bg text-primary focus:outline-none focus:border-brand/50 transition-colors"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-primary block mb-1.5 flex items-center gap-1.5">
            <Tag size={13} className="text-muted" />
            <span>Business Category</span>
          </label>
          <select
            name="category"
            defaultValue={data?.category || CATEGORIES[0]}
            key={data?.category || CATEGORIES[0]}
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-border bg-bg text-primary focus:outline-none focus:border-brand/50 transition-colors cursor-pointer"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-primary block mb-1.5 flex items-center gap-1.5">
            <MapPin size={13} className="text-muted" />
            <span>Shop Address / Street Landmark</span>
          </label>
          <input
            name="address"
            type="text"
            defaultValue={data?.address || ""}
            key={data?.address || ""}
            placeholder="Shop #4, Link Road, Andheri West"
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-border bg-bg text-primary focus:outline-none focus:border-brand/50 transition-colors"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-primary block mb-1.5 flex items-center gap-1.5">
            <MapPin size={13} className="text-muted" />
            <span>City & State</span>
          </label>
          <input
            name="cityState"
            type="text"
            defaultValue={data?.cityState || ""}
            key={data?.cityState || ""}
            placeholder="Mumbai, Maharashtra 400053"
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-border bg-bg text-primary focus:outline-none focus:border-brand/50 transition-colors"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-primary block mb-1.5 flex items-center gap-1.5">
            <FileText size={13} className="text-muted" />
            <span>GSTIN / Shop License (Optional)</span>
          </label>
          <input
            name="gstin"
            type="text"
            defaultValue={data?.gstin || ""}
            key={data?.gstin || ""}
            placeholder="27AAAAA0000A1Z5"
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-border bg-bg text-primary focus:outline-none focus:border-brand/50 transition-colors uppercase font-mono"
          />
        </div>
      </div>
    </section>
  );
}
