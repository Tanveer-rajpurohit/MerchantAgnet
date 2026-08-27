"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Cpu } from "lucide-react";
import { Badge } from "../ui";

gsap.registerPlugin(ScrollTrigger);

export default function InfoSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const para1Ref = useRef<HTMLParagraphElement>(null);
  const para2Ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const p1Words = para1Ref.current?.querySelectorAll(".scroll-word");
      if (p1Words && p1Words.length > 0) {
        gsap.fromTo(
          p1Words,
          { opacity: 0.22, y: 2 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.03,
            ease: "none",
            scrollTrigger: {
              trigger: para1Ref.current,
              start: "top 85%",
              end: "bottom 45%",
              scrub: 0.5,
            },
          },
        );
      }

      const p2Words = para2Ref.current?.querySelectorAll(".scroll-word");
      if (p2Words && p2Words.length > 0) {
        gsap.fromTo(
          p2Words,
          { opacity: 0.22, y: 2 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.03,
            ease: "none",
            scrollTrigger: {
              trigger: para2Ref.current,
              start: "top 85%",
              end: "bottom 45%",
              scrub: 0.5,
            },
          },
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const text1 =
    "Traditional Indian retail runs on WhatsApp and memory, relying on manual UPI calculations and fragmented notebooks. MerchantAgent transforms daily commerce into an autonomous AI copilot generating verified Razorpay links in 3 seconds, tracking real-time inventory, and closing customer orders with zero friction.";

  const text2 =
    "Beyond speed, your physical catalog is exposed as a structured Model Context Protocol (MCP) server, allowing external buyer AI agents to discover and transact programmatically. Every campaign batch remains strictly governed by human approval gates, ensuring total merchant control.";

  const words1 = text1.split(" ");
  const words2 = text2.split(" ");

  return (
    <section
      id="product"
      ref={containerRef}
      className="w-full border-b border-border bg-bg relative overflow-hidden"
    >
      <div className="w-full max-w-6xl mx-auto border-x border-border py-20 sm:py-28 md:py-36 px-6 sm:px-12 md:px-16 flex flex-col items-start gap-14 sm:gap-18">
        <div className="flex items-center gap-3">
          <Badge icon={<Cpu size={12} />} text="Architecture & Vision" />
          <span className="text-xs font-mono text-muted hidden sm:inline">
            Claude Agent SDK · Razorpay · MCP
          </span>
        </div>

        <div className="flex flex-col gap-14 sm:gap-20 max-w-4xl">
          <p
            ref={para1Ref}
            className="text-2xl sm:text-3xl md:text-[42px] lg:text-[50px] font-normal font-instrument leading-[1.3] text-primary tracking-tight"
          >
            {words1.map((word, idx) => (
              <span
                key={idx}
                className="scroll-word inline-block mr-2 sm:mr-3 mb-1"
              >
                {word}
              </span>
            ))}
          </p>

          <div className="w-full h-[1px] bg-border/80" />

          <p
            ref={para2Ref}
            className="text-2xl sm:text-3xl md:text-[42px] lg:text-[50px] font-normal font-instrument leading-[1.3] text-primary tracking-tight"
          >
            {words2.map((word, idx) => (
              <span
                key={idx}
                className="scroll-word inline-block mr-2 sm:mr-3 mb-1"
              >
                {word}
              </span>
            ))}
          </p>
        </div>
      </div>
    </section>
  );
}
