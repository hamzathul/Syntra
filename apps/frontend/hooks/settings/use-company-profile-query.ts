"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { companyProfileService } from "@/lib/api/services/settings/company-profile.service";
import type { UpdateCompanyProfileDto } from "shared";
import { settingsKeys } from "../query-keys";

export function useCompanyProfile() {
  return useQuery({
    queryKey: settingsKeys.companyProfile(),
    queryFn: companyProfileService.get,
    staleTime: 60_000,
  });
}

export function useUpdateCompanyProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: UpdateCompanyProfileDto) => companyProfileService.update(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.companyProfile() });
    },
  });
}
