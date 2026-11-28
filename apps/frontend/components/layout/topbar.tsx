"use client";

import { usePathname } from "next/navigation";
import { PanelLeft } from "lucide-react";
import { CompanySwitcher } from "./company-switcher";
import { UserNav } from "./user-nav";

const titles: Record<string, string> = {
  dashboard: "Overview",
  sales: "Sales",
  purchases: "Purchases",
  items: "Items",
  parties: "Parties",
  banks: "Banks",
  cash: "Cash",
  reports: "Reports",
  settings: "Settings",
};

export function Topbar({ onOpenMenu }: { readonly onOpenMenu: () => void }) {
  const pathname = usePathname();
  const title = titles[pathname.split("/")[1] ?? "dashboard"] ?? "Workspace";

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border/70 bg-background/80 px-3 backdrop-blur-md sm:px-5">
      <button
        type="button"
        onClick={onOpenMenu}
        aria-label="Open navigation"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:hidden"
      >
        <PanelLeft className="h-4.5 w-4.5" />
      </button>

      <CompanySwitcher />

      <span className="hidden h-4 w-px bg-border sm:block" aria-hidden />
      <span className="hidden text-[13px] font-medium text-muted-foreground sm:block">
        {title}
      </span>

      <div className="ml-auto flex items-center gap-1">
        <UserNav />
      </div>
    </header>
  );
}
