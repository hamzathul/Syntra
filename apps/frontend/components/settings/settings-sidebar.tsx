"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SettingsIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { settingsNavItems } from "@/lib/settings-nav";

export function SettingsSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0">
      <div className="flex items-center gap-2 mb-6">
        <SettingsIcon className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-sm font-semibold text-muted-foreground">
          Settings
        </h2>
      </div>
      <nav className="space-y-1">
        {settingsNavItems.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.title}
              href={item.disabled ? "#" : item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                item.disabled && "opacity-50 cursor-not-allowed",
              )}
              onClick={(e) => item.disabled && e.preventDefault()}
            >
              <Icon className="h-4 w-4" />
              <span className="flex-1">{item.title}</span>
              {item.disabled && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  Soon
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
