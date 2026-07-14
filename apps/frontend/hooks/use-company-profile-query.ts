"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsApi } from "@/lib/api/erp-client";
import type { UpdateCompanyProfileDto } from "shared";
import { settingsKeys } from "./query-keys";

export function useCompanyProfile() {
  return useQuery({
    queryKey: settingsKeys.companyProfile(),
    queryFn: settingsApi.getCompanyProfile,
    staleTime: 60_000,
  });
}

export function useUpdateCompanyProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: UpdateCompanyProfileDto) => settingsApi.updateCompanyProfile(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.companyProfile() });
    },
  });
}
