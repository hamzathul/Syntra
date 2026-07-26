"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { companyService } from "@/lib/api/services/company.service";
import { companyKeys } from "../query-keys";

export function useCompanies() {
  return useQuery({
    queryKey: companyKeys.list(),
    queryFn: companyService.list,
    staleTime: 30_000,
  });
}

export function useCreateCompanyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string }) => companyService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.list() });
    },
  });
}
