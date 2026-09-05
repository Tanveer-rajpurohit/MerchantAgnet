"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { HERO_REVEAL_EVENT } from "../LoadingScreen";
import { useAuth } from "../../../context/AuthContext";

const LINE_1 = ["Effortless", "custom", "commerce"];
const LINE_2 = ["by"];

export default function HeroSection() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const revealedRef = useRef(false);
  const { user, isAuthenticated, isOnboarded } = useAuth();

  useEffect(() => {
    if (!titleRef.current) return;
    if (revealedRef.current) return;

    const words = titleRef.current.querySelectorAll<HTMLElement>(".hero-word");
    gsap.set(words, { yPercent: 110, opacity: 0 });

    const reveal = () => {
      if (revealedRef.current) return;
      revealedRef.current = true;
      window.removeEventListener(HERO_REVEAL_EVENT, reveal);

      gsap.to(words, {
        yPercent: 0,
        opacity: 1,
        duration: 0.9,
        ease: "power4.out",
        stagger: 0.045,
        clearProps: "transform,opacity",
      });
    };

    window.addEventListener(HERO_REVEAL_EVENT, reveal, { once: true });
    const fallbackId = window.setTimeout(reveal, 2400);

    return () => {
      window.clearTimeout(fallbackId);
      window.removeEventListener(HERO_REVEAL_EVENT, reveal);
    };
  }, []);

  const destination = !isAuthenticated ? "/login" : user?.role === "merchant" ? (isOnboarded ? "/chat" : "/onboarding") : "/user";

  return (
    <section className="brand-glow w-full pt-28 sm:pt-36 pb-12 sm:pb-16 flex flex-col items-center border-b border-border">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1 text-xs font-medium font-intert text-secondary shadow-xs mb-6 sm:mb-8">
          <span>Built for:</span>
          <div className="flex items-center gap-1.5 font-semibold text-primary">
            <div className="flex h-4 w-4 items-center justify-center rounded-xs bg-[#02042B] text-[#3395FF]">
              <svg
                viewBox="0 0 24 24"
                width="11"
                height="11"
                fill="currentColor"
              >
                <path d="M22.436 0l-11.91 7.773-1.174 4.276 6.625-4.297L11.65 24h4.391l6.395-24zM14.26 10.098L3.389 17.166 1.564 24h9.008l3.688-13.902Z" />
              </svg>
            </div>
            <span>Razorpay Buildathon</span>
          </div>
        </div>

        <h1
          ref={titleRef}
          className="w-full max-w-[820px] text-primary text-[32px] xs:text-[40px] sm:text-[54px] md:text-[68px] lg:text-[84px] font-normal leading-[1.08] font-instrument tracking-tight mb-5 sm:mb-6"
        >
          <span className="block overflow-hidden pb-1">
            {LINE_1.map((word) => (
              <span
                key={word}
                className="hero-word inline-block mr-[0.22em] last:mr-0"
              >
                {word}
              </span>
            ))}
          </span>
          <span className="block overflow-hidden pb-1">
            {LINE_2.map((word) => (
              <span key={word} className="hero-word inline-block mr-[0.22em]">
                {word}
              </span>
            ))}
            <span className="hero-word inline-block italic">MerchantAgent</span>
          </span>
        </h1>

        <p className="w-full max-w-[540px] text-muted sm:text-lg md:text-xl leading-[1.45] font-intert font-normal mb-8 sm:mb-10">
          An AI agent that runs day-to-day growth actions for small Indian
          merchants: payment links, catalog sync, and gated campaigns.
        </p>

        <div className="flex items-center justify-center mb-10 sm:mb-14">
          <Link
            href={destination}
            className="btn-brand-solid h-11 sm:h-12 px-8 sm:px-10 py-2.5 rounded-xl shadow-xs flex justify-center items-center active:scale-95 text-sm sm:text-[15px] font-medium font-intert"
          >
            Meet your assistant
          </Link>
        </div>


      </div>
    </section>
  );
}
