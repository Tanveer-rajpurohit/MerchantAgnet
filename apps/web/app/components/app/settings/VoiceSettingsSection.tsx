"use client";

import { useState, useRef, useEffect } from "react";
import { Volume2, Square, Check, Sparkles } from "lucide-react";
import { useVoiceStore, AVAILABLE_VOICES } from "../../../../stores";
import type { VoiceOption } from "../../../../types";

export function VoiceSettingsSection() {
  const { selectedVoice, setSelectedVoice } = useVoiceStore();
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setPlayingVoiceId(null);
  };

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  const handlePreview = async (e: React.MouseEvent, voice: VoiceOption) => {
    e.stopPropagation();

    if (playingVoiceId === voice.id) {
      stopAudio();
      return;
    }

    stopAudio();
    setPlayingVoiceId(voice.id);

    try {
      const url = `/api/tts?text=${encodeURIComponent(voice.previewText)}&voice=${encodeURIComponent(voice.id)}`;
      const res = await fetch(url);
      if (!res.ok) {
        setPlayingVoiceId(null);
        return;
      }
      const blob = await res.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setPlayingVoiceId(null);
        URL.revokeObjectURL(audioUrl);
      };
      audio.onerror = () => {
        setPlayingVoiceId(null);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch {
      setPlayingVoiceId(null);
    }
  };

  return (
    <section className="rounded-2xl border border-border bg-surface p-6 font-intert">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-medium text-primary">
              AI Voice & Speech
            </h2>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand/10 text-brand text-[10px] font-medium border border-brand/20">
              <Sparkles size={10} />
              Neural Edge
            </span>
          </div>
          <p className="text-xs text-muted mt-0.5">
            Select the voice used by MerchantAgent when reading messages, summaries, and store actions.
          </p>
        </div>
      </div>

      <div className="space-y-2.5">
        {AVAILABLE_VOICES.map((voice) => {
          const isSelected = selectedVoice === voice.id;
          const isPlaying = playingVoiceId === voice.id;

          return (
            <div
              key={voice.id}
              onClick={() => setSelectedVoice(voice.id)}
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? "border-brand bg-brand/5 shadow-xs"
                  : "border-border bg-bg hover:bg-surface-muted hover:border-border/80"
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={`w-5 h-5 rounded-full border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? "border-brand bg-brand text-white"
                      : "border-border bg-surface"
                  }`}
                >
                  {isSelected && <Check size={12} strokeWidth={3} />}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-primary">
                      {voice.name}
                    </span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-surface-muted text-secondary border border-border">
                      {voice.gender === "female" ? "Female" : "Male"}
                    </span>
                    <span className="text-[10px] text-muted font-mono">
                      {voice.accent}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted mt-1 leading-relaxed">
                    {voice.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={(e) => handlePreview(e, voice)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    isPlaying
                      ? "bg-brand text-white shadow-xs"
                      : "border border-border bg-surface hover:bg-surface-muted text-secondary hover:text-primary"
                  }`}
                  title={isPlaying ? "Stop audio preview" : "Hear voice preview"}
                >
                  {isPlaying ? (
                    <>
                      <Square size={12} fill="currentColor" />
                      <span>Stop</span>
                    </>
                  ) : (
                    <>
                      <Volume2 size={13} className={isSelected ? "text-brand" : "text-muted"} />
                      <span>Preview</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
