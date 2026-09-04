"use client";

import { useState, useRef, useEffect } from "react";
import { Volume2, ChevronDown, Check } from "lucide-react";
import { useVoiceStore, AVAILABLE_VOICES } from "../../../../stores";

export function VoiceSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { selectedVoice, setSelectedVoice } = useVoiceStore();

  const current =
    AVAILABLE_VOICES.find((v) => v.id === selectedVoice) || AVAILABLE_VOICES[0];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        title="Change AI Voice"
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium border border-border bg-surface hover:bg-surface-muted text-secondary hover:text-primary transition-colors cursor-pointer shadow-2xs"
      >
        <Volume2 size={12} className="text-brand shrink-0" />
        <span className="truncate max-w-[90px]">{current?.name || "Voice"}</span>
        <ChevronDown size={11} className="text-muted shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute right-0 bottom-full mb-2 w-56 rounded-2xl border border-border bg-surface p-1.5 shadow-xl z-50">
          <div className="px-2.5 py-1.5 border-b border-border/50 text-[10px] font-semibold text-muted uppercase tracking-wider">
            AI Speech Voice
          </div>
          <div className="space-y-0.5 mt-1">
            {AVAILABLE_VOICES.map((v) => {
              const isSelected = v.id === selectedVoice;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => {
                    setSelectedVoice(v.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-brand/10 text-brand font-medium"
                      : "text-secondary hover:bg-surface-muted hover:text-primary"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{v.label}</p>
                    <p className="text-[10px] text-muted truncate">{v.accent}</p>
                  </div>
                  {isSelected && <Check size={13} className="text-brand shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
