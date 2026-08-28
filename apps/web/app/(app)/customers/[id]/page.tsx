"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import {
  ChatView,
  CUSTOMERS,
  CHAT_MESSAGES,
} from "../../../components/app/customers";

interface ChatPageProps {
  params: Promise<{ id: string }>;
}

export default function CustomerChatPage({ params }: ChatPageProps) {
  const { id } = use(params);
  const customer = CUSTOMERS.find((c) => c.id === id);

  if (!customer) {
    notFound();
  }

  const messages = CHAT_MESSAGES[id] || [];

  return (
    <div className="w-full h-full font-intert">
      <ChatView customer={customer} messages={messages} />
    </div>
  );
}
