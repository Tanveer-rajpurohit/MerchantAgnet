"use client";

import Link from "next/link";

export default function CTASection() {
  return (
    <section className="w-full border-b border-border py-12 sm:py-16">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center gap-6">
        <div className="space-y-2">
          <div className="text-primary text-3xl md:text-5xl font-normal font-instrument tracking-tight">
            Ready to transform your merchant growth?
          </div>
          <div className="text-muted text-sm sm:text-base font-intert">
            Join thousands of businesses automating payment links, campaigns,
            and catalog sync.
          </div>
        </div>
        <Link
          href="/merchant"
          className="h-11 px-10 bg-accent text-bg shadow-sm rounded-full flex justify-center items-center text-sm font-medium font-intert hover:opacity-90 active:scale-95 transition-all"
        >
          Start for free
        </Link>
      </div>
    </section>
  );
}
