import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import { URL } from "node:url";
import { EdgeTTS } from "node-edge-tts";

const PORT = 3004;

const VOICE_MAP: Record<string, string> = {
  "en-IN": "en-IN-PrabhatNeural",
  "hi-IN": "hi-IN-MadhurNeural",
  "hi-IN-female": "hi-IN-SwaraNeural",
  "ta-IN": "ta-IN-ValluvarNeural",
  "te-IN": "te-IN-MohanNeural",
  "mr-IN": "mr-IN-ManoharNeural",
  "bn-IN": "bn-IN-BashkarNeural",
  "gu-IN": "gu-IN-NiranjanNeural",
};

function pickVoice(lang: string | null): string {
  if (!lang) return VOICE_MAP["hi-IN"];
  if (VOICE_MAP[lang]) return VOICE_MAP[lang];
  const family = lang.split("-")[0];
  const match = Object.keys(VOICE_MAP).find((k) => k.startsWith(family + "-"));
  return match ? VOICE_MAP[match] : VOICE_MAP["hi-IN"];
}

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url || "/", `http://localhost:${PORT}`);

  if (parsedUrl.pathname === "/" || parsedUrl.pathname === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, service: "tts-service", port: PORT }));
    return;
  }

  if (parsedUrl.pathname !== "/api/tts") {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
    return;
  }

  const text = parsedUrl.searchParams.get("text");
  const lang = parsedUrl.searchParams.get("lang") || "hi-IN";

  if (!text || !text.trim()) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "text is required" }));
    return;
  }

  const cleanText = text.replace(/\s+/g, " ").trim().slice(0, 1500);
  const voice = pickVoice(lang);
  const tempFile = path.join(os.tmpdir(), `tts-${crypto.randomBytes(8).toString("hex")}.mp3`);

  try {
    const tts = new EdgeTTS({
      voice,
      rate: "+0%",
      volume: "+0%",
      pitch: "+0Hz",
    });

    await tts.ttsPromise(cleanText, tempFile);

    const audioData = fs.readFileSync(tempFile);
    fs.unlinkSync(tempFile);

    res.writeHead(200, {
      "Content-Type": "audio/mpeg",
      "Content-Length": audioData.length,
      "Cache-Control": "no-store",
    });
    res.end(audioData);
  } catch (err) {
    if (fs.existsSync(tempFile)) {
      try {
        fs.unlinkSync(tempFile);
      } catch {}
    }
    console.error("[tts-service] synthesis failed:", err);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "TTS synthesis failed", detail: String(err) }));
  }
});

server.listen(PORT, () => {
  console.log(`TTS service running on http://localhost:${PORT}`);
});
