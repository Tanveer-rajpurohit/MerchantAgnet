interface ActivityItem {
  id: string;
  type: string;
  detail: string;
  time: string;
}

const RECENT_ACTIVITY: ActivityItem[] = [
  {
    id: "1",
    type: "Payment Link",
    detail: "₹500.00 to Rahul Sharma - Paid",
    time: "10 min ago",
  },
  {
    id: "2",
    type: "Campaign",
    detail: "Diwali offer drafted for 20 customers - awaiting approval",
    time: "1 hr ago",
  },
  {
    id: "3",
    type: "Payment Link",
    detail: "₹1,200.00 to Priya Mehta - Pending",
    time: "2 hrs ago",
  },
  {
    id: "4",
    type: "Payout",
    detail: "₹8,250.00 settled to HDFC Bank",
    time: "Yesterday",
  },
];

export function RecentActivity() {
  return (
    <div className="lg:col-span-2 rounded-xl border border-border bg-surface overflow-hidden">
      <div className="px-5 py-3.5 border-b border-border">
        <h2 className="text-sm font-medium text-primary">Recent Activity</h2>
      </div>
      <div>
        {RECENT_ACTIVITY.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between px-5 py-3 border-b border-border last:border-0"
          >
            <div>
              <p className="text-xs text-muted mb-0.5">{item.type}</p>
              <p className="text-sm text-primary">{item.detail}</p>
            </div>
            <p className="text-xs text-muted shrink-0 ml-4">{item.time}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
