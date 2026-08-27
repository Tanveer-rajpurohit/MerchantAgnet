"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface Testimonial {
  quote: string;
  name: string;
  company: string;
}

export default function TestimonialsSection() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const testimonials: Testimonial[] = [
    {
      quote:
        "MerchantAgent transformed how we handle customer WhatsApp orders. The agent generates verified payment links in seconds without manual calculation.",
      name: "Rajesh Sharma",
      company: "Owner, Sharma Kirana Store · Bengaluru",
    },
    {
      quote:
        "The approval gate on campaign batches is a lifesaver. We drafted a festival discount for 200 customers, reviewed the total exposure, and dispatched it in one click.",
      name: "Pooja Mehta",
      company: "Founder, Bloom Organic D2C · Mumbai",
    },
    {
      quote:
        "Exposing our catalog as an MCP tool allowed external AI shopping assistants to find our products and close real orders automatically.",
      name: "Vikram Malhotra",
      company: "Operations Lead, SpiceCraft · Delhi",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
        setTimeout(() => {
          setIsTransitioning(false);
        }, 100);
      }, 300);
    }, 9000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  const handleNavigation = (index: number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveTestimonial(index);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 100);
    }, 300);
  };

  const current = testimonials[activeTestimonial];

  return (
    <section className="w-full border-b border-border bg-surface/50">
      <div className="w-full max-w-6xl mx-auto border-x border-border py-12 sm:py-16 px-6 sm:px-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 min-h-[260px] sm:min-h-[230px] md:min-h-[210px]">
          <div className="flex-1 max-w-3xl flex flex-col justify-between self-stretch">
            <div
              className="text-primary text-2xl sm:text-3xl md:text-4xl font-normal font-instrument leading-snug tracking-tight min-h-[170px] sm:min-h-[150px] md:min-h-[140px] flex items-start"
              style={{
                filter: isTransitioning ? "blur(4px)" : "blur(0px)",
                transition: "filter 0.4s ease-in-out",
              }}
            >
              "{current.quote}"
            </div>

            <div
              className="flex flex-col gap-0.5 pt-2"
              style={{
                filter: isTransitioning ? "blur(4px)" : "blur(0px)",
                transition: "filter 0.4s ease-in-out",
              }}
            >
              <div className="text-primary text-base font-semibold font-intert">
                {current.name}
              </div>
              <div className="text-muted text-sm font-intert">
                {current.company}
              </div>
            </div>
          </div>

          <div className="flex gap-2.5 self-end shrink-0 pb-1">
            <button
              onClick={() =>
                handleNavigation(
                  (activeTestimonial - 1 + testimonials.length) %
                    testimonials.length,
                )
              }
              className="w-10 h-10 rounded-full border border-border bg-surface flex items-center justify-center hover:opacity-75 active:scale-95 transition-all shadow-xs"
              aria-label="Previous testimonial"
            >
              <ArrowLeft size={16} className="text-primary" />
            </button>
            <button
              onClick={() =>
                handleNavigation((activeTestimonial + 1) % testimonials.length)
              }
              className="w-10 h-10 rounded-full border border-border bg-surface flex items-center justify-center hover:opacity-75 active:scale-95 transition-all shadow-xs"
              aria-label="Next testimonial"
            >
              <ArrowRight size={16} className="text-primary" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
