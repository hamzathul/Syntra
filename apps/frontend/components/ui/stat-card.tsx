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
  violet: "text-violet-600 dark:text-violet-400",
  blue: "text-sky-600 dark:text-sky-400",
  emerald: "text-emerald-600 dark:text-emerald-400",
  amber: "text-amber-600 dark:text-amber-400",
  rose: "text-rose-600 dark:text-rose-400",
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
        "rounded-xl border border-border/80 bg-card p-4 shadow-[0_1px_2px_rgb(16_16_40/0.04)]",
        "transition-shadow duration-200 hover:shadow-[0_1px_2px_rgb(16_16_40/0.05),0_12px_32px_-16px_rgb(16_16_40/0.16)]",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13px] font-medium text-muted-foreground">{label}</p>
        <Icon className={cn("h-4 w-4 shrink-0", tones[tone])} strokeWidth={2} />
      </div>
      <p className="mt-3 truncate text-[24px] font-semibold leading-none tracking-tight tabular-nums">
        {value}
      </p>
      {hint ? (
        <p className="mt-1.5 text-xs text-muted-foreground/80">{hint}</p>
      ) : null}
    </div>
  );
}
