import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Package,
  Plus,
  ReceiptText,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";

const stats = [
  {
    label: "Total Sales",
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
    label: "Items in Stock",
    value: "—",
    hint: "Your catalog is empty",
    icon: Package,
    tone: "emerald" as const,
  },
  {
    label: "Revenue",
    value: "—",
    hint: "Charts unlock with data",
    icon: BarChart3,
    tone: "amber" as const,
  },
];

const quickActions = [
  {
    href: "/sales/new",
    label: "New sale",
    description: "Bill a customer in seconds",
    icon: ReceiptText,
  },
  {
    href: "/items/new",
    label: "Add item",
    description: "Grow your catalog",
    icon: Package,
  },
  {
    href: "/parties/new",
    label: "Add party",
    description: "Customers & suppliers",
    icon: Users,
  },
];

export default function DashboardOverviewPage() {
  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="animate-fade-up relative overflow-hidden rounded-[28px] border border-border/60 bg-card p-7 sm:p-9 shadow-[0_1px_2px_rgb(16_16_40/0.04),0_16px_40px_-20px_rgb(16_16_40/0.25)]">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gradient-to-br from-primary/25 via-primary/10 to-transparent blur-2xl" />
        <div className="pointer-events-none absolute -bottom-28 -left-16 h-64 w-64 rounded-full bg-gradient-to-tr from-sky-400/15 to-transparent blur-2xl" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-lg">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/[0.08] px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Welcome to Syntra
            </span>
            <h1 className="mt-3 text-[30px] font-semibold leading-[1.15] tracking-tight sm:text-[34px]">
              Your business,{" "}
              <span className="brand-text-gradient">beautifully in sync.</span>
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
              Track sales, manage stock, and keep cash flow clear — all from one
              calm, minimal workspace.
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <Button asChild className="rounded-2xl">
                <Link href="/sales/new">
                  <Plus className="h-4 w-4" />
                  New sale
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-2xl">
                <Link href="/items/new">
                  Add your first item
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="hidden shrink-0 sm:block">
            <div className="glass flex items-center gap-3 rounded-[20px] border border-border/60 px-5 py-4 shadow-[0_8px_24px_-12px_rgb(16_16_40/0.25)]">
              <div className="brand-gradient flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-[0_6px_16px_-4px_hsl(var(--primary)/0.55)]">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Getting started
                </p>
                <p className="text-sm font-semibold tracking-tight">
                  3 quick steps to launch
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className={`animate-fade-up stagger-${Math.min(index + 1, 4)}`}
          >
            <StatCard {...stat} />
          </div>
        ))}
      </div>

      {/* Quick actions + activity */}
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="animate-fade-up stagger-2 rounded-[24px] border border-border/60 bg-card p-6 lg:col-span-2 shadow-[0_1px_2px_rgb(16_16_40/0.04),0_8px_24px_-12px_rgb(16_16_40/0.1)]">
          <h2 className="text-[15px] font-semibold tracking-tight">
            Quick actions
          </h2>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Jump into the work that matters.
          </p>
          <div className="mt-4 space-y-2">
            {quickActions.map(({ href, label, description, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-center gap-3 rounded-2xl border border-transparent p-2.5 transition-all duration-200 hover:border-border/70 hover:bg-muted/50 active:scale-[0.99]"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/[0.09] text-primary transition-all duration-200 group-hover:bg-primary group-hover:text-white group-hover:shadow-[0_6px_16px_-4px_hsl(var(--primary)/0.55)]">
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold tracking-tight">
                    {label}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {description}
                  </span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/50 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-foreground" />
              </Link>
            ))}
          </div>
        </div>

        <div className="animate-fade-up stagger-3 rounded-[24px] border border-border/60 bg-card p-10 text-center lg:col-span-3 shadow-[0_1px_2px_rgb(16_16_40/0.04),0_8px_24px_-12px_rgb(16_16_40/0.1)]">
          <div className="relative mx-auto mb-4 w-fit">
            <div className="absolute -inset-3 rounded-[28px] bg-primary/[0.07] blur-md" />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-[20px] border border-primary/15 bg-gradient-to-br from-primary/[0.14] to-primary/[0.04]">
              <BarChart3 className="h-6 w-6 text-primary" strokeWidth={1.8} />
            </div>
          </div>
          <h3 className="text-[15px] font-semibold tracking-tight">
            No activity yet
          </h3>
          <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Start by adding items, recording a sale, or logging a purchase —
            your insights will appear here.
          </p>
          <Button asChild variant="outline" className="mt-4 rounded-2xl">
            <Link href="/items/new">
              <Plus className="h-4 w-4" />
              Create your first item
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
