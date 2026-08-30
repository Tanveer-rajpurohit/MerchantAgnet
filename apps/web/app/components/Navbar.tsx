"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import { AgentOrb } from "./app/utils";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const [progress, setProgress] = useState(0);
  const { user, isAuthenticated, isOnboarded } = useAuth();

  useEffect(() => {
    let animationFrameId: number;

    const handleScroll = () => {
      animationFrameId = window.requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const startThreshold = 40;
        const scrollRange = 460;
        const effectiveScroll = Math.max(0, scrollY - startThreshold);
        const p = Math.min(1, Math.max(0, effectiveScroll / scrollRange));
        setProgress(p);
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const navMaxWidth = 1140 - progress * 500;
  const navMarginTop = 16 - progress * 4;
  const navPaddingY = 12 - progress * 4;
  const navPaddingX = 24 - progress * 6;

  const appDestination = !isAuthenticated ? "/login" : (user?.role === "merchant" ? (isOnboarded ? "/chat" : "/onboarding") : "/user");

  return (
    <header className="fixed top-0 left-0 right-0 z-40 pointer-events-none">
      <div className="mx-auto px-4 sm:px-6">
        <nav
          className="pointer-events-auto mx-auto flex items-center justify-between rounded-2xl border transition-[max-width,margin,padding,box-shadow,border-color,background-color,backdrop-filter] duration-200 ease-out"
          style={{
            maxWidth: `min(calc(100vw - 2rem), ${navMaxWidth}px)`,
            marginTop: `${navMarginTop}px`,
            paddingTop: `${navPaddingY}px`,
            paddingBottom: `${navPaddingY}px`,
            paddingLeft: `${navPaddingX}px`,
            paddingRight: `${navPaddingX}px`,
            backgroundColor: `color-mix(in srgb, var(--surface) ${Math.round(50 + progress * 40)}%, transparent)`,
            borderColor: `color-mix(in srgb, var(--border) ${Math.round(40 + progress * 55)}%, transparent)`,
            boxShadow:
              progress > 0.05
                ? `0px 4px 20px -2px color-mix(in srgb, var(--text-primary) ${Math.round(progress * 10)}%, transparent), 0px 0px 0px 1px var(--surface)`
                : "none",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
          }}
        >
          <div className="flex items-center gap-6 sm:gap-8">
            <Link
              href="/"
              className="flex items-center gap-2 text-primary font-instrument italic text-xl sm:text-2xl font-normal tracking-tight hover:opacity-85 transition-opacity"
            >
              <AgentOrb size={20} className="not-italic text-brand" />
              <span>MerchantAgent</span>
            </Link>

            <div className="hidden md:flex items-center gap-5 text-xs md:text-[13px] font-medium font-intert text-secondary">
              <Link
                href="#product"
                className="transition-colors hover:text-primary"
              >
                Products
              </Link>
              <Link
                href="#pricing"
                className="transition-colors hover:text-primary"
              >
                Pricing
              </Link>
              <Link
                href="#faq"
                className="transition-colors hover:text-primary"
              >
                Docs
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <ThemeToggle inline />
            <Link
              href={appDestination}
              className="px-4 py-1.5 bg-brand text-white shadow-xs rounded-xl flex justify-center items-center text-xs md:text-[13px] font-medium font-intert hover:opacity-90 active:scale-95 transition-all"
            >
              {isAuthenticated ? "Open App" : "Launch App"}
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
