"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { CompanyDto, CreateCompanyDto } from "shared";
import {
  useCompanies,
  useCreateCompanyMutation,
} from "@/hooks/companies/use-companies-query";
import {
  getActiveCompany,
  setActiveCompany as setActiveCompanyCookie,
  type ActiveCompany,
} from "@/lib/auth";

interface CompanyContextValue {
  activeCompany: ActiveCompany | null;
  companies: CompanyDto[];
  isLoading: boolean;
  switchCompany: (company: CompanyDto) => void;
  createCompany: (data: CreateCompanyDto) => Promise<CompanyDto>;
}

const CompanyContext = createContext<CompanyContextValue | null>(null);

export function CompanyProvider({ children }: { children: ReactNode }) {
  const { data: companies = [], isLoading } = useCompanies();
  const createCompanyMutation = useCreateCompanyMutation();
  const queryClient = useQueryClient();

  const [activeCompany, setActiveCompanyState] = useState<ActiveCompany | null>(
    () => getActiveCompany(),
  );

  useEffect(() => {
    if (!activeCompany && companies.length > 0) {
      const defaultCompany =
        companies.find((c) => c.isDefault) ?? companies[0]!;
      const next: ActiveCompany = {
        id: defaultCompany.id,
        name: defaultCompany.name,
        role: defaultCompany.role,
      };
      setActiveCompanyState(next);
      setActiveCompanyCookie(next);
    }
  }, [activeCompany, companies]);

  const switchCompany = useCallback(
    (company: CompanyDto) => {
      const next: ActiveCompany = {
        id: company.id,
        name: company.name,
        role: company.role,
      };
      setActiveCompanyCookie(next);
      setActiveCompanyState(next);
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      queryClient.invalidateQueries({ queryKey: ["taxes"] });
    },
    [queryClient],
  );

  const createCompany = useCallback(
    async (data: CreateCompanyDto): Promise<CompanyDto> => {
      const company = await createCompanyMutation.mutateAsync(data);
      const next: ActiveCompany = {
        id: company.id,
        name: company.name,
        role: company.role,
      };
      setActiveCompanyState(next);
      return company;
    },
    [createCompanyMutation],
  );

  return (
    <CompanyContext.Provider
      value={{
        activeCompany,
        companies,
        isLoading,
        switchCompany,
        createCompany,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany(): CompanyContextValue {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error("useCompany must be used within a CompanyProvider");
  }
  return context;
}
