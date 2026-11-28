"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BarChart3,
  ChevronsLeft,
  Landmark,
  LayoutDashboard,
  Package,
  PanelLeft,
  Settings,
  ShoppingCart,
  TrendingUp,
  Users,
  Wallet,
  X,
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

interface AppSidebarProps {
  readonly mobileOpen?: boolean;
  readonly onClose?: () => void;
}

export function AppSidebar({ mobileOpen = false, onClose }: AppSidebarProps) {
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
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/25 backdrop-blur-[2px] lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[264px] flex-col border-r border-sidebar-border bg-sidebar",
          "transition-[transform,width] duration-300 ease-out lg:static lg:z-auto lg:translate-x-0",
          mounted && collapsed ? "lg:w-[68px]" : "lg:w-[248px]",
          mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full",
        )}
      >
        {/* Logo */}
        <div className="flex h-14 shrink-0 items-center gap-2 border-b border-sidebar-border/70 px-4">
          <Link
            href="/dashboard"
            onClick={onClose}
            className={cn(
              "flex min-w-0 items-center gap-2.5",
              collapsed && "lg:justify-center",
            )}
          >
            <div className="brand-gradient flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[14px] font-bold text-white">
              S
            </div>
            <span
              className={cn(
                "flex items-baseline gap-1.5 overflow-hidden",
                collapsed && "lg:hidden",
              )}
            >
              <span className="text-[15px] font-semibold tracking-tight text-sidebar-foreground">
                Syntra
              </span>
              <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">
                ERP
              </span>
            </span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="no-scrollbar flex-1 overflow-y-auto px-2.5 py-4">
          <ul className="space-y-5">
            {sections.map((section) => (
              <li key={section.label}>
                <p
                  className={cn(
                    "mb-1 px-2.5 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/60",
                    collapsed && "lg:hidden",
                  )}
                >
                  {section.label}
                </p>
                <ul className="space-y-0.5">
                  {section.items.map(({ href, label, icon: Icon, exact }) => {
                    const isActive = exact
                      ? pathname === href
                      : pathname.startsWith(href);

                    const link = (
                      <Link
                        href={href}
                        onClick={onClose}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                          "group relative flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-[13.5px] transition-colors duration-150",
                          collapsed && "lg:justify-center lg:px-0",
                          isActive
                            ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                            : "font-normal text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-4 w-4 shrink-0",
                            isActive
                              ? "text-primary"
                              : "text-muted-foreground group-hover:text-foreground",
                          )}
                          strokeWidth={isActive ? 2.1 : 1.9}
                        />
                        <span
                          className={cn("truncate", collapsed && "lg:hidden")}
                        >
                          {label}
                        </span>
                        {isActive && !collapsed && (
                          <span className="ml-auto h-1 w-1 rounded-full bg-primary" />
                        )}
                      </Link>
                    );

                    return (
                      <li key={href}>
                        {collapsed ? (
                          <Tooltip>
                            <TooltipTrigger asChild>{link}</TooltipTrigger>
                            <TooltipContent
                              side="right"
                              className="font-medium"
                            >
                              {label}
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          link
                        )}
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>
        </nav>

        {/* Collapse toggle (desktop only) */}
        <div className="hidden shrink-0 border-t border-sidebar-border/70 p-2.5 lg:block">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={toggle}
                className={cn(
                  "flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-foreground",
                  collapsed && "justify-center px-0",
                )}
              >
                {collapsed ? (
                  <PanelLeft className="h-4 w-4 shrink-0" />
                ) : (
                  <>
                    <ChevronsLeft className="h-4 w-4 shrink-0" />
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
    </>
  );
}
