"use client";

import React, { useState } from "react";
import { Copy, Check, MessageSquareText, Lightbulb, Info, FileText } from "lucide-react";

interface MessageSnippetCardProps {
  children: React.ReactNode;
}

function extractSnippetText(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(extractSnippetText).join("");
  }
  if (node && typeof node === "object" && "props" in node) {
    return extractSnippetText((node as { props?: { children?: React.ReactNode } }).props?.children);
  }
  return "";
}

export function MessageSnippetCard({ children }: MessageSnippetCardProps) {
  const [copied, setCopied] = useState(false);

  const raw = extractSnippetText(children).trim();
  const isTip = /^Tip:?/i.test(raw);
  const isNote = /^Note:?/i.test(raw);
  const isMessage = /^(?:Hi|Hello|Dear|Hey|To|Subject:|Please deliver)/i.test(raw);

  let label = "Draft Message";
  let Icon = MessageSquareText;
  let iconColor = "text-brand/70";

  if (isTip) {
    label = "Pro Tip";
    Icon = Lightbulb;
    iconColor = "text-amber-500";
  } else if (isNote) {
    label = "Note";
    Icon = Info;
    iconColor = "text-blue-500";
  } else if (!isMessage && raw.length < 120 && !raw.includes("\n")) {
    label = "Quick Tip";
    Icon = FileText;
    iconColor = "text-muted";
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(raw);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-4 overflow-hidden rounded-2xl border border-border/80 bg-brand/[0.035] p-4 sm:p-5 shadow-xs transition-colors">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Icon size={14} className={iconColor} />
          <span className="text-[11px] font-semibold text-muted uppercase tracking-wider font-intert">
            {label}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          title="Copy message draft"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-secondary hover:text-primary hover:bg-surface border border-border/60 transition-colors cursor-pointer bg-surface/50"
        >
          {copied ? (
            <>
              <Check size={12} className="text-emerald-500" />
              <span className="text-emerald-500">Copied</span>
            </>
          ) : (
            <>
              <Copy size={12} className="text-muted" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="text-primary/90 text-[13.5px] leading-normal font-intert [&>p]:my-1 [&>p:first-child]:mt-0 [&>p:last-child]:mb-0 [&_p]:leading-normal">
        {children}
      </div>
    </div>
  );
}
