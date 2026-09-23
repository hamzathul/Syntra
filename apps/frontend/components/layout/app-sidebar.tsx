"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BarChart3,
  ChevronLeft,
  Landmark,
  LayoutDashboard,
  Package,
  PanelLeft,
  Settings,
  ShoppingCart,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const STORAGE_KEY = "sidebar-collapsed";

const sections: {
  label: string;
  items: {
    href: string;
    label: string;
    icon: typeof LayoutDashboard;
    exact?: boolean;
  }[];
}[] = [
  {
    label: "Overview",
    items: [
      {
        href: "/dashboard",
        label: "Overview",
        icon: LayoutDashboard,
        exact: true,
      },
    ],
  },
  {
    label: "Manage",
    items: [
      { href: "/sales", label: "Sales", icon: TrendingUp },
      { href: "/purchases", label: "Purchases", icon: ShoppingCart },
      { href: "/items", label: "Items", icon: Package },
      { href: "/parties", label: "Parties", icon: Users },
    ],
  },
  {
    label: "Money",
    items: [
      { href: "/banks", label: "Banks", icon: Landmark },
      { href: "/cash", label: "Cash", icon: Wallet },
    ],
  },
  {
    label: "General",
    items: [
      { href: "/reports", label: "Reports", icon: BarChart3 },
      { href: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "true") setCollapsed(true);
    setMounted(true);
  }, []);

  const toggle = () => {
    setCollapsed((prev) => !prev);
    localStorage.setItem(STORAGE_KEY, String(!collapsed));
  };

  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col overflow-hidden rounded-[24px] border border-border/60 bg-sidebar",
        "shadow-[0_1px_2px_rgb(16_16_40/0.04),0_12px_32px_-16px_rgb(16_16_40/0.16)]",
        "transition-all duration-300 ease-out",
        mounted && collapsed ? "w-[84px]" : "w-[248px]",
      )}
    >
        {/* Logo */}
        <div className="flex h-[68px] shrink-0 items-center px-4">
          <div
            className={cn(
              "flex items-center gap-2.5 overflow-hidden",
              collapsed && "w-full justify-center",
            )}
          >
            <div className="brand-gradient flex h-9 w-9 shrink-0 items-center justify-center rounded-[13px] text-[15px] font-bold text-white shadow-[0_6px_16px_-4px_hsl(var(--primary)/0.55)]">
              S
            </div>
            {!collapsed && (
              <div className="flex items-baseline gap-1.5">
                <span className="text-[17px] font-semibold tracking-tight text-sidebar-foreground">
                  Syntra
                </span>
                <span className="rounded-full bg-primary/[0.1] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                  ERP
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className="no-scrollbar flex-1 overflow-y-auto px-3 pb-3">
          <ul className="space-y-4">
            {sections.map((section) => (
              <li key={section.label}>
                {!collapsed && (
                  <p className="mb-1.5 px-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/70">
                    {section.label}
                  </p>
                )}
                <ul className="space-y-1">
                  {section.items.map(({ href, label, icon: Icon, exact }) => {
                    const isActive = exact
                      ? pathname === href
                      : pathname.startsWith(href);

                    const linkContent = (
                      <Link
                        href={href}
                        className={cn(
                          "group flex items-center gap-3 rounded-2xl px-2.5 py-2 text-sm transition-all duration-200 ease-out",
                          collapsed && "justify-center px-2",
                          isActive
                            ? "bg-primary/[0.09] font-semibold text-foreground"
                            : "font-medium text-sidebar-foreground/80 hover:bg-muted/70 hover:text-foreground active:scale-[0.98]",
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all duration-200",
                            isActive
                              ? "brand-gradient text-white shadow-[0_4px_12px_-2px_hsl(var(--primary)/0.5)]"
                              : "bg-muted/80 text-muted-foreground group-hover:bg-card group-hover:text-foreground group-hover:shadow-sm",
                          )}
                        >
                          <Icon
                            className="h-4 w-4"
                            strokeWidth={isActive ? 2.2 : 1.9}
                          />
                        </span>
                        {!collapsed && (
                          <span className="truncate">{label}</span>
                        )}
                        {!collapsed && isActive && (
                          <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        )}
                      </Link>
                    );

                    return (
                      <li key={href}>
                        {collapsed ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              {linkContent}
                            </TooltipTrigger>
                            <TooltipContent
                              side="right"
                              className="font-medium"
                            >
                              {label}
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          linkContent
                        )}
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>
        </nav>

        {/* Collapse toggle */}
        <div className="shrink-0 p-3 pt-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={toggle}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl px-2.5 py-2 text-[13px] font-medium transition-all duration-200",
                  "text-muted-foreground hover:bg-muted/70 hover:text-foreground active:scale-[0.98]",
                  collapsed && "justify-center px-2",
                )}
              >
                {collapsed ? (
                  <PanelLeft className="h-4 w-4 shrink-0" />
                ) : (
                  <>
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted/80">
                      <ChevronLeft className="h-4 w-4 shrink-0" />
                    </span>
                    <span>Collapse</span>
                  </>
                )}
              </button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right" className="font-medium">
                Expand sidebar
              </TooltipContent>
            )}
          </Tooltip>
        </div>
    </aside>
  );
}
