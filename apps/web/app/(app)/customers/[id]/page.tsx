"use client";

import { use } from "react";
import { ChatView } from "../../../components/app/customers";

interface ChatPageProps {
  params: Promise<{ id: string }>;
}

export default function CustomerChatPage({ params }: ChatPageProps) {
  const { id } = use(params);

  return (
    <div className="w-full h-full font-intert">
      <ChatView connectionId={id} />
    </div>
  );
}
