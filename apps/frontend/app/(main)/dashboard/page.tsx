import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Package,
  Plus,
  ReceiptText,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";

const stats = [
  {
    label: "Total sales",
    value: "—",
    hint: "No sales recorded yet",
    icon: TrendingUp,
    tone: "violet" as const,
  },
  {
    label: "Purchases",
    value: "—",
    hint: "No purchases recorded yet",
    icon: ShoppingCart,
    tone: "blue" as const,
  },
  {
    label: "Items in stock",
    value: "—",
    hint: "Your catalog is empty",
    icon: Package,
    tone: "emerald" as const,
  },
  {
    label: "Revenue",
    value: "—",
    hint: "Insights unlock with data",
    icon: BarChart3,
    tone: "amber" as const,
  },
];

const steps = [
  {
    href: "/items/new",
    label: "Add your first item",
    description: "Products or services you sell",
    icon: Package,
  },
  {
    href: "/parties/new",
    label: "Add a customer or supplier",
    description: "Keep contacts and balances together",
    icon: Users,
  },
  {
    href: "/sales/new",
    label: "Record your first sale",
    description: "Cash or credit, tracked automatically",
    icon: ReceiptText,
  },
];

export default function DashboardOverviewPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview"
        description="A calm snapshot of your business."
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/items/new">
                <Plus className="h-4 w-4" />
                Add item
              </Link>
            </Button>
            <Button asChild>
              <Link href="/sales/new">
                <Plus className="h-4 w-4" />
                New sale
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className={`animate-fade-up stagger-${Math.min(index + 1, 4)}`}
          >
            <StatCard {...stat} />
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <section className="animate-fade-up stagger-2 rounded-xl border border-border/80 bg-card lg:col-span-3">
          <div className="flex items-center justify-between border-b border-border/70 px-5 py-4">
            <div>
              <h2 className="text-[14px] font-semibold tracking-tight">
                Quick start
              </h2>
              <p className="text-[12.5px] text-muted-foreground">
                Three steps to get useful data flowing.
              </p>
            </div>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              3 steps
            </span>
          </div>
          <div className="divide-y divide-border/60">
            {steps.map(({ href, label, description, icon: Icon }, index) => (
              <Link
                key={href}
                href={href}
                className="group flex items-center gap-3.5 px-5 py-3.5 transition-colors hover:bg-accent/40"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40 text-[12px] font-semibold text-muted-foreground">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13.5px] font-medium tracking-tight">
                    {label}
                  </span>
                  <span className="block truncate text-[12.5px] text-muted-foreground">
                    {description}
                  </span>
                </span>
                <Icon
                  className="h-4 w-4 shrink-0 text-muted-foreground/50"
                  aria-hidden
                />
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-foreground" />
              </Link>
            ))}
          </div>
        </section>

        <section className="animate-fade-up stagger-3 rounded-xl border border-border/80 bg-card lg:col-span-2">
          <div className="border-b border-border/70 px-5 py-4">
            <h2 className="text-[14px] font-semibold tracking-tight">
              Recent activity
            </h2>
            <p className="text-[12.5px] text-muted-foreground">
              Sales, purchases and payments
            </p>
          </div>
          <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-muted/50">
              <BarChart3 className="h-4.5 w-4.5 text-muted-foreground" />
            </div>
            <p className="mt-3 text-[13.5px] font-medium">No activity yet</p>
            <p className="mt-1 max-w-[240px] text-[12.5px] leading-relaxed text-muted-foreground">
              Record a sale or purchase and it will show up here.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
