"use client";

import type React from "react";

interface BadgeProps {
  icon: React.ReactNode;
  text: string;
}

export default function Badge({ icon, text }: BadgeProps) {
  return (
    <div className="px-3.5 py-1.5 bg-surface shadow-[0px_0px_0px_4px_var(--brand-subtle)] overflow-hidden rounded-full flex justify-start items-center gap-2 border border-border shadow-xs">
      <div className="w-3.5 h-3.5 relative overflow-hidden flex items-center justify-center text-primary">
        {icon}
      </div>
      <div className="text-center flex justify-center flex-col text-primary text-xs font-medium font-intert">
        {text}
      </div>
    </div>
  );
}
