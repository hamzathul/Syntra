import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  readonly label: string;
  readonly value: string;
  readonly hint?: string;
  readonly icon: LucideIcon;
  readonly tone?: "violet" | "blue" | "emerald" | "amber" | "rose";
  readonly className?: string;
}

const tones: Record<NonNullable<StatCardProps["tone"]>, string> = {
  violet:
    "from-violet-500/[0.14] to-violet-500/[0.03] text-violet-600 dark:text-violet-300",
  blue: "from-sky-500/[0.14] to-sky-500/[0.03] text-sky-600 dark:text-sky-300",
  emerald:
    "from-emerald-500/[0.14] to-emerald-500/[0.03] text-emerald-600 dark:text-emerald-300",
  amber:
    "from-amber-500/[0.16] to-amber-500/[0.04] text-amber-600 dark:text-amber-300",
  rose: "from-rose-500/[0.14] to-rose-500/[0.03] text-rose-600 dark:text-rose-300",
};

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "violet",
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-[20px] border border-border/70 bg-card p-5",
        "shadow-[0_1px_2px_rgb(16_16_40/0.04),0_8px_24px_-12px_rgb(16_16_40/0.1)]",
        "transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_2px_4px_rgb(16_16_40/0.05),0_16px_40px_-16px_rgb(16_16_40/0.2)]",
        className,
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br blur-2xl opacity-70",
          tones[tone],
        )}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-muted-foreground">
            {label}
          </p>
          <p className="mt-1.5 truncate text-[26px] font-semibold tracking-tight tabular-nums">
            {value}
          </p>
          {hint ? (
            <p className="mt-1 text-xs text-muted-foreground/80">{hint}</p>
          ) : null}
        </div>
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br",
            tones[tone],
          )}
        >
          <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} />
        </div>
      </div>
    </div>
  );
}
