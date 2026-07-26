"use client";

import { companyService } from "@/lib/api/services/company.service";
import { createGetQueryHook, createMutationHook } from "@/lib/api/client/hook-factory";
import { companyKeys } from "../query-keys";

export const useCompanies = createGetQueryHook(
  companyKeys.list,
  companyService.list,
  30_000,
);

export const useCreateCompanyMutation = createMutationHook(
  companyKeys.list,
  companyService.create,
);
