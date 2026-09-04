"use client";

import { ArrowLeft, MapPin, ShieldCheck } from "lucide-react";
import type { StoreItem } from "../../../types";

interface StoreChatHeaderProps {
  store: StoreItem;
  onBack: () => void;
}

export function StoreChatHeader({ store, onBack }: StoreChatHeaderProps) {
  return (
    <header className="h-14 shrink-0 px-4 sm:px-6 border-b border-border bg-surface flex items-center justify-between font-intert">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-bg hover:bg-surface-muted text-muted hover:text-primary transition-colors cursor-pointer shrink-0"
          title="Back to Stores"
        >
          <ArrowLeft size={14} />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-primary truncate">
              {store.name}
            </h2>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-medium border border-emerald-500/20 shrink-0">
              <ShieldCheck size={10} />
              <span>Verified</span>
            </span>
          </div>
          <p className="text-[11px] text-muted flex items-center gap-1 truncate">
            <MapPin size={10} className="shrink-0" />
            <span className="truncate">{store.area}</span>
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onBack}
        className="px-3 py-1.5 rounded-xl border border-border bg-bg hover:bg-surface-muted text-xs font-medium text-secondary hover:text-primary transition-colors cursor-pointer shrink-0 ml-2"
      >
        Change Store
      </button>
    </header>
  );
}
