"use client";

import { useState } from "react";
import type { BankAdjustmentDto, BankDto, BankHistoryDto, TransferDto } from "shared";
import { TransactionList, type TransactionItem } from "../money/transaction-list";
import { AdjustBankDialog } from "../money/adjust-bank-dialog";
import { TransferDialog, type TransferMode } from "../money/transfer-dialog";
import {
  useDeleteBankAdjustmentMutation,
  useDeleteTransferMutation,
} from "@/hooks/money/use-money-query";
import { toast } from "sonner";

interface BankTransactionsProps {
  readonly bankId: string;
  readonly bankName: string;
  readonly history: BankHistoryDto;
  readonly banks: BankDto[];
  readonly currencySymbol: string;
}

export function BankTransactions({
  bankId,
  bankName,
  history,
  banks,
  currencySymbol,
}: BankTransactionsProps) {
  const deleteAdjustmentMutation = useDeleteBankAdjustmentMutation();
  const deleteTransferMutation = useDeleteTransferMutation();

  const [editingAdjustment, setEditingAdjustment] =
    useState<BankAdjustmentDto | null>(null);
  const [editingTransfer, setEditingTransfer] = useState<TransferDto | null>(
    null,
  );

  const items: TransactionItem[] = [
    ...history.adjustments.map((a) => ({
      id: a.id,
      kind: "adjustment" as const,
      label:
        a.type === "INCREASE"
          ? `${bankName}: balance increased`
          : `${bankName}: balance reduced`,
      date: a.date,
      amount: a.type === "INCREASE" ? a.amount : -a.amount,
      description: a.description,
      image: a.image,
    })),
    ...history.transfers.map((t) => {
      const incoming = t.toBankId === bankId;
      const outgoing = t.fromBankId === bankId;
      if (t.fromBankId === null) {
        return {
          id: t.id,
          kind: "transfer" as const,
          label: `Cash to ${bankName}`,
          date: t.date,
          amount: t.amount,
          description: t.description,
          image: t.image,
        };
      }
      if (t.toBankId === null) {
        return {
          id: t.id,
          kind: "transfer" as const,
          label: `${bankName} to Cash`,
          date: t.date,
          amount: -t.amount,
          description: t.description,
          image: t.image,
        };
      }
      const otherName = toBankName(incoming ? t.fromBankId : t.toBankId, banks);
      const otherLabel = otherName ?? "Bank";
      return {
        id: t.id,
        kind: "transfer" as const,
        label: outgoing
          ? `${bankName} to ${otherLabel}`
          : `${otherLabel} to ${bankName}`,
        date: t.date,
        amount: incoming ? t.amount : -t.amount,
        description: t.description,
        image: t.image,
      };
    }),
  ];

  const handleEdit = (item: TransactionItem) => {
    if (item.kind === "adjustment") {
      const adjustment = history.adjustments.find((a) => a.id === item.id);
      if (adjustment) setEditingAdjustment(adjustment);
    } else {
      const transfer = history.transfers.find((t) => t.id === item.id);
      if (transfer) setEditingTransfer(transfer);
    }
  };

  const handleDelete = async (item: TransactionItem) => {
    if (item.kind === "adjustment") {
      await deleteAdjustmentMutation.mutateAsync({
        adjustmentId: item.id,
        bankId,
      });
      toast.success("Bank adjustment deleted");
    } else {
      await deleteTransferMutation.mutateAsync(item.id);
      toast.success("Transfer deleted");
    }
  };

  return (
    <>
      <TransactionList
        items={items}
        currencySymbol={currencySymbol}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyText="No transactions for this bank yet."
      />

      <AdjustBankDialog
        open={editingAdjustment !== null}
        onOpenChange={(open) => !open && setEditingAdjustment(null)}
        banks={banks}
        editing={editingAdjustment}
      />

      {editingTransfer && (
        <TransferDialog
          open
          onOpenChange={(open) => !open && setEditingTransfer(null)}
          banks={banks}
          mode={transferMode(editingTransfer)}
          editing={editingTransfer}
        />
      )}
    </>
  );
}

function toBankName(bankId: string, banks: BankDto[]): string | null {
  return banks.find((b) => b.id === bankId)?.name ?? null;
}

function transferMode(transfer: TransferDto): TransferMode {
  if (transfer.fromBankId === null && transfer.toBankId !== null) return "TO_BANK";
  if (transfer.toBankId === null && transfer.fromBankId !== null) return "FROM_BANK";
  return "BETWEEN_BANKS";
}