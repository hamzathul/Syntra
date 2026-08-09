"use client";

import { useState } from "react";
import type { BankDto } from "shared";
import { MoneyActionMenu, type MoneyAction } from "./money-action-menu";
import { TransferDialog, type TransferMode } from "./transfer-dialog";
import { AdjustBankDialog } from "./adjust-bank-dialog";

interface MoneyActionsPanelProps {
  readonly banks: BankDto[];
  readonly label?: string;
  readonly onNoBanks?: () => void;
  readonly defaultBankId?: string;
}

export function MoneyActionsPanel({
  banks,
  label = "Deposit / Withdraw",
  onNoBanks,
  defaultBankId,
}: MoneyActionsPanelProps) {
  const [action, setAction] = useState<MoneyAction | null>(null);

  const handleSelect = (next: MoneyAction) => {
    if (banks.length === 0) {
      onNoBanks?.();
      return;
    }
    setAction(next);
  };

  const transferOpen =
    action === "TO_BANK" ||
    action === "FROM_BANK" ||
    action === "BETWEEN_BANKS";

  const transferMode: TransferMode =
    action === "TO_BANK"
      ? "TO_BANK"
      : action === "FROM_BANK"
        ? "FROM_BANK"
        : "BETWEEN_BANKS";

  return (
    <>
      <MoneyActionMenu onSelect={handleSelect} label={label} />

      <TransferDialog
        open={transferOpen}
        onOpenChange={(open) => !open && setAction(null)}
        banks={banks}
        mode={transferMode}
      />

      <AdjustBankDialog
        open={action === "ADJUST"}
        onOpenChange={(open) => !open && setAction(null)}
        banks={banks}
        defaultBankId={defaultBankId}
      />
    </>
  );
}