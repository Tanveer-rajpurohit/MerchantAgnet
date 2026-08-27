"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Timer } from "lucide-react";
import { ThinkingOrb } from "thinking-orbs";

export interface AgentStep {
  id: string;
  label: string;
  detail?: string;
  status: "completed" | "in_progress" | "pending";
}

interface AgentThinkingProps {
  durationSeconds?: number;
  isThinking?: boolean;
  thoughtSummary?: string;
  steps?: AgentStep[];
  detailedThought?: string;
  defaultExpanded?: boolean;
}

export function AgentThinking({
  durationSeconds = 4,
  isThinking = false,
  thoughtSummary,
  steps = [],
  detailedThought,
  defaultExpanded = false,
}: AgentThinkingProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="w-full mb-4 font-intert select-none">
      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-primary transition-colors py-0.5 cursor-pointer w-fit"
        >
          {isThinking && (
            <div className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
              <ThinkingOrb state="working" size={20} />
            </div>
          )}

          <span>
            {isThinking ? "Thinking..." : `Thought for ${durationSeconds}s`}
          </span>

          <span className="text-muted/60">
            {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </span>
        </button>

        {thoughtSummary && (
          <div
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 text-xs text-secondary/90 hover:text-primary transition-colors cursor-pointer w-fit py-0.5"
          >
            <Timer size={14} className="text-muted shrink-0" />
            <span className="leading-snug truncate max-w-[480px]">
              {thoughtSummary}
            </span>
          </div>
        )}
      </div>

      {expanded && (
        <div className="mt-3 pl-3.5 ml-1.5 border-l border-border space-y-3 animate-in fade-in duration-200">
          {steps.length > 0 && (
            <div className="space-y-2 pt-1">
              {steps.map((step) => (
                <div key={step.id} className="flex items-start gap-2 text-xs">
                  {step.status === "in_progress" && (
                    <div className="mt-0.5 shrink-0">
                      <div className="w-3 h-3 rounded-full border-2 border-brand border-t-transparent animate-spin" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p
                      className={`leading-tight ${
                        step.status === "completed"
                          ? "text-secondary font-medium"
                          : step.status === "in_progress"
                            ? "text-primary font-semibold"
                            : "text-muted"
                      }`}
                    >
                      {step.label}
                    </p>
                    {step.detail && (
                      <p className="text-[11px] text-muted mt-0.5">
                        {step.detail}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {detailedThought && (
            <div className="pt-1.5 text-xs text-muted leading-relaxed whitespace-pre-line font-mono bg-surface-muted/30 p-3 rounded-xl border border-border-subtle">
              {detailedThought}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
