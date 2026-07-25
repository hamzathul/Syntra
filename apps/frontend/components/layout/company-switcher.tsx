"use client";

import { useEffect, useState } from "react";
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
import { companyService } from "@/lib/api/services/company.service";
import {
  getActiveCompany,
  setActiveCompany,
  type ActiveCompany,
  type CompanyDto,
} from "@/lib/auth";

export function CompanySwitcher() {
  const [active, setActive] = useState<ActiveCompany | null>(null);
  const [companies, setCompanies] = useState<CompanyDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setActive(getActiveCompany());
    companyService
      .list()
      .then(setCompanies)
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const switchTo = (company: CompanyDto) => {
    const next: ActiveCompany = { id: company.id, name: company.name, role: company.role };
    setActiveCompany(next);
    setActive(next);
    window.location.reload();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-9 gap-2 px-2.5 max-w-55 font-normal hover:bg-accent"
        >
          {loading ? (
            <>
              <div className="h-5 w-5 shrink-0 rounded bg-muted animate-pulse" />
              <div className="h-3.5 w-24 rounded bg-muted animate-pulse" />
            </>
          ) : (
            <>
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-primary/10">
                <Building2 className="h-3 w-3 text-primary" />
              </div>
              <span className="truncate text-sm font-medium">
                {active?.name ?? "Select company"}
              </span>
              <ChevronsUpDown className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-60" align="start">
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          Your companies
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {loading ? (
          <div className="flex items-center gap-2 px-2 py-2 text-sm text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Loading…
          </div>
        ) : companies.length === 0 ? (
          <div className="px-2 py-2 text-sm text-muted-foreground">No companies found</div>
        ) : (
          companies.map((company) => (
            <DropdownMenuItem
              key={company.id}
              onClick={() => switchTo(company)}
              className="gap-2.5 cursor-pointer"
            >
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-primary/10 text-primary text-xs font-semibold">
                {company.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium">{company.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{company.role.toLowerCase()}</p>
              </div>
              {active?.id === company.id && (
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
