"use client";

import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

interface ThemeToggleProps {
  className?: string;
  inline?: boolean;
}

export default function ThemeToggle({
  className = "",
  inline = false,
}: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const raysRef = useRef<SVGGElement>(null);
  const centerRef = useRef<SVGCircleElement>(null);
  const maskRef = useRef<SVGCircleElement>(null);
  const isInitial = useRef(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = theme === "system" ? resolvedTheme : theme;
  const isDark = currentTheme === "dark";

  useEffect(() => {
    if (!mounted) return;

    if (isInitial.current) {
      isInitial.current = false;
      if (isDark) {
        gsap.set(raysRef.current, {
          scale: 0,
          opacity: 0,
          rotation: -45,
          transformOrigin: "50% 50%",
        });
        gsap.set(centerRef.current, {
          attr: { r: 9 },
          rotation: 20,
          transformOrigin: "50% 50%",
        });
        gsap.set(maskRef.current, { attr: { cx: 17, cy: 7, r: 7 } });
      } else {
        gsap.set(raysRef.current, {
          scale: 1,
          opacity: 1,
          rotation: 0,
          transformOrigin: "50% 50%",
        });
        gsap.set(centerRef.current, {
          attr: { r: 5 },
          rotation: 0,
          transformOrigin: "50% 50%",
        });
        gsap.set(maskRef.current, { attr: { cx: 24, cy: 0, r: 0 } });
      }
      return;
    }

    if (isDark) {
      gsap.to(raysRef.current, {
        scale: 0,
        opacity: 0,
        rotation: -45,
        transformOrigin: "50% 50%",
        duration: 0.35,
        ease: "power2.inOut",
      });
      gsap.to(centerRef.current, {
        attr: { r: 9 },
        rotation: 20,
        transformOrigin: "50% 50%",
        duration: 0.35,
        ease: "back.out(1.5)",
      });
      gsap.to(maskRef.current, {
        attr: { cx: 17, cy: 7, r: 7 },
        duration: 0.35,
        ease: "power2.out",
      });
    } else {
      gsap.to(raysRef.current, {
        scale: 1,
        opacity: 1,
        rotation: 0,
        transformOrigin: "50% 50%",
        duration: 0.35,
        ease: "back.out(1.7)",
      });
      gsap.to(centerRef.current, {
        attr: { r: 5 },
        rotation: 0,
        transformOrigin: "50% 50%",
        duration: 0.35,
        ease: "power2.out",
      });
      gsap.to(maskRef.current, {
        attr: { cx: 24, cy: 0, r: 0 },
        duration: 0.35,
        ease: "power2.in",
      });
    }
  }, [isDark, mounted]);

  if (!mounted) {
    return (
      <div
        className={`h-9 w-9 ${inline ? "" : "fixed top-5 right-5 z-40"} ${className}`}
      />
    );
  }

  const basePosClass = inline ? "" : "fixed top-5 right-5 z-40";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-primary transition-transform active:scale-95 hover:border-brand/40 ${basePosClass} ${className}`}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        <mask id="theme-toggle-mask">
          <rect x="0" y="0" width="100%" height="100%" fill="white" />
          <circle ref={maskRef} cx="24" cy="0" r="0" fill="black" />
        </mask>
        <circle
          ref={centerRef}
          cx="12"
          cy="12"
          r="5"
          fill="currentColor"
          mask="url(#theme-toggle-mask)"
        />
        <g
          ref={raysRef}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </g>
      </svg>
    </button>
  );
}
