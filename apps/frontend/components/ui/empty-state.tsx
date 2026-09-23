import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  readonly icon: LucideIcon;
  readonly title: string;
  readonly description?: string;
  readonly actions?: ReactNode;
  readonly className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actions,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-6 py-16 text-center",
        "animate-fade-up",
        className,
      )}
    >
      <div className="relative">
        <div className="absolute -inset-3 rounded-[28px] bg-primary/[0.07] blur-md" />
        <div className="relative flex h-14 w-14 items-center justify-center rounded-[20px] border border-primary/15 bg-gradient-to-br from-primary/[0.14] to-primary/[0.04]">
          <Icon className="h-6 w-6 text-primary" strokeWidth={1.8} />
        </div>
      </div>
      <div className="mt-1">
        <p className="text-[15px] font-semibold tracking-tight">{title}</p>
        {description ? (
          <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
