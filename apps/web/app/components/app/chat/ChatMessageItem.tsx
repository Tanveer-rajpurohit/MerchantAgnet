"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { ThinkingOrb } from "thinking-orbs";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AgentThinking, AgentStep } from "./AgentThinking";
import { PaymentLinkCard } from "./PaymentLinkCard";
import { CatalogStockCard, StockItem } from "./CatalogStockCard";
import { CampaignGateCard } from "./CampaignGateCard";

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
}

interface ChatMessageItemProps {
  message: ChatMessageData;
  isStreaming?: boolean;
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
          <div className="prose prose-neutral dark:prose-invert max-w-none text-[14.5px] text-secondary leading-[1.7] font-intert space-y-3">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1 className="text-xl font-semibold text-primary mt-4 mb-2">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-lg font-semibold text-primary mt-3.5 mb-1.5">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-base font-semibold text-primary mt-3 mb-1">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="text-secondary leading-relaxed mb-3 last:mb-0 inline">
                    {children}
                  </p>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-primary">
                    {children}
                  </strong>
                ),
                em: ({ children }) => (
                  <em className="italic text-primary">{children}</em>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc pl-5 my-2.5 space-y-1.5 text-secondary">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal pl-5 my-2.5 space-y-1.5 text-secondary">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="leading-relaxed">{children}</li>
                ),
                code: ({ children }) => (
                  <code className="font-mono text-xs bg-surface-muted px-1.5 py-0.5 rounded border border-border text-primary">
                    {children}
                  </code>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-border pl-3.5 italic text-muted my-2">
                    {children}
                  </blockquote>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
            {isStreaming && (
              <span className="inline-block w-1.5 h-4 ml-1 bg-brand align-middle rounded-xs opacity-10" />
            )}
          </div>
        )}

        {message.paymentLink && (
          <PaymentLinkCard
            customerName={message.paymentLink.customerName}
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
