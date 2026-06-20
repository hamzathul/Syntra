import { BarChart3, Package, ShoppingCart, TrendingUp } from "lucide-react";

const stats = [
  {
    label: "Total Sales",
    value: "—",
    description: "No data yet",
    icon: TrendingUp,
    color: "text-violet-500",
    bg: "bg-violet-50 dark:bg-violet-950/40",
  },
  {
    label: "Purchases",
    value: "—",
    description: "No data yet",
    icon: ShoppingCart,
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950/40",
  },
  {
    label: "Items in Stock",
    value: "—",
    description: "No data yet",
    icon: Package,
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
  },
  {
    label: "Revenue",
    value: "—",
    description: "No data yet",
    icon: BarChart3,
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950/40",
  },
];

export default function DashboardOverviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Welcome to your Syntra ERP dashboard
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, description, color, bg }) => (
          <div
            key={label}
            className="rounded-2xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground">{label}</span>
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${bg}`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
            </div>
            <div className="text-2xl font-semibold tracking-tight">{value}</div>
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          </div>
        ))}
      </div>

      {/* Empty state */}
      <div className="rounded-2xl border bg-card p-10 text-center shadow-sm">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent">
          <BarChart3 className="h-6 w-6 text-accent-foreground" />
        </div>
        <h3 className="font-medium">No activity yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Start by adding items, recording sales, or logging purchases.
        </p>
      </div>
    </div>
  );
}
