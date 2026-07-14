"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboardIcon, Building2Icon, CreditCardIcon, BellIcon, UsersIcon, SettingsIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const navItems = [
  {
    href: "/settings",
    label: "Overview",
    icon: LayoutDashboardIcon,
    disabled: false,
    exact: true,
  },
  {
    href: "/settings/company-profile",
    label: "Company Profile",
    icon: Building2Icon,
    disabled: false,
    exact: false,
  },
  {
    href: "#",
    label: "Billing",
    icon: CreditCardIcon,
    disabled: true,
    exact: false,
  },
  {
    href: "#",
    label: "Notifications",
    icon: BellIcon,
    disabled: true,
    exact: false,
  },
  {
    href: "#",
    label: "Team",
    icon: UsersIcon,
    disabled: true,
    exact: false,
  },
] as const;

export function SettingsSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0">
      <div className="flex items-center gap-2 mb-6">
        <SettingsIcon className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-sm font-semibold text-muted-foreground">Settings</h2>
      </div>
      <nav className="space-y-1">
        {navItems.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
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
              <span className="flex-1">{item.label}</span>
              {item.disabled && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Soon</Badge>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
