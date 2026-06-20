"use client";

import { useEffect, useState } from "react";
import { Building2, Check, ChevronsUpDown, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { companyApi } from "@/lib/api/erp-client";
import {
  getActiveCompany,
  setActiveCompany,
  type ActiveCompany,
  type CompanyDto,
} from "@/lib/auth";

export function CompanySwitcher() {
  const [active, setActive] = useState<ActiveCompany | null>(null);
  const [companies, setCompanies] = useState<CompanyDto[]>([]);

  useEffect(() => {
    setActive(getActiveCompany());
    companyApi.list().then(setCompanies).catch(() => undefined);
  }, []);

  const switchTo = (company: CompanyDto) => {
    const next: ActiveCompany = {
      id: company.id,
      name: company.name,
      role: company.role,
    };
    setActiveCompany(next);
    setActive(next);
    window.location.reload();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-9 gap-2 px-3 max-w-[200px]">
          <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="truncate text-sm">{active?.name ?? "Select company"}</span>
          <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuLabel>Your companies</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {companies.map((company) => (
          <DropdownMenuItem
            key={company.id}
            onClick={() => switchTo(company)}
            className="gap-2"
          >
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1 truncate">{company.name}</span>
            {active?.id === company.id && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => (window.location.href = "/onboarding")}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add company
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
