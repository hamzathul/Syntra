"use client";

import type {
  AdjustBankDto,
  AdjustCashDto,
  BankHistoryDto,
  CreateTransferDto,
} from "shared";
import { moneyService } from "@/lib/api/services/money/money.service";
import {
  createGetDetailQueryHook,
  createGetQueryHook,
  createMutationHook,
} from "@/lib/api/client/hook-factory";
import { bankKeys, moneyKeys } from "../query-keys";

export const useCashSummary = createGetQueryHook(
  moneyKeys.cash,
  moneyService.getCashSummary,
);

export const useAdjustCashMutation = createMutationHook(
  moneyKeys.cash,
  moneyService.adjustCash,
);

export const useUpdateCashAdjustmentMutation = createMutationHook(
  moneyKeys.cash,
  (variables: { adjustmentId: string; dto: AdjustCashDto }) =>
    moneyService.cashAdjustments.update(
      variables.adjustmentId,
      variables.dto,
    ),
);

export const useDeleteCashAdjustmentMutation = createMutationHook(
  moneyKeys.cash,
  (adjustmentId: string) => moneyService.cashAdjustments.remove(adjustmentId),
);

export const useCreateTransferMutation = createMutationHook(
  () => moneyKeys.all,
  (dto: CreateTransferDto) => moneyService.transfers.create(dto),
  [bankKeys.list],
);

export const useUpdateTransferMutation = createMutationHook(
  () => moneyKeys.all,
  (variables: { transferId: string; dto: CreateTransferDto }) =>
    moneyService.transfers.update(variables.transferId, variables.dto),
  [bankKeys.list],
);

export const useDeleteTransferMutation = createMutationHook(
  () => moneyKeys.all,
  (transferId: string) => moneyService.transfers.remove(transferId),
  [bankKeys.list],
);

export const useAdjustBankMutation = createMutationHook(
  () => moneyKeys.all,
  (variables: { bankId: string; dto: AdjustBankDto }) =>
    moneyService.adjustBank(variables.bankId, variables.dto),
  [bankKeys.list],
);

export const useUpdateBankAdjustmentMutation = createMutationHook(
  () => moneyKeys.all,
  (variables: {
    adjustmentId: string;
    bankId: string;
    dto: AdjustBankDto;
  }) =>
    moneyService.banks
      .adjustments(variables.bankId)
      .update(variables.adjustmentId, variables.dto),
  [bankKeys.list],
);

export const useDeleteBankAdjustmentMutation = createMutationHook(
  () => moneyKeys.all,
  (variables: { adjustmentId: string; bankId: string }) =>
    moneyService.banks.adjustments(variables.bankId).remove(variables.adjustmentId),
  [bankKeys.list],
);

export const useBankHistory = createGetDetailQueryHook(
  moneyKeys.bankHistory,
  (bankId: string): Promise<BankHistoryDto> => moneyService.getBankHistory(bankId),
);