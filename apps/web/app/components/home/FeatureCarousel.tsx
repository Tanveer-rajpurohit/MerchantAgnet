"use client";

interface FeatureCarouselProps {
  activeCard: number;
  progress: number;
  onCardClick: (index: number) => void;
}

function FeatureCard({
  title,
  description,
  isActive,
  progress,
  onClick,
}: {
  title: string;
  description: string;
  isActive: boolean;
  progress: number;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`flex-1 overflow-hidden flex flex-col justify-start items-start transition-all duration-300 cursor-pointer border-b md:border-b-0 md:border-r border-border last:border-0 ${
        isActive ? "bg-surface" : "bg-transparent hover:bg-surface/30"
      }`}
    >
      <div
        className={`w-full h-1 bg-border/40 overflow-hidden ${
          isActive ? "opacity-100" : "opacity-0"
        }`}
      >
        <div
          className="h-1 bg-primary transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="px-6 py-5 w-full flex flex-col gap-2">
        <div className="self-stretch flex justify-center flex-col text-primary text-sm font-semibold leading-6 font-intert">
          {title}
        </div>
        <div className="self-stretch text-muted text-[13px] font-normal leading-[22px] font-intert whitespace-pre-line">
          {description}
        </div>
      </div>
    </div>
  );
}

export default function FeatureCarousel({
  activeCard,
  progress,
  onCardClick,
}: FeatureCarouselProps) {
  return (
    <section className="w-full border-b border-border flex justify-center">
      <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row">
        <FeatureCard
          title="Instant Payment Links"
          description="Generate test-mode Razorpay links on request with instant WhatsApp share."
          isActive={activeCard === 0}
          progress={activeCard === 0 ? progress : 0}
          onClick={() => onCardClick(0)}
        />
        <FeatureCard
          title="Agent-Readable Catalog"
          description="Expose live inventory to external buyer AI agents via standard Model Context Protocol."
          isActive={activeCard === 1}
          progress={activeCard === 1 ? progress : 0}
          onClick={() => onCardClick(1)}
        />
        <FeatureCard
          title="Gated Campaign Batches"
          description="Draft targeted discount batches and require explicit approval before any money moves."
          isActive={activeCard === 2}
          progress={activeCard === 2 ? progress : 0}
          onClick={() => onCardClick(2)}
        />
      </div>
    </section>
  );
}
