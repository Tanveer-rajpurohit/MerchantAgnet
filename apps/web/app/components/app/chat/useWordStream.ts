"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { ChatMessageData } from "../../../types";

const WORDS_PER_TICK = 2;
const TICK_MS = 14;

export function useWordStream() {
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const fullDataRef = useRef<ChatMessageData | null>(null);
  const wordsRef = useRef<string[]>([]);
  const indexRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const setMsgsRef = useRef<React.Dispatch<
    React.SetStateAction<ChatMessageData[]>
  > | null>(null);

  const cleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const startStream = useCallback(
    (
      fullMessage: ChatMessageData,
      setMessages: React.Dispatch<React.SetStateAction<ChatMessageData[]>>,
    ) => {
      cleanup();

      fullDataRef.current = fullMessage;
      setMsgsRef.current = setMessages;
      wordsRef.current = fullMessage.content.split(" ");
      indexRef.current = 0;

      const partial: ChatMessageData = {
        ...fullMessage,
        content: "",
        paymentLink: undefined,
        catalogStock: undefined,
        campaignGate: undefined,
        revenueSummary: undefined,
      };

      setMessages((prev) => [...prev, partial]);
      setStreamingId(fullMessage.id);

      intervalRef.current = setInterval(() => {
        indexRef.current = Math.min(
          indexRef.current + WORDS_PER_TICK,
          wordsRef.current.length,
        );

        const text = wordsRef.current.slice(0, indexRef.current).join(" ");
        const done = indexRef.current >= wordsRef.current.length;

        if (done) {
          cleanup();
          setMsgsRef.current?.((prev) =>
            prev.map((m) =>
              m.id === fullDataRef.current!.id ? fullDataRef.current! : m,
            ),
          );
          setStreamingId(null);
        } else {
          setMsgsRef.current?.((prev) =>
            prev.map((m) =>
              m.id === fullDataRef.current!.id ? { ...m, content: text } : m,
            ),
          );
        }
      }, TICK_MS);
    },
    [cleanup],
  );

  const stopStream = useCallback(() => {
    cleanup();
    setStreamingId(null);
  }, [cleanup]);

  return { startStream, stopStream, streamingId };
}
