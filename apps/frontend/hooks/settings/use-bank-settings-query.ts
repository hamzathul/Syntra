"use client";

import { banksService } from "@/lib/api/services/settings/banks.service";
import {
  createGetQueryHook,
  createMutationHook,
  createUpdateMutationHook,
} from "@/lib/api/client/hook-factory";
import { bankKeys } from "../query-keys";

export const useBanks = createGetQueryHook(bankKeys.list, banksService.list);

export const useCreateBankMutation = createMutationHook(
  bankKeys.list,
  banksService.create,
);

export const useUpdateBankMutation = createUpdateMutationHook(
  bankKeys.list,
  banksService.update,
);

export const useDeleteBankMutation = createMutationHook(
  bankKeys.list,
  banksService.remove,
);