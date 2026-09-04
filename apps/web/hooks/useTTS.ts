"use client";

import { useCallback, useEffect, useState } from "react";
import { useVoiceStore } from "../stores/useVoiceStore";
import type { TTSStatus, UseTTSReturn } from "../types";

export function stripMarkdownForSpeech(text: string): { cleanText: string; detectedLang: string } {
  if (!text) return { cleanText: "", detectedLang: "hi-IN" };

  const emojiRegex = /\p{Extended_Pictographic}/gu;
  const withoutEmojis = text.replace(emojiRegex, "").replace(/\u200D|\uFE0F/g, "");

  const hindiRegex = /[\u0900-\u097F]/;
  const hinglishWords = /\b(hai|hain|ke|ka|ki|ko|se|mein|par|aur|karna|karo|hoga|hogi|hoge|aapka|aapke|aapki|rupaye|rupee|batao|diya|bheja|kya|nahi|chahiye|banao|bana|gaya|gayi|milega|lekin|abhi|aaj|kal|kitna|customer|order|stock|link|bhai|sir|namaste)\b/i;
  const isHindiOrHinglish = hindiRegex.test(withoutEmojis) || hinglishWords.test(withoutEmojis);
  const detectedLang = isHindiOrHinglish ? "hi-IN" : "en-IN";

  const clean = withoutEmojis
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/https?:\/\/[^\s)"'<>]+/g, "link")
    .replace(/(\|[^\n]+\|)/g, " ")
    .replace(/^#+\s+/gm, "")
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(\*|_)(.*?)\1/g, "$2")
    .replace(/~~(.*?)~~/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/₹\s*([\d,]+(?:\.\d+)?)/g, isHindiOrHinglish ? "$1 rupaye" : "$1 rupees")
    .replace(/Rs\.?\s*([\d,]+(?:\.\d+)?)/gi, isHindiOrHinglish ? "$1 rupaye" : "$1 rupees")
    .replace(/[#*_~`>|]/g, " ")
    .replace(/[\r\n]+/g, ". ")
    .replace(/,\s*,+/g, ", ")
    .replace(/\.\s*\.+/g, ". ")
    .replace(/\s+/g, " ")
    .trim();

  return { cleanText: clean, detectedLang };
}

let globalAudio: HTMLAudioElement | null = null;
let globalController: AbortController | null = null;
let globalActiveId: string | null = null;
let globalStatus: TTSStatus = "idle";
const stateListeners = new Set<(state: { status: TTSStatus; activeId: string | null }) => void>();

function notify(status: TTSStatus, activeId: string | null) {
  globalStatus = status;
  globalActiveId = activeId;
  stateListeners.forEach((fn) => fn({ status, activeId }));
}

function stopGlobalAudio() {
  if (globalController) {
    globalController.abort();
    globalController = null;
  }
  if (globalAudio) {
    globalAudio.pause();
    globalAudio.currentTime = 0;
    globalAudio.src = "";
    globalAudio = null;
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
  notify("idle", null);
}

export function useTTS(): UseTTSReturn {
  const [status, setStatus] = useState<TTSStatus>(globalStatus);
  const [activeId, setActiveId] = useState<string | null>(globalActiveId);

  useEffect(() => {
    const listener = (s: { status: TTSStatus; activeId: string | null }) => {
      setStatus(s.status);
      setActiveId(s.activeId);
    };
    stateListeners.add(listener);
    return () => {
      stateListeners.delete(listener);
    };
  }, []);

  const supported = typeof window !== "undefined";

  const stop = useCallback(() => {
    stopGlobalAudio();
  }, []);

  const speak = useCallback(
    async (text: string, customLang?: string, customVoice?: string, messageId?: string) => {
      const targetId = messageId || text.slice(0, 32);

      if (globalActiveId === targetId && (globalStatus === "speaking" || globalStatus === "loading")) {
        stopGlobalAudio();
        return;
      }

      stopGlobalAudio();

      const { cleanText, detectedLang } = stripMarkdownForSpeech(text);
      if (!cleanText) return;

      const langToUse = customLang || detectedLang;
      const voiceToUse = customVoice || useVoiceStore.getState().selectedVoice || "en-IN-PrabhatNeural";

      const controller = new AbortController();
      globalController = controller;
      notify("loading", targetId);

      try {
        const res = await fetch(
          `/api/tts?text=${encodeURIComponent(cleanText)}&lang=${encodeURIComponent(langToUse)}&voice=${encodeURIComponent(voiceToUse)}`,
          { signal: controller.signal }
        );

        if (res.ok) {
          const blob = await res.blob();
          if (controller.signal.aborted) return;

          const audioUrl = URL.createObjectURL(blob);
          const audio = new Audio(audioUrl);
          globalAudio = audio;

          audio.onplay = () => {
            notify("speaking", targetId);
          };
          audio.onended = () => {
            if (globalAudio === audio) {
              globalAudio = null;
              notify("idle", null);
            }
            URL.revokeObjectURL(audioUrl);
          };
          audio.onerror = () => {
            if (globalAudio === audio) {
              globalAudio = null;
              notify("error", null);
            }
            URL.revokeObjectURL(audioUrl);
          };

          await audio.play();
          return;
        }
      } catch (err: unknown) {
        if ((err as Error)?.name === "AbortError") return;
      }

      try {
        const edgeServiceRes = await fetch(
          `http://localhost:3004/api/tts?text=${encodeURIComponent(cleanText)}&lang=${encodeURIComponent(langToUse)}&voice=${encodeURIComponent(voiceToUse)}`,
          { signal: controller.signal }
        );
        if (edgeServiceRes.ok) {
          const blob = await edgeServiceRes.blob();
          if (controller.signal.aborted) return;

          const audioUrl = URL.createObjectURL(blob);
          const audio = new Audio(audioUrl);
          globalAudio = audio;

          audio.onplay = () => {
            notify("speaking", targetId);
          };
          audio.onended = () => {
            if (globalAudio === audio) {
              globalAudio = null;
              notify("idle", null);
            }
            URL.revokeObjectURL(audioUrl);
          };
          audio.onerror = () => {
            if (globalAudio === audio) {
              globalAudio = null;
              notify("error", null);
            }
            URL.revokeObjectURL(audioUrl);
          };
          await audio.play();
          return;
        }
      } catch (err: unknown) {
        if ((err as Error)?.name === "AbortError") return;
      }

      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        try {
          const utterance = new SpeechSynthesisUtterance(cleanText);
          utterance.lang = langToUse;
          utterance.rate = 1.0;
          utterance.onstart = () => {
            notify("speaking", targetId);
          };
          utterance.onend = () => {
            notify("idle", null);
          };
          utterance.onerror = () => {
            notify("error", null);
          };
          window.speechSynthesis.speak(utterance);
          return;
        } catch {
          notify("error", null);
        }
      }

      notify("error", null);
    },
    []
  );

  return {
    speak,
    stop,
    status,
    speaking: status === "speaking",
    activeId,
    supported,
  };
}
