"use client";

import { useState, useRef, useEffect } from "react";
import { ThinkingOrb } from "thinking-orbs";
import {
  ChatInput,
  ChatMessageItem,
  useWordStream,
} from "../../../components/app/chat";
import type { ActionMode, ChatMessageData } from "../../../components/app/chat";

export default function ChatSessionPage({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  const [chatId, setChatId] = useState("");
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [query, setQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { startStream, stopStream, streamingId } = useWordStream();

  useEffect(() => {
    return () => {
      stopStream();
    };
  }, [stopStream]);

  useEffect(() => {
    params.then((p) => {
      setChatId(p.chatId);
      setMessages([
        {
          id: "m-init-1",
          role: "user",
          content: "Show me recent payment links and check low stock products",
        },
        {
          id: "m-init-2",
          role: "assistant",
          content:
            "Here is your real-time store snapshot across today's transactions and inventory:\n\n### Store Operations Summary\n- **Payment Links:** 3 payment links settled today totaling **₹2,450.00**.\n- **Inventory:** 1 product has dropped below your low-stock alert level.\n\nReview the live status details below:",
          thinking: {
            durationSeconds: 2,
            summary:
              "Checked today's payment activity and scanned your product stock levels.",
            steps: [
              {
                id: "init-step-1",
                label: "Reviewed today's payment link activity",
                detail: "3 links settled, ₹2,450 total collected",
                status: "completed",
              },
              {
                id: "init-step-2",
                label: "Checked inventory against your alert levels",
                detail: "Amul Milk has only 4 units (alert set at 10)",
                status: "completed",
              },
            ],
            detailedThought:
              "You asked for recent payments and low-stock products.\nI found 3 settled payment links from today totaling ₹2,450.\nI checked all products against your configured alert thresholds.\nAmul Taaza Milk is the only critical item at 4 units remaining.",
          },
          catalogStock: {
            title: "Inventory Alert",
            items: [
              {
                id: "init-p1",
                name: "Amul Taaza Milk 1L",
                category: "Dairy & Staples",
                currentStock: 4,
                threshold: 10,
                sellingPrice: "₹62.00",
                status: "critical",
              },
              {
                id: "init-p2",
                name: "Aashirvaad Atta 5kg",
                category: "Flour & Grains",
                currentStock: 22,
                threshold: 6,
                sellingPrice: "₹260.00",
                status: "ok",
              },
            ],
          },
        },
      ]);
    });
  }, [params]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = (text: string, mode: ActionMode) => {
    const userMsg: ChatMessageData = {
      id: Math.random().toString(36).slice(2, 9),
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuery("");
    setIsTyping(true);

    setTimeout(() => {
      let assistantMsg: ChatMessageData;
      const lower = text.toLowerCase();

      if (
        lower.includes("revenue") ||
        lower.includes("weekly") ||
        lower.includes("growth") ||
        lower.includes("performance") ||
        lower.includes("settled") ||
        lower.includes("sales") ||
        (lower.includes("summary") && !lower.includes("bill"))
      ) {
        assistantMsg = {
          id: Math.random().toString(36).slice(2, 9),
          role: "assistant",
          content: "Here is your weekly revenue and collection summary:",
          revenueSummary: {
            thisWeek: 18420,
            lastWeek: 14250,
            growthPercent: 29.2,
            totalOrders: 42,
            avgOrderValue: 438,
            paymentMethods: {
              upi: 64,
              card: 24,
              netbanking: 12,
            },
            aiInsight:
              "Collection grew by 29.2% this week driven by repeat UPI orders. Dairy and beverage bundles saw the highest conversion.",
          },
        };
      } else if (
        mode === "campaign" ||
        lower.includes("campaign") ||
        lower.includes("diwali") ||
        lower.includes("discount") ||
        lower.includes("offer") ||
        lower.includes("festive")
      ) {
        assistantMsg = {
          id: Math.random().toString(36).slice(2, 9),
          role: "assistant",
          content:
            "I have drafted the campaign for your approval before anything is sent:",
          campaignGate: {
            campaignName: "Diwali Festive Savings",
            segmentDescription: "Top 20 Repeat Kirana Customers",
            targetCount: 20,
            discountPercent: "10% OFF",
            offerMessage:
              "Happy Diwali from Sharma Store! Enjoy 10% instant discount on your order today.",
          },
        };
      } else if (
        mode === "catalog" ||
        lower.includes("stock") ||
        lower.includes("inventory") ||
        lower.includes("replenish") ||
        lower.includes("restock") ||
        lower.includes("alert")
      ) {
        assistantMsg = {
          id: Math.random().toString(36).slice(2, 9),
          role: "assistant",
          content: "Here is your live inventory report for low-stock items:",
          catalogStock: {
            title: "Live Inventory & Stock Status",
            items: [
              {
                id: "p1",
                name: "Amul Taaza Milk 1L",
                category: "Dairy & Staples",
                currentStock: 4,
                threshold: 10,
                sellingPrice: "₹62.00",
                status: "critical",
              },
              {
                id: "p2",
                name: "Fortune Sunflower Oil 1L",
                category: "Edible Oils",
                currentStock: 2,
                threshold: 5,
                sellingPrice: "₹145.00",
                status: "low",
              },
            ],
          },
        };
      } else if (
        mode === "payment-link" ||
        lower.includes("payment link") ||
        lower.includes("create link") ||
        lower.includes("send link") ||
        lower.includes("generate link") ||
        lower.includes("razorpay link") ||
        lower.includes("pay link") ||
        lower.includes("charge") ||
        lower.includes("₹") ||
        lower.includes("rahul") ||
        lower.includes("link") ||
        lower.includes("pay")
      ) {
        assistantMsg = {
          id: Math.random().toString(36).slice(2, 9),
          role: "assistant",
          content:
            "I've generated a Razorpay payment link for **₹650.00**.\n\n### Transaction Summary\n- **Order Value:** ₹650.00 (Custom provisions order)\n- **Payment Mode:** Razorpay Test Mode\n- **Status:** Link active and ready to share via WhatsApp or SMS.",
          thinking: {
            durationSeconds: 2,
            summary:
              "Confirmed your Razorpay connection and created a ₹650 payment link.",
            steps: [
              {
                id: "s1",
                label: "Confirmed your Razorpay account is active",
                detail: "Test mode keys verified",
                status: "completed",
              },
              {
                id: "s2",
                label: "Created ₹650 payment link",
                detail: "Link ready for sharing with customer",
                status: "completed",
              },
              {
                id: "s3",
                label: "Logged to your audit trail",
                detail: "Action recorded for compliance",
                status: "completed",
              },
            ],
          },
          paymentLink: {
            customerName: "Customer",
            customerPhone: "+91 98765 43210",
            amount: "₹650.00",
            description: "Kirana store custom order",
            linkUrl: "https://rzp.io/l/test_pay_custom",
            status: "active",
          },
        };
      } else {
        assistantMsg = {
          id: Math.random().toString(36).slice(2, 9),
          role: "assistant",
          content:
            "Done! I've processed your request and recorded the action in your store's audit trail.\n\nEverything is logged so you can review it anytime.",
          thinking: {
            durationSeconds: 1,
            summary: "Completed your store action and logged it.",
          },
        };
      }

      setIsTyping(false);
      startStream(assistantMsg, setMessages);
    }, 120);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 h-full">
      <div className="flex items-center justify-between h-14 px-6 border-b border-border shrink-0 bg-surface">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-muted bg-surface-muted px-2 py-0.5 rounded-md border border-border">
            ID: {chatId || "session"}
          </span>
          <span className="text-sm font-medium font-intert text-primary truncate">
            Merchant Conversation
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 px-4 sm:px-8 py-6">
        <div className="mx-auto max-w-3xl space-y-2 animate-in fade-in duration-300">
          {messages.map((msg) => (
            <ChatMessageItem
              key={msg.id}
              message={msg}
              isStreaming={msg.id === streamingId}
            />
          ))}

          {isTyping && (
            <div className="w-full my-6 font-intert animate-in fade-in duration-200">
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  <ThinkingOrb state="working" size={20} />
                </div>
                <span className="text-sm font-semibold text-primary font-intert">
                  MerchantAgent
                </span>
              </div>
            </div>
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
            placeholder="Reply to MerchantAgent..."
          />
        </div>
      </div>
    </div>
  );
}
