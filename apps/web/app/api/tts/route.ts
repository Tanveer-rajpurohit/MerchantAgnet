import { NextRequest, NextResponse } from "next/server";
import { EdgeTTS } from "node-edge-tts";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";

export const runtime = "nodejs";

const VOICE_MAP: Record<string, string> = {
  "en-IN-prabhat": "en-IN-PrabhatNeural",
  "en-IN": "en-IN-PrabhatNeural",
  "hi-IN": "hi-IN-MadhurNeural",
  "hi-IN-madhur": "hi-IN-MadhurNeural",
  "hi-IN-swara": "hi-IN-SwaraNeural",
  "en-IN-neerja": "en-IN-NeerjaExpressiveNeural",
  "ta-IN": "ta-IN-ValluvarNeural",
  "te-IN": "te-IN-MohanNeural",
  "mr-IN": "mr-IN-ManoharNeural",
  "bn-IN": "bn-IN-BashkarNeural",
  "gu-IN": "gu-IN-NiranjanNeural",
};

function pickVoice(lang: string | null, customVoice?: string | null): string {
  if (customVoice && (customVoice.endsWith("Neural") || VOICE_MAP[customVoice])) {
    return VOICE_MAP[customVoice] || customVoice;
  }
  if (!lang) return "en-IN-PrabhatNeural";
  if (VOICE_MAP[lang]) return VOICE_MAP[lang];
  const family = lang.split("-")[0];
  const match = Object.keys(VOICE_MAP).find((k) => k.startsWith(family + "-"));
  return (match && VOICE_MAP[match]) || "en-IN-PrabhatNeural";
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const text = searchParams.get("text");
  const lang = searchParams.get("lang") || "en-IN";
  const customVoice = searchParams.get("voice");
  const rate = searchParams.get("rate") || "+5%";
  const pitch = searchParams.get("pitch") || "+0Hz";

  if (!text || !text.trim()) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  const cleanText = text
    .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}\u{200D}\u{FE0F}]/gu, "")
    .replace(/[\r\n]+/g, ". ")
    .replace(/,\s*,+/g, ", ")
    .replace(/\.\s*\.+/g, ". ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 1500);

  if (!cleanText) {
    return NextResponse.json({ error: "text is empty after cleaning" }, { status: 400 });
  }

  const voice = pickVoice(lang, customVoice);
  const tempFile = path.join(os.tmpdir(), `tts-${crypto.randomBytes(8).toString("hex")}.mp3`);

  try {
    const tts = new EdgeTTS({
      voice,
      rate,
      volume: "+0%",
      pitch,
    });

    await tts.ttsPromise(cleanText, tempFile);

    const audioData = fs.readFileSync(tempFile);
    fs.unlinkSync(tempFile);

    return new Response(audioData, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(audioData.length),
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    if (fs.existsSync(tempFile)) {
      try {
        fs.unlinkSync(tempFile);
      } catch {}
    }
    console.error("[api/tts] EdgeTTS error:", err);
    return NextResponse.json({ error: "TTS synthesis failed", detail: String(err) }, { status: 500 });
  }
}
