"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  className?: string;
}

export function Select({
  value,
  onChange,
  options,
  placeholder = "Select an option",
  className = "",
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

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between bg-surface border rounded-xl px-4 py-2.5 text-sm font-intert transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
          isOpen ? "border-brand ring-2 ring-brand" : "border-border"
        } ${value ? "text-primary" : "text-muted"}`}
      >
        <span>{value || placeholder}</span>
        <ChevronDown
          size={16}
          className={`text-muted transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 py-1 bg-surface border border-border rounded-xl shadow-lg shadow-black/5 animate-in fade-in slide-in-from-top-2 max-h-60 overflow-y-auto">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-sm font-intert hover:bg-surface-muted transition-colors ${
                value === option
                  ? "text-brand bg-brand/5 font-medium"
                  : "text-primary"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
