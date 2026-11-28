"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { settingsNavItems } from "@/lib/settings-nav";

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Settings sections"
      className="flex flex-wrap gap-1 rounded-xl border border-border/80 bg-card p-1"
    >
      {settingsNavItems.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.title}
            href={item.disabled ? "#" : item.href}
            aria-disabled={item.disabled || undefined}
            aria-current={active ? "page" : undefined}
            onClick={(event) => item.disabled && event.preventDefault()}
            className={cn(
              "flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
              item.disabled && "cursor-not-allowed opacity-45 hover:bg-transparent",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {item.title}
            {item.disabled && (
              <span className="rounded bg-muted px-1 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                Soon
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
