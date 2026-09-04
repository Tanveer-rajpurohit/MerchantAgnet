"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: (string | SelectOption)[];
  placeholder?: string;
  className?: string;
  size?: "sm" | "md";
}

export function Select({
  value,
  onChange,
  options,
  placeholder = "Select an option",
  className = "",
  size = "md",
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const normalizedOptions: SelectOption[] = options.map((opt) =>
    typeof opt === "string" ? { label: opt, value: opt } : opt
  );

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : value || placeholder;

  const isSmall = size === "sm";

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between bg-surface border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
          isSmall
            ? "px-3 py-1.5 text-xs rounded-lg gap-2"
            : "px-4 py-2.5 text-sm rounded-xl gap-3"
        } ${
          isOpen ? "border-brand ring-2 ring-brand" : "border-border"
        } ${value ? "text-primary" : "text-muted"}`}
      >
        <span className="truncate">{displayLabel}</span>
        <ChevronDown
          size={isSmall ? 13 : 16}
          className={`text-muted shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute z-50 w-full mt-1.5 bg-surface border border-border shadow-lg shadow-black/5 animate-in fade-in slide-in-from-top-1 overflow-y-auto ${
            isSmall
              ? "p-1 rounded-lg max-h-48 text-xs"
              : "p-1.5 rounded-xl max-h-60 text-sm"
          }`}
        >
          {normalizedOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full text-left transition-colors truncate ${
                isSmall
                  ? "px-2.5 py-1.5 text-xs rounded-md"
                  : "px-3 py-2 text-sm rounded-lg"
              } ${
                value === option.value
                  ? "text-brand bg-brand/5 font-medium"
                  : "text-primary hover:bg-surface-muted"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
