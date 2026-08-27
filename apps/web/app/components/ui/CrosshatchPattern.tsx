"use client";

interface CrosshatchPatternProps {
  count?: number;
  className?: string;
}

export default function CrosshatchPattern({
  count = 40,
  className = "",
}: CrosshatchPatternProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="w-[140px] left-[-50px] top-[-120px] absolute flex flex-col justify-start items-start pointer-events-none">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="self-stretch h-3 rotate-[-45deg] origin-top-left outline outline-[0.5px] outline-border/60"
          />
        ))}
      </div>
    </div>
  );
}
