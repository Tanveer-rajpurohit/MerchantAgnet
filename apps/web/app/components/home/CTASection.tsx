import Link from "next/link";

export default function CTASection() {
  return (
    <section className="w-full border-b border-border py-16 sm:py-24">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center gap-6">
        <div className="space-y-3">
          <div className="text-primary text-3xl md:text-5xl font-normal font-instrument tracking-tight">
            Start growing your store today
          </div>
          <div className="text-muted text-sm sm:text-base font-intert">
            Set up in under 2 minutes. No credit card required.
          </div>
        </div>
        <Link
          href="/register"
          className="h-11 px-10 bg-accent text-bg rounded-full flex justify-center items-center text-sm font-medium font-intert hover:opacity-90 active:scale-95 transition-all"
        >
          Get started free
        </Link>
      </div>
    </section>
  );
}
