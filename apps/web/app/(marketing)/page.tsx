"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import LoadingScreen from "../components/LoadingScreen";
import Navbar from "../components/Navbar";
import { LandingPage } from "../components/home";
import SmoothScroll from "../components/SmoothScroll";

export default function Page() {
  const { isAuthenticated, user, isOnboarded, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (!isOnboarded && user.role === "merchant") {
        router.replace("/onboarding");
      }
    }
  }, [isAuthenticated, user, isOnboarded, isLoading, router]);

  return (
    <SmoothScroll>
      <div className="relative min-h-screen bg-bg text-primary selection:bg-brand selection:text-white overflow-x-clip">
        <Navbar />
        <main className="overflow-x-clip">
          <LandingPage />
        </main>
        <LoadingScreen />
      </div>
    </SmoothScroll>
  );
}
