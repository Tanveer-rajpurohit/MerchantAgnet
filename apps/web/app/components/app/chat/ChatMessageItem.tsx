"use client";

import React, { useState } from "react";
import { Copy, Check, ArrowRight } from "lucide-react";
import { ThinkingOrb } from "thinking-orbs";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AgentThinking, AgentStep } from "./AgentThinking";
import { PaymentLinkCard } from "./PaymentLinkCard";
import { CatalogStockCard, StockItem } from "./CatalogStockCard";
import { CampaignGateCard } from "./CampaignGateCard";
import { RevenueSummaryCard, RevenueMetric } from "./RevenueSummaryCard";
import { MessageSnippetCard } from "./MessageSnippetCard";
import { RateLimitCard } from "./RateLimitCard";
import { normalizeMessageContent } from "./messageNormalizer";

export interface ChatMessageData {
  id: string;
  role: "user" | "assistant";
  content: string;
  thinking?: {
    durationSeconds: number;
    summary?: string;
    steps?: AgentStep[];
    detailedThought?: string;
  };
  paymentLink?: {
    customerName: string;
    customerPhone?: string;
    amount: string;
    description: string;
    linkUrl: string;
    status?: "active" | "paid" | "expired";
  };
  catalogStock?: {
    title?: string;
    items: StockItem[];
  };
  campaignGate?: {
    campaignName: string;
    segmentDescription: string;
    targetCount: number;
    discountPercent: string;
    offerMessage: string;
  };
  revenueSummary?: RevenueMetric;
  rateLimit?: {
    isRateLimited: boolean;
  };
}

interface ChatMessageItemProps {
  message: ChatMessageData;
  isStreaming?: boolean;
}

function extractText(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(extractText).join("");
  }
  if (node && typeof node === "object" && "props" in node) {
    return extractText((node as { props?: { children?: React.ReactNode } }).props?.children);
  }
  return "";
}

function renderCellContent(node: React.ReactNode): React.ReactNode {
  if (typeof node === "string") {
    if (/<br\s*\/?>/i.test(node)) {
      const parts = node.split(/<br\s*\/?>/i);
      return parts.map((part, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && <span className="block my-0.5" />}
          {part.trim()}
        </React.Fragment>
      ));
    }
    return node;
  }
  if (Array.isArray(node)) {
    return React.Children.map(node, renderCellContent);
  }
  return node;
}

