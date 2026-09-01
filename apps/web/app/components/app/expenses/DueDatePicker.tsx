"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar } from "lucide-react";

interface DueDatePickerProps {
  value: string;
  onChange: (value: string) => void;
}

function getDaySuffix(day: number): string {
  if (day === 1 || day === 21 || day === 31) return "st";
  if (day === 2 || day === 22) return "nd";
  if (day === 3 || day === 23) return "rd";
  return "th";
}

export function formatDayOfMonth(day: number): string {
  return `${day}${getDaySuffix(day)} of month`;
}

export function parseDayOfMonth(value: string): number {
  const match = value.match(/^(\d+)/);
  if (match) {
    const num = Number(match[1]);
    if (num >= 1 && num <= 31) return num;
  }
  return 1;
}

export function DueDatePicker({ value, onChange }: DueDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedDay = parseDayOfMonth(value || "1st of month");

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectDay = (day: number) => {
    onChange(formatDayOfMonth(day));
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full font-intert">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg border border-border bg-bg text-primary focus:outline-none focus:border-brand/50 cursor-pointer text-left shadow-xs"
      >
        <span className="flex items-center gap-2">
          <Calendar size={14} className="text-muted" />
          <span>{value || "1st of month"}</span>
        </span>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 z-50 p-3 rounded-2xl border border-border bg-surface shadow-xl w-64 animate-in fade-in zoom-in-95 duration-100">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-xs font-semibold text-primary">
              Day of Every Month
            </span>
            <span className="text-[11px] text-muted">1 - 31</span>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
              const isSelected = selectedDay === day;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={`h-7 w-7 rounded-lg text-xs font-medium transition-colors flex items-center justify-center cursor-pointer ${
                    isSelected
                      ? "bg-brand text-white font-semibold shadow-xs"
                      : "hover:bg-surface-muted text-secondary hover:text-primary"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-3 gap-1.5 pt-2.5 mt-2.5 border-t border-border">
            {[1, 5, 15].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => handleSelectDay(d)}
                className="py-1 text-[10px] rounded-md border border-border bg-bg hover:bg-surface-muted text-muted hover:text-primary transition-colors cursor-pointer text-center"
              >
                {d}{getDaySuffix(d)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
