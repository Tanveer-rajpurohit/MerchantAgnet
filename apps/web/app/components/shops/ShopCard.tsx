"use client";

import { Store, MapPin, ShieldCheck, ArrowRight } from "lucide-react";
import { AgentOrb } from "../app/utils";
import type { ShopListItem } from "../../../types/shop";

interface ShopCardProps {
  shop: ShopListItem;
  onSelect: (shop: ShopListItem) => void;
}

export function ShopCard({ shop, onSelect }: ShopCardProps) {
  const locationLabel = shop.address ? `${shop.address.line1}, ${shop.address.city}` : shop.city || "India";

  return (
    <div className="p-5 rounded-2xl border border-border bg-surface hover:border-brand/40 transition-all flex flex-col justify-between shadow-xs group">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand/10 text-brand flex items-center justify-center font-semibold text-sm shrink-0">
              <Store size={18} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-primary group-hover:text-brand transition-colors line-clamp-1">
                {shop.business_name}
              </h3>
              <p className="text-[11px] text-muted font-medium">
                {shop.business_type}
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-medium border border-emerald-500/20 shrink-0">
            <ShieldCheck size={11} />
            <span>Verified</span>
          </span>
        </div>

        <p className="text-xs text-muted flex items-center gap-1.5 mb-3">
          <MapPin size={13} className="shrink-0 text-muted" />
          <span className="truncate">{locationLabel}</span>
        </p>

        {shop.popular_products && shop.popular_products.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {shop.popular_products.map((item) => (
              <span
                key={item}
                className="px-2 py-0.5 rounded-lg bg-bg border border-border text-[10px] text-muted"
              >
                {item}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border mt-auto">
        <span className="text-[11px] text-muted flex items-center gap-1">
          <MapPin size={11} className="text-muted" />
          <span>{shop.area || shop.city || "Local"}</span>
        </span>

        <button
          type="button"
          onClick={() => onSelect(shop)}
          className="px-4 py-2 rounded-xl btn-brand-solid text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <AgentOrb size={13} className="text-white not-italic" />
          <span>Chat & Order</span>
          <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
}
