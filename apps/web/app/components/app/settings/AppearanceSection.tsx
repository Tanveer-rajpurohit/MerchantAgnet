"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Laptop } from "lucide-react";

export function AppearanceSection() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const THEMES = [
    {
      id: "light" as const,
      label: "Light",
      subtitle: "Bright aesthetic",
      icon: Sun,
    },
    {
      id: "dark" as const,
      label: "Dark",
      subtitle: "Dark aesthetic",
      icon: Moon,
    },
    {
      id: "system" as const,
      label: "System",
      subtitle: "Device default",
      icon: Laptop,
    },
  ];

  return (
    <section className="rounded-2xl border border-border bg-surface p-6">
      <div className="mb-4">
        <h2 className="text-base font-medium font-intert text-primary">
          Appearance
        </h2>
        <p className="text-xs text-muted font-intert mt-0.5">
          Customize the look and feel of your MerchantAgent dashboard.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {THEMES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTheme(t.id)}
            className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
              mounted && theme === t.id
                ? "border-brand bg-brand/5 text-primary"
                : "border-border bg-bg text-secondary hover:text-primary hover:bg-surface-muted"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                mounted && theme === t.id
                  ? "bg-brand text-white"
                  : "bg-surface-muted text-muted"
              }`}
            >
              <t.icon size={16} />
            </div>
            <div>
              <p className="text-xs font-medium font-intert">{t.label}</p>
              <p className="text-[11px] text-muted font-intert">{t.subtitle}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
