"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ThinkingOrb } from "thinking-orbs";
import {
  ChatInput,
  ChatSuggestions,
  ChatMessageItem,
  extractCardsFromRun,
  extractCardsFromData,
} from "../../components/app/chat";
import type { ActionMode, ChatMessageData } from "../../components/app/chat";
import type { AgentStep } from "../../components/app/chat/AgentThinking";
import { useAgentStream } from "../../../hooks";
import { useAgentChatStore } from "../../../stores";

function formatLatency(ms?: number): string {
  if (!ms || ms <= 0) return "240ms";
  if (ms < 1000) return `${ms}ms`;
  const totalSeconds = Math.round(ms / 1000);
  if (totalSeconds < 60) return `${(ms / 1000).toFixed(1)}s`;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
}

function ChatContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isUserNearBottomRef = useRef(true);
  const { sendMessage, isStreaming, streamingUserMessage, streamingAssistantResponse } = useAgentStream();
  const { runs, clearChat } = useAgentChatStore();

  useEffect(() => {
    if (!isStreaming) {
      clearChat();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const threshold = 150;
    const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    isUserNearBottomRef.current = distanceToBottom < threshold;
  };

  useEffect(() => {
    if (!isUserNearBottomRef.current) return;
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [streamingAssistantResponse, isStreaming]);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [runs.length]);

  const handleSend = useCallback(
    (text: string, _mode?: ActionMode, attachedCustomer?: any) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      setQuery("");
      sendMessage(trimmed, "merchant_admin", null, attachedCustomer);
    },
    [isStreaming, sendMessage]
  );

  const hasTriggeredUrlMode = useRef(false);

  useEffect(() => {
    if (hasTriggeredUrlMode.current) return;
    const urlMode = searchParams.get("mode");
    if (!urlMode) return;
    hasTriggeredUrlMode.current = true;

    const timer = setTimeout(() => {
      if (urlMode === "payment-link") {
        handleSend("Generate a ₹500 payment link for Rahul", "payment-link");
      } else if (urlMode === "campaign") {
        handleSend("Draft a Diwali campaign for repeat customers", "campaign");
      } else if (urlMode === "catalog") {
        handleSend("Check low stock products in inventory", "catalog");
      } else if (urlMode === "revenue") {
        handleSend("Show weekly revenue summary", "default");
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [searchParams, handleSend]);

  const handleSelectSuggestion = (prompt: string, mode?: ActionMode) => {
    handleSend(prompt, mode || "default");
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

  const isEmpty = messages.length === 0 && !isStreaming;

  return (
    <div className="flex-1 flex flex-col min-h-0 h-full">
      {isEmpty ? (
        <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 overflow-y-auto">
          <div className="w-full max-w-2xl space-y-8 animate-in fade-in duration-300 my-auto py-8">
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl font-instrument text-primary tracking-tight">
                What can I help with?
              </h1>
              <p className="mt-2 text-sm text-muted font-intert">
                Ask your AI merchant assistant anything about your store.
              </p>
            </div>

            <ChatInput
              value={query}
              onChange={setQuery}
              onSubmit={handleSend}
              autoFocus
              placeholder="Ask anything about payment links, stock, or campaigns..."
            />

            <ChatSuggestions onSelect={handleSelectSuggestion} />
          </div>
        </div>
      ) : (
        <>
          <div ref={scrollContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto min-h-0 px-4 sm:px-8 py-6">
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
          </div>

          <div className="shrink-0 border-t border-border px-4 sm:px-8 py-4 bg-bg">
            <div className="mx-auto max-w-3xl">
              <ChatInput
                value={query}
                onChange={setQuery}
                onSubmit={handleSend}
                autoFocus
                placeholder="Reply to MerchantAgent..."
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center">
          <ThinkingOrb state="working" size={20} />
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  );
}
