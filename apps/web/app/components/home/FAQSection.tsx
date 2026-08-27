"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

export default function FAQSection() {
  const [openFAQItems, setOpenFAQItems] = useState<number[]>([]);

  const faqData: FAQItem[] = [
    {
      question: "What is MerchantAgent and who is it built for?",
      answer:
        "MerchantAgent is an autonomous commerce agent built for small Indian businesses, kiranas, and local D2C brands that run on WhatsApp and memory. It turns plain conversational requests into real Razorpay payment links, automated stock queries, and gated campaigns.",
    },
    {
      question: "How does the agent-readable catalog (MCP) work?",
      answer:
        "Your inventory is maintained in exact structured database tables and exposed via a standard Model Context Protocol (MCP) server. This allows both your own merchant agent and external AI buyer agents to query exact live stock and transact seamlessly.",
    },
    {
      question: "How does Razorpay test mode work?",
      answer:
        "MerchantAgent connects directly with your Razorpay test-mode API keys. You can test live payment link creation, simulated successful settlements, and customer checkouts with zero financial risk.",
    },
    {
      question: "What is the Campaign Approval Gate?",
      answer:
        "Nothing sends or charges without explicit merchant consent. When you request an offer or discount, the agent drafts the customer batch and presents a full preview for one-click approval before any link is dispatched.",
    },
    {
      question: "Can end customers interact with the agent?",
      answer:
        "Yes! MerchantAgent provides a lightweight customer checkout chat surface where buyers can check product availability, ask questions, and receive instant Razorpay checkout links.",
    },
    {
      question: "How do I get started?",
      answer:
        "Onboarding takes under 2 minutes: complete your business profile, connect your Razorpay test keys, and add your initial product inventory.",
    },
  ];

  const toggleFAQItem = (index: number) => {
    setOpenFAQItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  return (
    <section id="faq" className="w-full border-b border-border">
      <div className="w-full max-w-6xl mx-auto border-x border-border px-4 sm:px-8 py-12 sm:py-16 flex flex-col lg:flex-row gap-8 lg:gap-12">
        <div className="w-full lg:w-1/3 flex flex-col gap-3">
          <div className="text-primary font-normal text-3xl md:text-5xl font-instrument tracking-tight">
            Frequently Asked Questions
          </div>
          <div className="text-muted text-sm sm:text-base font-intert leading-relaxed">
            Everything you need to know about MerchantAgent, Razorpay
            integration, and MCP catalog exposure.
          </div>
        </div>

        <div className="w-full lg:w-2/3 flex flex-col">
          {faqData.map((item, index) => {
            const isOpen = openFAQItems.includes(index);

            return (
              <div
                key={index}
                className="w-full border-b border-border/80 last:border-b-0 overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQItem(index)}
                  className="w-full py-4 flex justify-between items-center gap-4 text-left hover:opacity-80 transition-opacity"
                >
                  <div className="flex-1 text-primary text-sm sm:text-base font-medium font-intert">
                    {item.question}
                  </div>
                  <ChevronDown
                    size={18}
                    className={`text-muted transition-transform duration-300 ${
                      isOpen ? "rotate-180" : "rotate-0"
                    }`}
                  />
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? "max-h-96 opacity-100 pb-4" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="text-muted text-xs sm:text-sm font-intert leading-relaxed">
                    {item.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
