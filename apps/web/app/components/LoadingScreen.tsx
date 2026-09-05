"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

interface LoadingScreenProps {
  onLoadComplete?: () => void;
}

const GREETINGS = [
  "Hello",
  "नमस्ते",
  "স্বাগত",
  "வணக்கம்",
  "સ્વાગત",
  "ਸਤ ਸ੍ਰੀ ਅਕਾਲ",
];

const BAR_COUNT = 30;
const BAR_WIDTHS = Array.from({ length: BAR_COUNT }, (_, i) => {
  const seed = ((i * 17 + 7) % 40) + 6;
  return seed;
});

const STEP_DURATION = 0.2;
const REPEAT_COUNT = GREETINGS.length - 1;
const TOTAL_DURATION = STEP_DURATION * (REPEAT_COUNT + 1);
const BAR_GHOST_OPACITY = 0.2;
const EXIT_DURATION = 0.6;
const HERO_REVEAL_LEAD = 0.45;

export const HERO_REVEAL_EVENT = "mag:hero-reveal";

export default function LoadingScreen({ onLoadComplete }: LoadingScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const barsRef = useRef<HTMLDivElement>(null);
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const perBar = TOTAL_DURATION / BAR_COUNT;

      const tl = gsap.timeline({
        onComplete: () => {
          onLoadComplete?.();
        },
      });

      tl.to(
        containerRef.current,
        {
          duration: STEP_DURATION,
          repeat: REPEAT_COUNT,
          ease: "sine.inOut",
          onRepeat: () => {
            setWordIndex((prev) =>
              prev < GREETINGS.length - 1 ? prev + 1 : prev,
            );
          },
        },
        0,
      );

      const bars = barsRef.current?.children;
      if (bars) {
        tl.to(
          Array.from(bars).reverse(),
          {
            opacity: 1,
            duration: perBar,
            stagger: perBar,
            ease: "power2.out",
          },
          0,
        );
      }

      tl.to(
        containerRef.current,
        {
          yPercent: -100,
          duration: EXIT_DURATION,
          ease: "power3.inOut",
        },
        TOTAL_DURATION,
      );

      tl.call(
        () => {
          window.dispatchEvent(new Event(HERO_REVEAL_EVENT));
        },
        [],
        TOTAL_DURATION + EXIT_DURATION - HERO_REVEAL_LEAD,
      );

      tl.set(
        containerRef.current,
        {
          display: "none",
        },
        TOTAL_DURATION + EXIT_DURATION,
      );
    }, containerRef);

    return () => ctx.revert();
  }, [onLoadComplete]);

  return (
    <div ref={containerRef} className="fixed inset-0 z-50 bg-bg">
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
        <h1 className="select-none text-4xl font-light text-primary font-intert">
          {GREETINGS[wordIndex]}
        </h1>
        <div
          className="h-[2px] w-8 rounded-full"
          style={{ background: "var(--brand-gradient)" }}
        />
      </div>

      <div className="absolute right-6 top-1/2 -translate-y-1/2 md:right-10">
        <div
          ref={barsRef}
          className="flex h-[60vh] flex-col justify-between items-end"
        >
          {BAR_WIDTHS.map((width, i) => (
            <div
              key={i}
              style={{
                width,
                height: 2,
                backgroundColor: "var(--loader-fill)",
                opacity: BAR_GHOST_OPACITY,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
