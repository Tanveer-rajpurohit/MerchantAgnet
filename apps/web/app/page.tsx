"use client";

import { useState } from "react";
import LoadingScreen from "./components/LoadingScreen";
import Navbar from "./components/Navbar";
import { LandingPage } from "./components/home";

export default function Page() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative min-h-screen bg-bg text-primary selection:bg-brand selection:text-white overflow-x-clip">
      <Navbar />
      <main className="overflow-x-clip">
        <LandingPage />
      </main>

      {isLoading && (
        <LoadingScreen onLoadComplete={() => setIsLoading(false)} />
      )}
    </div>
  );
}
