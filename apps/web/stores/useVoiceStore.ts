import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { VoiceOption, VoiceState } from "../types";

export const AVAILABLE_VOICES: VoiceOption[] = [
  {
    id: "en-IN-PrabhatNeural",
    name: "Prabhat",
    label: "Prabhat (Male, Indian English) — Default",
    gender: "male",
    accent: "Indian English & Hinglish",
    description: "Crisp, fast, and natural Indian voice. Recommended default.",
    previewText: "Hello! Daily store revenue and product catalog metrics have been synced.",
  },
  {
    id: "hi-IN-MadhurNeural",
    name: "Madhur",
    label: "Madhur (Male, Conversational)",
    gender: "male",
    accent: "Hindi & Hinglish",
    description: "Natural, conversational male voice with warm store tone.",
    previewText: "नमस्ते! मैं आपका स्टोर कोपायलट हूँ। आज के ऑर्डर्स और पेमेंट अपडेटेड हैं।",
  },
  {
    id: "hi-IN-SwaraNeural",
    name: "Swara",
    label: "Swara (Female, Clear & Warm)",
    gender: "female",
    accent: "Hindi & Hinglish",
    description: "Clear, warm and friendly female voice for Hindi & Hinglish.",
    previewText: "नमस्ते! मैं आपकी दुकान का मर्चेंट एजेंट हूँ। आपका पेमेंट लिंक तैयार है।",
  },
  {
    id: "en-IN-NeerjaExpressiveNeural",
    name: "Neerja",
    label: "Neerja Expressive (Female, Hinglish)",
    gender: "female",
    accent: "Indian English & Hinglish",
    description: "Highly expressive, best for mixed English and Hindi conversations.",
    previewText: "Hello! Your payment link and store summary are ready to share with customers.",
  },
];

export const useVoiceStore = create<VoiceState>()(
  persist(
    (set) => ({
      selectedVoice: "en-IN-PrabhatNeural",
      setSelectedVoice: (voiceId: string) => set({ selectedVoice: voiceId }),
    }),
    {
      name: "merchant_agent_tts_voice",
    }
  )
);
