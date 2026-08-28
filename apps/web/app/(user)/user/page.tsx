"use client";

import { useState, useRef } from "react";
import {
  StoreItem,
  Message,
  StoreDirectory,
  StoreChatView,
} from "../../components/user";

export default function UserShoppingPage() {
  const [selectedStore, setSelectedStore] = useState<StoreItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const msgSeq = useRef(1);

  const handleSelectStore = (store: StoreItem) => {
    setSelectedStore(store);
    msgSeq.current = 1;
    setMessages([
      {
        id: "msg-init-1",
        sender: "assistant",
        text: `Namaste! Welcome to ${store.name}. I am the store's AI Shopping Copilot. Tell me what grocery items you need or ask for stock, and I will create an instant Razorpay checkout for you.`,
      },
    ]);
  };

  const handleSend = (textToSend?: string) => {
    if (!selectedStore) return;
    const query = textToSend || input;
    if (!query.trim()) return;

    msgSeq.current += 1;
    const userMsg: Message = {
      id: `user-${msgSeq.current}`,
      sender: "customer",
      text: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const lower = query.toLowerCase();

      const matchedItems: { name: string; qty: number; price: number }[] = [];

      if (lower.includes("atta") || lower.includes("aashirvaad")) {
        matchedItems.push({ name: "Aashirvaad Atta 5kg", qty: 1, price: 245 });
      }
      if (lower.includes("milk") || lower.includes("amul")) {
        matchedItems.push({ name: "Amul Milk 1L", qty: 2, price: 62 });
      }
      if (lower.includes("maggi")) {
        matchedItems.push({ name: "Maggi 12-pack", qty: 1, price: 145 });
      }
      if (lower.includes("oil") || lower.includes("fortune")) {
        matchedItems.push({
          name: "Fortune Sunflower Oil 1L",
          qty: 1,
          price: 160,
        });
      }
      if (lower.includes("salt") || lower.includes("tata")) {
        matchedItems.push({ name: "Tata Salt 1kg", qty: 2, price: 28 });
      }
      if (lower.includes("soap") || lower.includes("dettol")) {
        matchedItems.push({ name: "Dettol Soap 3-pack", qty: 1, price: 95 });
      }

      if (matchedItems.length === 0) {
        matchedItems.push({ name: "Aashirvaad Atta 5kg", qty: 1, price: 245 });
        matchedItems.push({ name: "Amul Milk 1L", qty: 2, price: 62 });
      }

      const total = matchedItems.reduce(
        (acc, it) => acc + it.price * it.qty,
        0,
      );
      msgSeq.current += 1;
      const paymentUrl = `https://rzp.io/l/ord_${msgSeq.current}`;

      const botMsg: Message = {
        id: `bot-${msgSeq.current}`,
        sender: "assistant",
        text: `I checked store inventory at ${selectedStore.name}. The items are in stock and reserved for your order:`,
        cart: {
          items: matchedItems,
          total,
          paymentUrl,
        },
      };

      setMessages((prev) => [...prev, botMsg]);
    }, 600);
  };

  if (!selectedStore) {
    return (
      <StoreDirectory
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        onSelectStore={handleSelectStore}
      />
    );
  }

  return (
    <StoreChatView
      store={selectedStore}
      messages={messages}
      input={input}
      isTyping={isTyping}
      onInputChange={setInput}
      onSend={handleSend}
      onBack={() => setSelectedStore(null)}
    />
  );
}
