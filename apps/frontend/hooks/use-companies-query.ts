"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { companyApi } from "@/lib/api/erp-client";
import { setActiveCompany } from "@/lib/auth";
import { companyKeys } from "./query-keys";

export function useCompanies() {
  return useQuery({
    queryKey: companyKeys.list(),
    queryFn: companyApi.list,
    staleTime: 30_000,
  });
}

export function useCreateCompanyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string }) => companyApi.create(data),
    onSuccess: (company) => {
      queryClient.invalidateQueries({ queryKey: companyKeys.list() });
      setActiveCompany({ id: company.id, name: company.name, role: company.role });
    },
  });
}
