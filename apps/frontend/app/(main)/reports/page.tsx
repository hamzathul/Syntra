import { BarChart3, Clock } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Analytics and business insights — crafted for clarity."
      />

      <div className="animate-fade-up stagger-1 relative overflow-hidden rounded-[28px] border border-border/60 bg-card p-10 text-center shadow-[0_1px_2px_rgb(16_16_40/0.04),0_8px_24px_-12px_rgb(16_16_40/0.1)]">
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-gradient-to-br from-primary/15 to-transparent blur-2xl" />
        <div className="relative mx-auto mb-4 w-fit">
          <div className="absolute -inset-3 rounded-[28px] bg-primary/[0.07] blur-md" />
          <div className="relative flex h-14 w-14 items-center justify-center rounded-[20px] border border-primary/15 bg-gradient-to-br from-primary/[0.14] to-primary/[0.04]">
            <BarChart3 className="h-6 w-6 text-primary" strokeWidth={1.8} />
          </div>
        </div>
        <h2 className="text-lg font-semibold tracking-tight">
          Beautiful reports are on the way
        </h2>
        <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-muted-foreground">
          Sales trends, profit summaries, and party ledgers will live here —
          designed to be glanceable and shareable.
        </p>
        <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          Coming soon
        </span>
      </div>
    </div>
  );
}
