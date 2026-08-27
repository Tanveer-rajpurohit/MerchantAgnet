"use client";

import { useState, useEffect, useRef } from "react";
import HeroSection from "./HeroSection";
import InfoSection from "./InfoSection";
import FeatureCarousel from "./FeatureCarousel";
import SocialProofSection from "./SocialProofSection";
import TestimonialsSection from "./TestimonialsSection";
import PricingSection from "./PricingSection";
import FAQSection from "./FAQSection";
import CTASection from "./CTASection";
import FooterSection from "./FooterSection";

export default function LandingPage() {
  const [activeCard, setActiveCard] = useState(0);
  const [progress, setProgress] = useState(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      if (!mountedRef.current) return;

      setProgress((prev) => {
        if (prev >= 100) {
          if (mountedRef.current) {
            setActiveCard((current) => (current + 1) % 3);
          }
          return 0;
        }
        return prev + 2;
      });
    }, 100);

    return () => {
      clearInterval(progressInterval);
      mountedRef.current = false;
    };
  }, []);

  const handleCardClick = (index: number) => {
    if (!mountedRef.current) return;
    setActiveCard(index);
    setProgress(0);
  };

  return (
    <div className="w-full relative bg-bg text-primary flex flex-col items-center overflow-x-clip">
      <HeroSection />
      <InfoSection />
      <FeatureCarousel
        activeCard={activeCard}
        progress={progress}
        onCardClick={handleCardClick}
      />
      <SocialProofSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <FooterSection />
    </div>
  );
}
