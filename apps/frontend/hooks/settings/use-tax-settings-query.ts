"use client";

import { taxesService } from "@/lib/api/services/settings/taxes.service";
import { createGetQueryHook, createMutationHook, createUpdateMutationHook } from "@/lib/api/client/hook-factory";
import { taxKeys } from "../query-keys";

export const useTaxRates = createGetQueryHook(taxKeys.rates, taxesService.rates.list);

export const useCreateTaxRateMutation = createMutationHook(taxKeys.rates, taxesService.rates.create);

export const useUpdateTaxRateMutation = createUpdateMutationHook(taxKeys.rates, taxesService.rates.update);

export const useDeleteTaxRateMutation = createMutationHook(taxKeys.rates, taxesService.rates.remove);

export const useTaxGroups = createGetQueryHook(taxKeys.groups, taxesService.groups.list);

export const useCreateTaxGroupMutation = createMutationHook(taxKeys.groups, taxesService.groups.create);

export const useUpdateTaxGroupMutation = createUpdateMutationHook(taxKeys.groups, taxesService.groups.update);

export const useDeleteTaxGroupMutation = createMutationHook(taxKeys.groups, taxesService.groups.remove);
