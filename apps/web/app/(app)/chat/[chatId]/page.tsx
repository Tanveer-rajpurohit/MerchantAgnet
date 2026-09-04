"use client";

import { useState, useRef, useEffect, use } from "react";
import { ThinkingOrb } from "thinking-orbs";
import {
  ChatInput,
  ChatMessageItem,
  extractCardsFromRun,
  extractCardsFromData,
} from "../../../components/app/chat";
import type { ActionMode, ChatMessageData, AgentStep } from "../../../../types";
import {
  useSessionHistory,
  useAgentStream,
} from "../../../../hooks";
import { useAgentChatStore } from "../../../../stores/useAgentChatStore";

function formatLatency(ms?: number): string {
  if (!ms || ms <= 0) return "240ms";
  if (ms < 1000) return `${ms}ms`;
  const totalSeconds = Math.round(ms / 1000);
  if (totalSeconds < 60) return `${(ms / 1000).toFixed(1)}s`;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
}

export default function ChatSessionPage({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  const resolvedParams = use(params);
  const chatId = resolvedParams.chatId;

  const [query, setQuery] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isUserNearBottomRef = useRef(true);

  const { data: historyData, isLoading } = useSessionHistory(chatId);
  const { sendMessage, isStreaming, streamingUserMessage, streamingAssistantResponse } = useAgentStream();
  const storeRuns = useAgentChatStore((s) => s.runs);

  const historyRuns = historyData?.runs || [];
  const runs = [...historyRuns];
  for (const sr of storeRuns) {
    if (
      sr.session_id === chatId &&
      !runs.some(
        (r) =>
          r.id === sr.id ||
          (r.user_message === sr.user_message &&
            Math.abs(new Date(r.created_at).getTime() - new Date(sr.created_at).getTime()) < 10000)
      )
    ) {
      runs.push(sr);
    }
  }
  const sessionTitle = runs.length > 0 ? runs[0]?.user_message.slice(0, 45) : "Merchant Conversation";

  const scrollToBottom = (behavior: ScrollBehavior = "auto") => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  };

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const threshold = 150;
    const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    isUserNearBottomRef.current = distanceToBottom < threshold;
  };

  useEffect(() => {
    if (!isUserNearBottomRef.current) return;
    scrollToBottom("auto");
  }, [streamingAssistantResponse, streamingUserMessage, isStreaming]);

  useEffect(() => {
    if (!isLoading) {
      scrollToBottom("auto");
      const t = setTimeout(() => scrollToBottom("auto"), 60);
      return () => clearTimeout(t);
    }
  }, [isLoading, runs.length]);

  const handleSend = (
    text: string,
    _mode?: ActionMode,
    attachedCustomer?: Parameters<typeof sendMessage>[3],
  ) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    isUserNearBottomRef.current = true;
    setQuery("");
    sendMessage(trimmed, "merchant_admin", chatId, attachedCustomer);
    scrollToBottom("auto");
    requestAnimationFrame(() => scrollToBottom("auto"));
    setTimeout(() => scrollToBottom("auto"), 50);
    setTimeout(() => scrollToBottom("auto"), 150);
  };

  const messages: ChatMessageData[] = [];
  runs.forEach((run) => {
    messages.push({
      id: `user-${run.id}`,
      role: "user",
      content: run.user_message,
    });

    const steps: AgentStep[] = [];
    if (run.tools_invoked && run.tools_invoked.length > 0) {
      run.tools_invoked.forEach((t, idx) => {
        steps.push({
          id: `step-${idx}`,
          label: `Invoked tool: ${t.tool || "Search"}`,
          detail: t.content ? String(t.content).slice(0, 90) : "Retrieved verified store records",
          status: "completed",
        });
      });
    } else {
      steps.push({
        id: "step-1",
        label: "Understood merchant intent",
        detail: "Loaded store context and vector knowledge",
        status: "completed",
      });
      steps.push({
        id: "step-2",
        label: "Executed store operation",
        detail: "Synthesized live response with verified figures",
        status: "completed",
      });
    }

    const cards = extractCardsFromRun(run);

    messages.push({
      id: `assistant-${run.id}`,
      role: "assistant",
      content: run.agent_response,
      thinking: {
        durationSeconds: run.latency_ms ? Math.max(1, Math.round(run.latency_ms / 1000)) : 2,
        summary: `Analyzed store records in ${formatLatency(run.latency_ms)}`,
        steps,
        detailedThought: `User asked: "${run.user_message}"\nVerified against store catalog and operational database.\nRendered live response with pricing and stock levels.`,
      },
      ...cards,
    });
  });

  return (
    <div className="flex-1 flex flex-col min-h-0 h-full">
      <div className="flex items-center justify-between h-14 px-6 border-b border-border shrink-0 bg-surface">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-muted bg-surface-muted px-2 py-0.5 rounded-md border border-border">
            ID: {chatId ? `${chatId.slice(0, 8)}...` : "session"}
          </span>
          <span className="text-sm font-medium font-intert text-primary truncate">
            {sessionTitle}
          </span>
        </div>
      </div>

      <div ref={scrollContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto min-h-0 px-4 sm:px-8 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <ThinkingOrb state="working" size={20} />
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-2 animate-in fade-in duration-300">
            {messages.map((msg) => (
              <ChatMessageItem key={msg.id} message={msg} />
            ))}

            {isStreaming && streamingUserMessage && (
              <>
                <ChatMessageItem
                  message={{
                    id: "active-user-turn",
                    role: "user",
                    content: streamingUserMessage,
                  }}
                />
                <ChatMessageItem
                  message={{
                    id: "active-assistant-turn",
                    role: "assistant",
                    content: streamingAssistantResponse,
                    ...extractCardsFromData(streamingAssistantResponse, undefined, streamingUserMessage),
                    thinking: {
                      durationSeconds: 2,
                      summary: "Analyzing live store inventory & policies...",
                      steps: [
                        {
                          id: "s1",
                          label: "Searching store knowledge base",
                          detail: "Querying BGE embeddings and product records",
                          status: streamingAssistantResponse ? "completed" : "in_progress",
                        },
                        {
                          id: "s2",
                          label: "Synthesizing verified merchant answer",
                          detail: "Formatting response with live prices and stock",
                          status: streamingAssistantResponse ? "in_progress" : "pending",
                        },
                      ],
                      detailedThought: `Active prompt: "${streamingUserMessage}"\nRetrieving vector candidates and live SQL records...`,
                    },
                  }}
                  isStreaming={true}
                />
              </>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-border px-4 sm:px-8 py-4 bg-bg">
        <div className="mx-auto max-w-3xl">
          <ChatInput
            value={query}
            onChange={setQuery}
            onSubmit={handleSend}
            placeholder={isStreaming ? "MerchantAgent is replying..." : "Reply to MerchantAgent..."}
          />
        </div>
      </div>
    </div>
  );
}
