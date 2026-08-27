"use client";

import { useState } from "react";
import LoadingScreen from "./components/LoadingScreen";

export default function Page() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative">
      <main className="flex min-h-screen items-center justify-center bg-bg">
        <p className="text-lg text-muted font-satoshi">MerchantAgent</p>
      </main>

      {isLoading && (
        <LoadingScreen onLoadComplete={() => setIsLoading(false)} />
      )}
    </div>
  );
}