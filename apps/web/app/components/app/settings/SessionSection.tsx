import { LogOut } from "lucide-react";

interface SessionSectionProps {
  onSignOut: () => void;
}

export function SessionSection({ onSignOut }: SessionSectionProps) {
  return (
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
          onClick={onSignOut}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-border bg-bg hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-600 text-xs font-medium font-intert transition-colors"
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>
    </section>
  );
}
