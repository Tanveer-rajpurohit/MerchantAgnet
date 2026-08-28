"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ThinkingOrb } from "thinking-orbs";
import {
  ChatInput,
  ChatSuggestions,
  ChatMessageItem,
  useWordStream,
} from "../../components/app/chat";
import type { ActionMode, ChatMessageData } from "../../components/app/chat";

function ChatContent() {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [query, setQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { startStream, stopStream, streamingId } = useWordStream();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    const handleNewChat = () => {
      stopStream();
      setMessages([]);
      setQuery("");
      setIsTyping(false);
      window.history.replaceState(null, "", "/chat");
    };

    window.addEventListener("mag:new-chat", handleNewChat);
    return () => {
      window.removeEventListener("mag:new-chat", handleNewChat);
      stopStream();
    };
  }, [stopStream]);

  const handleSend = useCallback(
    (text: string, mode: ActionMode) => {
      const userMsg: ChatMessageData = {
        id: Math.random().toString(36).slice(2, 9),
        role: "user",
        content: text,
      };

      setMessages((prev) => [...prev, userMsg]);
      setQuery("");
      setIsTyping(true);

      const chatId = Math.random().toString(36).slice(2, 9);
      window.history.replaceState(null, "", `/chat/${chatId}`);

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
            content:
              "Here is your AI-compiled store revenue and collection summary for the current week.\n\n### Weekly Performance\n- **Current Week Collections:** ₹18,420 (+29.2% increase)\n- **Order Volume:** 42 completed transactions\n- **Primary Channel:** 64% payments received via UPI QR & instant links\n\nReview the detailed metrics breakdown below:",
            thinking: {
              durationSeconds: 2,
              summary:
                "Aggregated your settled transactions, calculated growth vs last week, and compiled channel split.",
              steps: [
                {
                  id: "r1",
                  label: "Queried Razorpay settled transactions",
                  detail: "42 settled orders this week totalling ₹18,420",
                  status: "completed",
                },
                {
                  id: "r2",
                  label: "Compared with previous week benchmark",
                  detail: "+29.2% revenue increase over last week (₹14,250)",
                  status: "completed",
                },
                {
                  id: "r3",
                  label: "Analyzed payment channel distribution",
                  detail: "UPI accounted for 64% of volume",
                  status: "completed",
                },
              ],
              detailedThought:
                "You asked for store revenue and collection summary.\nI analyzed settled payouts from Razorpay over the past 7 days.\nTotal settled collection stands at ₹18,420 representing a 29.2% increase.\nUPI is the leading payment channel at 64% of total turnover.",
            },
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
                "Collection grew by 29.2% this week driven by higher repeat UPI orders from Sharma Store regulars. Dairy and beverage bundles saw the highest conversion.",
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
              "I have drafted the festival promotional campaign batch for your repeat customers.\n\n### Approval Required\nAs a safety measure, **no messages or discount links have been sent yet**. Every promotional action needs your explicit approval before anything goes out.\n\n- **Target Customers:** Top 20 verified repeat buyers (avg. order value ₹1,200)\n- **Offer Value:** 10% instant discount applied at checkout\n- **Estimated Campaign Sales:** ₹21,600 projected revenue\n\nPlease review the draft below and click **Approve & Send Batch** to send it out:",
            thinking: {
              durationSeconds: 4,
              summary:
                "Found your top 20 repeat customers and drafted a Diwali offer batch for your review.",
              steps: [
                {
                  id: "g1",
                  label: "Identified your best repeat customers",
                  detail: "Top 20 buyers with 3+ orders in the last 60 days",
                  status: "completed",
                },
                {
                  id: "g2",
                  label: "Drafted personalized Diwali offer messages",
                  detail: "10% festive discount on all staple groceries",
                  status: "completed",
                },
                {
                  id: "g3",
                  label: "Calculated estimated campaign revenue",
                  detail: "₹21,600 projected based on average order values",
                  status: "completed",
                },
                {
                  id: "g4",
                  label: "Waiting for your approval before sending",
                  detail: "Nothing will be sent until you click Approve",
                  status: "completed",
                },
              ],
              detailedThought:
                "You asked for a Diwali campaign targeting repeat customers.\nI found 20 customers who ordered 3 or more times in the past 60 days.\nI drafted a personalized message offering 10% off on groceries.\nI calculated the projected revenue based on their average order size.\nThe batch is ready but held back until you explicitly approve it.",
            },
            campaignGate: {
              campaignName: "Diwali Grocery Festive Delight",
              segmentDescription:
                "Top 20 Repeat Kirana Customers (Last 60 Days)",
              targetCount: 20,
              discountPercent: "10% OFF",
              offerMessage:
                "Happy Diwali! Enjoy exclusive 10% savings on your grocery order with Sharma Store. Click link to order now.",
            },
          };
        } else if (
          mode === "catalog" ||
          lower.includes("stock") ||
          lower.includes("inventory") ||
          lower.includes("restock") ||
          lower.includes("replenish") ||
          lower.includes("alert")
        ) {
          assistantMsg = {
            id: Math.random().toString(36).slice(2, 9),
            role: "assistant",
            content:
              "I checked your full product catalog for items running low.\n\n### Inventory Alert Summary\nCurrently, **2 items** are below your configured safety stock levels and need restocking soon.\n\n1. **Amul Taaza Milk 1L:** Only 4 units left (you set the alert at 10 units)\n2. **Fortune Sunflower Oil 1L:** Only 2 units left (you set the alert at 5 units)\n\nAll other items are well stocked. Here is the full breakdown:",
            thinking: {
              durationSeconds: 2,
              summary:
                "Checked all your products and found 2 items below your restock alerts.",
              steps: [
                {
                  id: "c1",
                  label: "Loaded your full product catalog",
                  detail: "4 products across Dairy, Oils, Foods, and Grains",
                  status: "completed",
                },
                {
                  id: "c2",
                  label: "Compared stock levels against your alert thresholds",
                  detail: "2 items need restocking, 2 items are healthy",
                  status: "completed",
                },
                {
                  id: "c3",
                  label: "Sorted by urgency",
                  detail: "Amul Milk is most critical (60% below threshold)",
                  status: "completed",
                },
              ],
              detailedThought:
                "You asked about stock and inventory.\nI pulled your complete catalog with current stock counts.\nI compared each item against the low-stock alert level you configured during setup.\nAmul Taaza Milk has only 4 units but your alert is set at 10 (critical).\nFortune Sunflower Oil has 2 units with an alert at 5 (low).\nMaggi and Atta are both well above their thresholds.",
            },
            catalogStock: {
              title: "Live Inventory & Stock Alerts",
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
                {
                  id: "p3",
                  name: "Maggi 2-Minute Noodles 12-Pack",
                  category: "Packaged Foods",
                  currentStock: 48,
                  threshold: 10,
                  sellingPrice: "₹140.00",
                  status: "ok",
                },
                {
                  id: "p4",
                  name: "Aashirvaad Atta 5kg",
                  category: "Flour & Grains",
                  currentStock: 18,
                  threshold: 6,
                  sellingPrice: "₹260.00",
                  status: "ok",
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
              "I have generated a verified test-mode Razorpay payment link for customer **Rahul Sharma**.\n\n### Transaction Summary\n- **Customer:** Rahul Sharma (Verified regular customer)\n- **Order Value:** ₹500.00 (Kirana staples and daily provisions)\n- **Payment Mode:** Razorpay Test Mode (0% platform fee)\n- **Dispatch:** Link ready for sharing via WhatsApp or SMS\n\nYou can copy the checkout link directly, send it over WhatsApp, or message the customer below:",
            thinking: {
              durationSeconds: 3,
              summary:
                "Verified your store profile, looked up Rahul, and created a ₹500 payment link.",
              steps: [
                {
                  id: "s1",
                  label: "Confirmed your store identity",
                  detail:
                    "Sharma Store (Kirana / Grocery) with active Razorpay keys",
                  status: "completed",
                },
                {
                  id: "s2",
                  label: "Looked up customer Rahul",
                  detail: "Regular buyer, 12 past orders, avg. ₹480 per visit",
                  status: "completed",
                },
                {
                  id: "s3",
                  label: "Created ₹500 payment link via Razorpay",
                  detail: "Test mode link generated, ready to share",
                  status: "completed",
                },
                {
                  id: "s4",
                  label: "Recorded action in your audit trail",
                  detail: "Logged for your records and compliance tracking",
                  status: "completed",
                },
              ],
              detailedThought:
                "You asked me to send Rahul a ₹500 payment link.\nFirst, I confirmed your store (Sharma Store) has active Razorpay test keys.\nThen I checked Rahul's purchase history to verify he is a known customer.\nI created the link through Razorpay's secure API in test mode.\nFinally, I logged this action in your audit trail so you have a complete record.",
            },
            paymentLink: {
              customerName: "Rahul Sharma",
              customerPhone: "+91 98765 43210",
              amount: "₹500.00",
              description: "Kirana store grocery order #4092",
              linkUrl: "https://rzp.io/l/test_rahul_500",
              status: "active",
            },
          };
        } else {
          assistantMsg = {
            id: Math.random().toString(36).slice(2, 9),
            role: "assistant",
            content:
              "I'm your dedicated **MerchantAgent** assistant. I handle day-to-day store operations so you can focus on running your business.\n\n### What I Can Do For You\n1. **Payment Links:** Tell me the customer name and amount (e.g. *\"Send Ramesh a ₹350 link\"*) and I'll generate an instant Razorpay payment link.\n2. **Inventory Alerts:** I monitor your stock levels and flag items that are running low before you run out.\n3. **Festive Campaigns:** Describe an offer in plain language and I'll draft a campaign batch for your approval before anything sends.\n4. **Revenue Analysis:** Ask for weekly sales and channel performance summaries.\n\nHow can I help grow your business today?",
            thinking: {
              durationSeconds: 2,
              summary:
                "Loaded your store profile and prepared available operations.",
              steps: [
                {
                  id: "t1",
                  label: "Understood your question",
                  detail: "General inquiry about available capabilities",
                  status: "completed",
                },
                {
                  id: "t2",
                  label: "Loaded your store profile",
                  detail: "Sharma Store (Kirana / Grocery, Mumbai)",
                  status: "completed",
                },
              ],
            },
          };
        }

        setIsTyping(false);
        startStream(assistantMsg, setMessages);
      }, 120);
    },
    [startStream],
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

  const isEmpty = messages.length === 0;

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
