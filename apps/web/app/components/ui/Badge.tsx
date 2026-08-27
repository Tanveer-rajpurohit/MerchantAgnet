"use client";

import type React from "react";

interface BadgeProps {
  icon: React.ReactNode;
  text: string;
}

export default function Badge({ icon, text }: BadgeProps) {
  return (
    <div
      className="px-3.5 py-1.5 bg-surface overflow-hidden rounded-full flex justify-start items-center gap-2 border border-border"
      style={{
        boxShadow:
          "0px 0px 0px 4px var(--brand-subtle), 0px 1px 2px rgba(0, 0, 0, 0.04)",
      }}
    >
      <div className="w-3.5 h-3.5 relative overflow-hidden flex items-center justify-center text-primary">
        {icon}
      </div>
      <div className="text-center flex justify-center flex-col text-primary text-xs font-medium font-intert">
        {text}
      </div>
    </div>
  );
}
