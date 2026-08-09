"use client";

import { useState } from "react";
import type {
  AdjustmentDto,
  BankDto,
  TransferDto,
} from "shared";
import { TransactionList, type TransactionItem } from "./transaction-list";
import { AdjustCashDialog } from "./adjust-cash-dialog";
import { TransferDialog, type TransferMode } from "./transfer-dialog";
import {
  useDeleteCashAdjustmentMutation,
  useDeleteTransferMutation,
} from "@/hooks/money/use-money-query";
import { toast } from "sonner";

interface CashTransactionsProps {
  readonly adjustments: AdjustmentDto[];
  readonly transfers: TransferDto[];
  readonly banks: BankDto[];
  readonly currencySymbol: string;
}

export function CashTransactions({
  adjustments,
  transfers,
  banks,
  currencySymbol,
}: CashTransactionsProps) {
  const deleteAdjustmentMutation = useDeleteCashAdjustmentMutation();
  const deleteTransferMutation = useDeleteTransferMutation();

  const [editingAdjustment, setEditingAdjustment] =
    useState<AdjustmentDto | null>(null);
  const [editingTransfer, setEditingTransfer] = useState<TransferDto | null>(
    null,
  );

  const items: TransactionItem[] = [
    ...adjustments.map((a) => ({
      id: a.id,
      kind: "adjustment" as const,
      label: a.type === "INCREASE" ? "Cash added" : "Cash reduced",
      date: a.date,
      amount: a.type === "INCREASE" ? a.amount : -a.amount,
      description: a.description,
      image: null,
    })),
    ...transfers.map((t) => ({
      id: t.id,
      kind: "transfer" as const,
      label:
        t.fromBankId === null
          ? toBankName(t.toBankId, banks)
            ? `Cash to ${toBankName(t.toBankId, banks)}`
            : "Cash to bank"
          : "Bank to cash",
      date: t.date,
      amount: t.toBankId === null ? t.amount : -t.amount,
      description: t.description,
      image: t.image,
    })),
  ];

  const handleEdit = (item: TransactionItem) => {
    if (item.kind === "adjustment") {
      const adjustment = adjustments.find((a) => a.id === item.id);
      if (adjustment) setEditingAdjustment(adjustment);
    } else {
      const transfer = transfers.find((t) => t.id === item.id);
      if (transfer) setEditingTransfer(transfer);
    }
  };

  const handleDelete = async (item: TransactionItem) => {
    if (item.kind === "adjustment") {
      await deleteAdjustmentMutation.mutateAsync(item.id);
      toast.success("Cash adjustment deleted");
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
        emptyText="No transactions yet. Use the buttons above to record one."
      />

      <AdjustCashDialog
        open={editingAdjustment !== null}
        onOpenChange={(open) => !open && setEditingAdjustment(null)}
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

function toBankName(bankId: string | null, banks: BankDto[]): string | null {
  return bankId === null ? null : (banks.find((b) => b.id === bankId)?.name ?? null);
}

function transferMode(transfer: TransferDto): TransferMode {
  if (transfer.fromBankId === null && transfer.toBankId !== null) return "TO_BANK";
  if (transfer.toBankId === null && transfer.fromBankId !== null) return "FROM_BANK";
  return "BETWEEN_BANKS";
}