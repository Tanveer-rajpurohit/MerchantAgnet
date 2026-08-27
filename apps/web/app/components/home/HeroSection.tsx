import Link from "next/link";
import { Play } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="brand-glow w-full pt-28 sm:pt-36 pb-12 sm:pb-16 flex flex-col items-center border-b border-border">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1 text-xs font-medium font-intert text-secondary shadow-xs mb-6 sm:mb-8">
          <span>Built for:</span>
          <div className="flex items-center gap-1.5 font-semibold text-primary">
            <div className="flex h-4 w-4 items-center justify-center rounded-xs bg-brand/15 text-brand">
              <svg
                viewBox="0 0 24 24"
                width="11"
                height="11"
                fill="currentColor"
              >
                <path d="M22.436 0l-11.91 7.773-1.174 4.276 6.625-4.297L11.65 24h4.391l6.395-24zM14.26 10.098L3.389 17.166 1.564 24h9.008l3.688-13.902Z" />
              </svg>
            </div>
            <span>Razorpay Buildathon</span>
          </div>
        </div>

        <h1 className="w-full max-w-[820px] text-primary text-[32px] xs:text-[40px] sm:text-[54px] md:text-[68px] lg:text-[84px] font-normal leading-[1.08] font-instrument tracking-tight mb-5 sm:mb-6">
          Effortless custom commerce
          <br />
          by <span className="italic text-gradient-brand">MerchantAgent</span>
        </h1>

        <p className="w-full max-w-[540px] text-muted sm:text-lg md:text-xl leading-[1.45] font-intert font-normal mb-8 sm:mb-10">
          An AI agent that runs day-to-day growth actions for small Indian
          merchants: payment links, catalog sync, and gated campaigns.
        </p>

        <div className="flex items-center justify-center mb-10 sm:mb-14">
          <Link
            href="/merchant"
            className="h-11 sm:h-12 px-8 sm:px-10 py-2.5 bg-accent text-bg rounded-full flex justify-center items-center ring-1 ring-offset-2 ring-offset-bg ring-brand/30 hover:ring-brand/50 hover:opacity-90 active:scale-95 transition-all text-sm sm:text-[15px] font-medium font-intert"
          >
            Meet your assistant
          </Link>
        </div>

        <div className="w-full max-w-4xl mx-auto">
          <div className="relative w-full aspect-video rounded-2xl border border-border bg-surface overflow-hidden group cursor-pointer">
            <div className="absolute inset-0 bg-surface-muted flex flex-col items-center justify-center gap-4 transition-opacity group-hover:opacity-90">
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full text-white flex items-center justify-center shadow-lg shadow-brand/20 group-hover:scale-105 transition-transform"
                style={{ background: "var(--brand-gradient)" }}
              >
                <Play size={28} className="ml-1" />
              </div>
              <span className="text-sm sm:text-base font-medium font-intert text-muted">
                Watch Demo
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
