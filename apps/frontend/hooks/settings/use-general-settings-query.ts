"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { generalSettingsService } from "@/lib/api/services/settings/general.service";
import type { UpdateGeneralSettingsDto } from "shared";
import { settingsKeys } from "../query-keys";

export function useGeneralSettings() {
  return useQuery({
    queryKey: settingsKeys.general(),
    queryFn: generalSettingsService.get,
    staleTime: 60_000,
  });
}

export function useUpdateGeneralSettingsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: UpdateGeneralSettingsDto) => generalSettingsService.update(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.general() });
    },
  });
}
