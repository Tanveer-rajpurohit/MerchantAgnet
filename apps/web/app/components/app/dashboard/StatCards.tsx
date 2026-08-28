export function StatCards() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
      <div className="rounded-xl border border-border bg-surface p-4">
        <p className="text-xs text-muted uppercase tracking-wide mb-1.5">
          Today&apos;s Collection
        </p>
        <p className="text-2xl font-instrument text-primary">₹2,730</p>
      </div>
      <div className="rounded-xl border border-border bg-surface p-4">
        <p className="text-xs text-muted uppercase tracking-wide mb-1.5">
          Pending Links
        </p>
        <p className="text-2xl font-instrument text-primary">1</p>
      </div>
      <div className="rounded-xl border border-border bg-surface p-4">
        <p className="text-xs text-muted uppercase tracking-wide mb-1.5">
          Low Stock Items
        </p>
        <p className="text-2xl font-instrument text-warning">1</p>
      </div>
      <div className="rounded-xl border border-border bg-surface p-4">
        <p className="text-xs text-muted uppercase tracking-wide mb-1.5">
          Active Campaigns
        </p>
        <p className="text-2xl font-instrument text-primary">1</p>
      </div>
    </div>
  );
}
