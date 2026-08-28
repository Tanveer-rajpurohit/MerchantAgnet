import Link from "next/link";
import { AlertTriangle } from "lucide-react";

interface LowStockItem {
  name: string;
  stock: number;
  alert: number;
}

const LOW_STOCK: LowStockItem[] = [
  { name: "Parle-G Biscuit", stock: 12, alert: 15 },
];

export function LowStock() {
  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden">
      <div className="px-5 py-3.5 border-b border-border flex items-center gap-2">
        <AlertTriangle size={14} className="text-warning" />
        <h2 className="text-sm font-medium text-primary">Low Stock</h2>
      </div>
      <div>
        {LOW_STOCK.map((item) => (
          <div
            key={item.name}
            className="px-5 py-3 border-b border-border last:border-0"
          >
            <p className="text-sm text-primary">{item.name}</p>
            <p className="text-xs text-muted">
              {item.stock} left · alert at {item.alert}
            </p>
          </div>
        ))}
        <Link
          href="/products"
          className="block px-5 py-3 text-xs text-brand hover:underline"
        >
          View all products →
        </Link>
      </div>
    </div>
  );
}
