"use client";

import { generalSettingsService } from "@/lib/api/services/settings/general.service";
import { createGetQueryHook, createMutationHook } from "@/lib/api/client/hook-factory";
import { settingsKeys } from "../query-keys";

export const useGeneralSettings = createGetQueryHook(
  settingsKeys.general,
  generalSettingsService.get,
);

export const useUpdateGeneralSettingsMutation = createMutationHook(
  settingsKeys.general,
  generalSettingsService.update,
);
