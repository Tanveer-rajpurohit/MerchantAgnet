"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sun,
  Moon,
  Laptop,
  Store,
  CreditCard,
  LogOut,
  CheckCircle2,
  Globe,
} from "lucide-react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = () => {
    router.push("/login");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-instrument text-primary tracking-tight">
          Settings
        </h1>
        <p className="text-sm text-muted font-intert mt-1">
          Manage your merchant workspace, theme preferences, and connected
          integrations.
        </p>
      </div>

      <div className="space-y-6">
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
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                mounted && theme === "light"
                  ? "border-brand bg-brand/5 text-primary"
                  : "border-border bg-bg text-secondary hover:text-primary hover:bg-surface-muted"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  mounted && theme === "light"
                    ? "bg-brand text-white"
                    : "bg-surface-muted text-muted"
                }`}
              >
                <Sun size={16} />
              </div>
              <div>
                <p className="text-xs font-medium font-intert">Light</p>
                <p className="text-[11px] text-muted font-intert">
                  Bright aesthetic
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                mounted && theme === "dark"
                  ? "border-brand bg-brand/5 text-primary"
                  : "border-border bg-bg text-secondary hover:text-primary hover:bg-surface-muted"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  mounted && theme === "dark"
                    ? "bg-brand text-white"
                    : "bg-surface-muted text-muted"
                }`}
              >
                <Moon size={16} />
              </div>
              <div>
                <p className="text-xs font-medium font-intert">Dark</p>
                <p className="text-[11px] text-muted font-intert">
                  Dark aesthetic
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setTheme("system")}
              className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                mounted && theme === "system"
                  ? "border-brand bg-brand/5 text-primary"
                  : "border-border bg-bg text-secondary hover:text-primary hover:bg-surface-muted"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  mounted && theme === "system"
                    ? "bg-brand text-white"
                    : "bg-surface-muted text-muted"
                }`}
              >
                <Laptop size={16} />
              </div>
              <div>
                <p className="text-xs font-medium font-intert">System</p>
                <p className="text-[11px] text-muted font-intert">
                  Device default
                </p>
              </div>
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <div className="flex items-center gap-2">
                <Store size={18} className="text-brand" />
                <h2 className="text-base font-medium font-intert text-primary">
                  Store Profile
                </h2>
              </div>
              <p className="text-xs text-muted font-intert mt-0.5">
                Business details configured during onboarding.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl border border-border bg-bg">
              <span className="text-[11px] text-muted font-intert">
                Business Name
              </span>
              <p className="text-sm font-medium font-intert text-primary mt-0.5">
                Sharma Store
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-border bg-bg">
              <span className="text-[11px] text-muted font-intert">
                Category
              </span>
              <p className="text-sm font-medium font-intert text-primary mt-0.5">
                Kirana / Grocery
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-border bg-bg">
              <span className="text-[11px] text-muted font-intert">
                Location
              </span>
              <p className="text-sm font-medium font-intert text-primary mt-0.5">
                Mumbai, Maharashtra
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-border bg-bg">
              <span className="text-[11px] text-muted font-intert">
                Agent Language
              </span>
              <p className="text-sm font-medium font-intert text-primary mt-0.5 flex items-center gap-1.5">
                <Globe size={13} className="text-muted" />
                English / Hindi
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <div className="flex items-center gap-2">
                <CreditCard size={18} className="text-[#3395FF]" />
                <h2 className="text-base font-medium font-intert text-primary">
                  Razorpay Integration
                </h2>
              </div>
              <p className="text-xs text-muted font-intert mt-0.5">
                Payment gateway connection for automated link generation.
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium font-intert border border-emerald-500/20">
              <CheckCircle2 size={13} />
              Connected (Test Mode)
            </div>
          </div>

          <div className="p-4 rounded-xl border border-border bg-bg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] text-muted font-intert">
                Active Key ID
              </span>
              <p className="font-mono text-xs text-primary mt-0.5">
                rzp_test_98kLsM2109xPQ
              </p>
            </div>
            <span className="text-xs font-intert text-muted">
              Zero platform fees enabled
            </span>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-medium font-intert text-primary">
                Session & Account
              </h2>
              <p className="text-xs text-muted font-intert mt-0.5">
                Sign out of your active merchant workspace on this device.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-border bg-bg hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-600 text-xs font-medium font-intert transition-colors"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
