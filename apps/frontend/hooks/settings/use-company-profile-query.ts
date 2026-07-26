"use client";

import { companyProfileService } from "@/lib/api/services/settings/company-profile.service";
import { createGetQueryHook, createMutationHook } from "@/lib/api/client/hook-factory";
import { settingsKeys } from "../query-keys";

export const useCompanyProfile = createGetQueryHook(
  settingsKeys.companyProfile,
  companyProfileService.get,
);

export const useUpdateCompanyProfileMutation = createMutationHook(
  settingsKeys.companyProfile,
  companyProfileService.update,
);
