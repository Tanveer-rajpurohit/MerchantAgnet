"use client";

import { Check } from "lucide-react";

interface CheckboxProps {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
}

export function Checkbox({
  id,
  checked,
  onChange,
  label,
  className = "",
}: CheckboxProps) {
  return (
    <label
      htmlFor={id}
      onClick={(e) => {
        e.preventDefault();
        onChange(!checked);
      }}
      className={`h-5 inline-flex items-center gap-2.5 cursor-pointer select-none font-intert ${className}`}
    >
      <div
        id={id}
        role="checkbox"
        aria-checked={checked}
        className={`w-4 h-4 min-w-4 min-h-4 shrink-0 rounded-[4px] border box-border flex items-center justify-center transition-colors duration-100 ${
          checked
            ? "bg-brand border-brand text-white"
            : "bg-surface border-border hover:border-brand/40"
        }`}
      >
        <Check
          size={10}
          strokeWidth={3}
          className={`shrink-0 text-white transition-opacity duration-100 ${
            checked ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>
      {label && (
        <span className="text-xs font-medium text-primary leading-none">
          {label}
        </span>
      )}
    </label>
  );
}