export function ChatMessageItem({
  message,
  isStreaming = false,
}: ChatMessageItemProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (message.role === "user") {
    return (
      <div className="flex justify-end my-4 font-intert">
        <div className="max-w-[85%] rounded-2xl bg-surface border border-border px-4 py-2.5 text-sm text-primary leading-relaxed shadow-xs">
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full my-6 font-intert">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-5 h-5 flex items-center justify-center shrink-0">
          <ThinkingOrb
            state={isStreaming ? "working" : "composing"}
            size={20}
          />
        </div>
        <span className="text-sm font-semibold text-primary font-intert">
          MerchantAgent
        </span>
      </div>

      {message.thinking && (
        <AgentThinking
          durationSeconds={message.thinking.durationSeconds}
          thoughtSummary={message.thinking.summary}
          steps={message.thinking.steps}
          detailedThought={message.thinking.detailedThought}
          isThinking={isStreaming}
        />
      )}

      <div className="pl-0 sm:pl-1">
        {message.content && (
          <div className="max-w-none text-[14px] text-secondary leading-[1.75] font-intert">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1 className="text-xl sm:text-2xl font-bold font-instrument text-primary mt-6 mb-3 tracking-tight">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-lg sm:text-xl font-semibold text-primary mt-5 mb-2.5 tracking-tight">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-base font-semibold text-primary mt-4 mb-2 tracking-tight">
                    {children}
                  </h3>
                ),
                h4: ({ children }) => (
                  <h4 className="text-sm font-semibold text-primary mt-3 mb-1.5 tracking-tight">
                    {children}
                  </h4>
                ),
                p: ({ children }) => {
                  const text = extractText(children).trim();
                  if (/^(?:WhatsApp Message Template|Message Template|Order Template|Restock Plan|Summary|Product Recommendation)/i.test(text)) {
                    return (
                      <h3 className="text-base sm:text-lg font-semibold text-primary mt-5 mb-2 tracking-tight">
                        {text.replace(/^\*\*|\*\*$/g, "")}
                      </h3>
                    );
                  }
                  const cleanPText = text.replace(/^[\s\uFFFD\u25C6\u25C7\u25CA\u25C8\u25C9\u25CE\u25CF\u25B6\u25B7\u25BA\u25BB\u25C4\u25C5\u25E6\u2022\u2219◆◇◈►▶▸→\-–—\.]+\s*/, "");
                  const actionInPMatch = cleanPText.match(/^(NEXT STEPS?|ACTIONABLE NEXT STEPS?)\s*[:\-–—]\s*([\s\S]*)$/i);
                  if (actionInPMatch) {
                    return (
                      <div className="my-3 flex items-start gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-brand bg-brand/10 border border-brand/20 uppercase tracking-wider shrink-0 shadow-xs mt-0.5">
                          <ArrowRight size={11} className="shrink-0" />
                          <span>NEXT STEP</span>
                        </span>
                        <span className="text-secondary text-sm leading-relaxed">{actionInPMatch[2]}</span>
                      </div>
                    );
                  }
                  const isSectionDivider =
                    /^(?:EXECUTIVE SUMMARY|DATA TABLES?(?:\s*\/\s*SCENARIO COMPARISONS?)?|KEY (?:BUSINESS )?INSIGHTS?|NEXT STEP|ACTIONABLE NEXT STEP|ARITHMETIC BREAKDOWN|STATUS|STOCK HEALTH|RECOMMENDATION|SCENARIOS?|QUICK BUSINESS TAKE|INVENTORY STATUS|QUICK CHECKLIST.*|EXAMPLE.*):?$/i.test(
                      text
                    );
                  if (isSectionDivider) {
                    return (
                      <div className="mt-5 mb-2">
                        <span className="text-[11.5px] font-bold text-primary uppercase tracking-widest">
                          {text.replace(/:$/, "")}
                        </span>
                      </div>
                    );
                  }
                  return (
                    <p className="text-secondary leading-[1.75] my-2 [&:first-child]:mt-0">
                      {children}
                    </p>
                  );
                },
                table: ({ children }) => (
                  <div className="w-full max-w-full my-3.5 overflow-x-auto rounded-xl border border-border bg-surface shadow-xs">
                    <table className="w-full text-left text-xs sm:text-[13px] border-collapse min-w-[480px]">
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-surface-muted/50 border-b border-border font-intert">
                    {children}
                  </thead>
                ),
                tbody: ({ children }) => (
                  <tbody className="divide-y divide-border/50 font-intert text-secondary">
                    {children}
                  </tbody>
                ),
                tr: ({ children }) => (
                  <tr className="hover:bg-surface-muted/25 transition-colors">
                    {children}
                  </tr>
                ),
                th: ({ children }) => (
                  <th className="px-3.5 py-2 text-[11px] font-semibold text-muted uppercase tracking-wider">
                    {renderCellContent(children)}
                  </th>
                ),
                td: ({ children }) => {
                  const raw = extractText(children).trim();
                  if (/^Healthy(?: Stock)?$/i.test(raw)) {
                    return (
                      <td className="px-3.5 py-2.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          {raw}
                        </span>
                      </td>
                    );
                  }
                  if (/^Low Stock$/i.test(raw)) {
                    return (
                      <td className="px-3.5 py-2.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          {raw}
                        </span>
                      </td>
                    );
                  }
                  if (/^Out of Stock$/i.test(raw)) {
                    return (
                      <td className="px-3.5 py-2.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-medium bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                          {raw}
                        </span>
                      </td>
                    );
                  }
                  return (
                    <td className="px-3.5 py-2.5 text-secondary first:text-primary first:font-medium leading-relaxed">
                      {renderCellContent(children)}
                    </td>
                  );
                },
                strong: ({ children }) => {
                  const rawText = extractText(children).trim();
                  const cleanText = rawText.replace(/^[\s\uFFFD\u25C6\u25C7\u25CA\u25C8\u25C9\u25CE\u25CF\u25B6\u25B7\u25BA\u25BB\u25C4\u25C5\u25E6\u2022\u2219◆◇◈►▶▸→\-–—\.]+\s*/, "");
                  const isActionLabel =
                    /^(?:NEXT STEPS?|ACTIONABLE NEXT STEPS?|ACTION|RECOMMENDATIONS?):?$/i.test(
                      cleanText
                    );
                  if (isActionLabel) {
                    return (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-brand bg-brand/10 border border-brand/20 uppercase tracking-wider mr-2 my-0.5 align-middle shadow-xs">
                        <ArrowRight size={11} className="shrink-0" />
                        <span>{cleanText.replace(/:$/, "")}</span>
                      </span>
                    );
                  }
                  const actionPrefixMatch = cleanText.match(/^(NEXT STEPS?|ACTIONABLE NEXT STEPS?|ACTION|RECOMMENDATIONS?)\s*[:\-–—]\s*(.*)$/i);
                  if (actionPrefixMatch) {
                    return (
                      <span className="inline-flex flex-wrap items-center gap-1.5 my-1 align-middle">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-brand bg-brand/10 border border-brand/20 uppercase tracking-wider align-middle shadow-xs">
                          <ArrowRight size={11} className="shrink-0" />
                          <span>{actionPrefixMatch[1].toUpperCase()}</span>
                        </span>
                        <span className="font-semibold text-primary">{actionPrefixMatch[2]}</span>
                      </span>
                    );
                  }
                  const isMetricLabel =
                    /^(?:Velocity Signal|Margin Insight|Margin Watch|Restock Alert|Revenue Snapshot|Fastest-Selling Signal|Stock after|High-Margin Drivers|Cross-Sell Pairing|Total|Remaining stock):?$/i.test(
                      cleanText
                    );
                  if (isMetricLabel) {
                    return (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium text-primary bg-surface-muted border border-border uppercase tracking-wider mr-2 my-0.5 align-middle shadow-xs">
                        {cleanText.replace(/:$/, "")}
                      </span>
                    );
                  }
                  return (
                    <strong className="font-semibold text-primary">
                      {children}
                    </strong>
                  );
                },
                em: ({ children }) => (
                  <em className="italic text-secondary/90">{children}</em>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc pl-5 my-3 space-y-3 text-secondary marker:text-primary">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal pl-5 my-3 space-y-3 text-secondary marker:text-primary">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="leading-[1.7] pl-1 my-1">
                    {children}
                  </li>
                ),
                pre: ({ children }) => (
                  <div className="relative my-4 overflow-hidden rounded-xl border border-border bg-surface-muted/30">
                    <div className="overflow-x-auto p-3.5">
                      <pre className="font-mono text-xs text-secondary leading-relaxed whitespace-pre">
                        {children}
                      </pre>
                    </div>
                  </div>
                ),
                code: ({ children, className }) => {
                  const isMultiLine = typeof children === "string" && children.includes("\n");
                  const isBlock = Boolean(className?.startsWith("language-")) || isMultiLine;
                  if (isBlock) {
                    return (
                      <code className="font-mono text-xs text-secondary leading-relaxed">
                        {children}
                      </code>
                    );
                  }
                  return (
                    <code className="font-mono text-xs bg-surface-muted px-1.5 py-0.5 rounded-md border border-border text-brand font-medium">
                      {children}
                    </code>
                  );
                },
                blockquote: ({ children }) => (
                  <MessageSnippetCard>{children}</MessageSnippetCard>
                ),
                hr: () => (
                  <hr className="border-border/50 my-4" />
                ),
              }}
            >
              {normalizeMessageContent(message.content)}
            </ReactMarkdown>
            {isStreaming && (
              <span className="inline-block w-1.5 h-4 ml-1 bg-brand align-middle rounded-xs animate-pulse" />
            )}
          </div>
        )}

        {message.paymentLink && (
          <PaymentLinkCard
            customerName={message.paymentLink.customerName}
            customerPhone={message.paymentLink.customerPhone}
            amount={message.paymentLink.amount}
            description={message.paymentLink.description}
            linkUrl={message.paymentLink.linkUrl}
            status={message.paymentLink.status}
          />
        )}

        {message.catalogStock && (
          <CatalogStockCard
            title={message.catalogStock.title}
            items={message.catalogStock.items}
          />
        )}

        {message.campaignGate && (
          <CampaignGateCard
            campaignName={message.campaignGate.campaignName}
            segmentDescription={message.campaignGate.segmentDescription}
            targetCount={message.campaignGate.targetCount}
            discountPercent={message.campaignGate.discountPercent}
            offerMessage={message.campaignGate.offerMessage}
          />
        )}

        {message.revenueSummary && (
          <RevenueSummaryCard data={message.revenueSummary} />
        )}

        {message.rateLimit?.isRateLimited && (
          <RateLimitCard />
        )}

        {message.content && !isStreaming && (
          <div className="flex items-center gap-2 pt-2 mt-1">
            <button
              type="button"
              onClick={handleCopy}
              title="Copy response"
              className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs text-muted hover:text-primary hover:bg-surface-muted transition-colors cursor-pointer"
            >
              {copied ? (
                <Check size={13} className="text-emerald-500" />
              ) : (
                <Copy size={13} />
              )}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
