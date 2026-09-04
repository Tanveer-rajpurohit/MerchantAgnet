"use client";

import { useEffect, useRef, useCallback } from "react";
import type { UseAutoScrollOptions } from "../types";

export function useAutoScroll<T extends HTMLElement = HTMLDivElement>({
  threshold = 80,
  deps = [],
}: UseAutoScrollOptions = {}) {
  const scrollRef = useRef<T | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const isAtBottomRef = useRef(true);
  const isFirstLoadRef = useRef(true);

  const onUserScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const distanceFromBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight;
    isAtBottomRef.current = distanceFromBottom < threshold;
  }, [threshold]);

  const scrollToBottom = useCallback(
    (behavior: ScrollBehavior = "smooth") => {
      const el = scrollRef.current;
      if (!el) return;
      el.scrollTo({ top: el.scrollHeight, behavior });
      isAtBottomRef.current = true;
    },
    []
  );

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    if (isFirstLoadRef.current) {
      isFirstLoadRef.current = false;
      el.scrollTop = el.scrollHeight;
      isAtBottomRef.current = true;
      return;
    }

    if (isAtBottomRef.current) {
      endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, deps);

  return {
    scrollRef,
    endRef,
    scrollToBottom,
    onUserScroll,
    isAtBottom: () => isAtBottomRef.current,
  };
}
