"use client";

import { Building2, Check, ChevronsUpDown, Loader2, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useCompany } from "@/lib/company-context";

export function CompanySwitcher() {
  const { activeCompany, companies, isLoading, switchCompany } = useCompany();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-11 gap-2.5 rounded-2xl px-3 max-w-60 font-normal hover:bg-muted/70"
        >
          {isLoading ? (
            <>
              <div className="skeleton-shimmer h-8 w-8 shrink-0 rounded-xl" />
              <div className="skeleton-shimmer h-3.5 w-24 rounded-lg" />
            </>
          ) : (
            <>
              <div className="brand-gradient flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-white text-xs font-bold shadow-[0_4px_12px_-2px_hsl(var(--primary)/0.5)]">
                {activeCompany?.name?.charAt(0).toUpperCase() ?? (
                  <Building2 className="h-3.5 w-3.5" />
                )}
              </div>
              <span className="truncate text-sm font-semibold tracking-tight">
                {activeCompany?.name ?? "Select company"}
              </span>
              <ChevronsUpDown className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-64 rounded-2xl" align="start">
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          Your companies
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {isLoading ? (
          <div className="flex items-center gap-2 px-2 py-2 text-sm text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Loading…
          </div>
        ) : companies.length === 0 ? (
          <div className="px-2 py-2 text-sm text-muted-foreground">
            No companies found
          </div>
        ) : (
          companies.map((company) => (
            <DropdownMenuItem
              key={company.id}
              onClick={() => switchCompany(company)}
              className="gap-2.5 rounded-xl cursor-pointer p-2"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/[0.1] text-primary text-xs font-bold">
                {company.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium">{company.name}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {company.role.toLowerCase()}
                </p>
              </div>
              {activeCompany?.id === company.id && (
                <Check className="h-4 w-4 shrink-0 text-primary" />
              )}
            </DropdownMenuItem>
          ))
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => (window.location.href = "/onboarding")}
          className="gap-2.5 cursor-pointer text-muted-foreground"
        >
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-dashed border-border">
            <Plus className="h-3.5 w-3.5" />
          </div>
          <span className="text-sm">Add company</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
