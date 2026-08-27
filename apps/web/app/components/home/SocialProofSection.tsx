export default function SocialProofSection() {
  const stats = [
    { value: "3s", label: "Avg. Link Generation" },
    { value: "₹0", label: "Platform Fee" },
    { value: "100%", label: "Approval Gated" },
    { value: "26+", label: "Products Synced" },
  ];

  return (
    <section className="w-full border-b border-border">
      <div className="w-full max-w-6xl mx-auto">
        <div className="py-12 sm:py-16 px-4 sm:px-6 flex flex-col items-center text-center border-b border-border">
          <div className="text-primary text-2xl sm:text-3xl md:text-5xl font-normal leading-tight font-instrument tracking-tight mb-2">
            Built for real merchant results
          </div>
          <div className="text-muted text-sm sm:text-base font-normal font-intert max-w-xl">
            Every action is explainable, bounded, and gated. Nothing sends or
            charges without a clear reason.
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="p-8 sm:p-10 flex flex-col items-center justify-center gap-2 border-r border-b border-border last:border-r-0 [&:nth-child(2)]:border-r-0 sm:[&:nth-child(2)]:border-r [&:nth-child(3)]:border-b-0 [&:nth-child(4)]:border-b-0 sm:[&:nth-child(1)]:border-b-0 sm:[&:nth-child(2)]:border-b-0"
            >
              <div className="text-primary text-4xl sm:text-5xl font-instrument">
                {stat.value}
              </div>
              <div className="text-muted text-xs sm:text-sm font-intert text-center">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
