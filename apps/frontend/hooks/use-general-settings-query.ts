"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsApi } from "@/lib/api/erp-client";
import type { UpdateGeneralSettingsDto } from "shared";
import { settingsKeys } from "./query-keys";

export function useGeneralSettings() {
  return useQuery({
    queryKey: settingsKeys.general(),
    queryFn: settingsApi.getGeneral,
    staleTime: 60_000,
  });
}

export function useUpdateGeneralSettingsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: UpdateGeneralSettingsDto) => settingsApi.updateGeneral(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.general() });
    },
  });
}
