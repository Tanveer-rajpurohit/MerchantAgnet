"use client";

import Link from "next/link";
import { useAuth } from "../../../context/AuthContext";

export default function CTASection() {
  const { user, isAuthenticated, isOnboarded } = useAuth();
  const destination = !isAuthenticated ? "/register" : user?.role === "merchant" ? (isOnboarded ? "/dashboard" : "/onboarding") : "/user";

  return (
    <section className="brand-glow w-full border-b border-border py-16 sm:py-24">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center gap-6">
        <div className="space-y-3">
          <div className="text-primary text-3xl md:text-5xl font-normal font-instrument tracking-tight">
            Start growing your store today
          </div>
          <div className="text-muted text-sm sm:text-base font-intert">
            Set up in under 2 minutes. No credit card required.
          </div>
        </div>
        <Link
          href={destination}
          className="btn-brand-solid h-12 px-10 rounded-xl shadow-xs flex justify-center items-center text-sm font-medium font-intert active:scale-95 transition-all"
        >
          {isAuthenticated ? "Go to Dashboard" : "Get started free"}
        </Link>
      </div>
    </section>
  );
}
