"use client";

import { cn } from "@/lib/utils";

interface TabNavProps<T extends string> {
  readonly tabs: readonly { id: T; label: string }[];
  readonly value: T;
  readonly onChange: (value: T) => void;
  readonly className?: string;
}

export function TabNav<T extends string>({
  tabs,
  value,
  onChange,
  className,
}: TabNavProps<T>) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex gap-0.5 rounded-lg border border-border/80 bg-muted/40 p-0.5",
        className,
      )}
    >
      {tabs.map((tab) => {
        const active = tab.id === value;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={cn(
              "rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors duration-150",
              active
                ? "bg-card text-foreground shadow-[0_1px_2px_rgb(16_16_40/0.08)]"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
