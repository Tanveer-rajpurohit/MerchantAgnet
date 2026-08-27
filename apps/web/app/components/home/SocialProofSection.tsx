"use client";

import { Sparkles } from "lucide-react";
import { Badge } from "../ui";

export default function SocialProofSection() {
  const partners = [
    "Sharma Kirana",
    "SpiceCraft D2C",
    "Acrocraft Store",
    "Bloom Organic",
    "Kerala Organics",
    "Jaipur Handlooms",
    "Metro Electronics",
    "City Fresh",
  ];

  return (
    <section className="w-full border-b border-border">
      <div className="w-full max-w-6xl mx-auto border-x border-border">
        <div className="py-12 sm:py-16 px-4 sm:px-6 flex flex-col items-center text-center border-b border-border">
          <Badge icon={<Sparkles size={12} />} text="Social Proof" />
          <div className="text-primary text-2xl sm:text-3xl md:text-5xl font-semibold leading-tight font-instrument tracking-tight mt-3 mb-2">
            Confidence backed by results
          </div>
          <div className="text-muted text-sm sm:text-base font-normal font-intert max-w-xl">
            Indian merchants achieve more each day with simple, bounded, and
            explainable agentic tools.
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4">
          {partners.map((partner, idx) => (
            <div
              key={idx}
              className="p-6 sm:p-8 flex items-center justify-center border-r border-b border-border last:border-r-0 text-xs sm:text-sm font-semibold font-intert text-secondary"
            >
              {partner}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
