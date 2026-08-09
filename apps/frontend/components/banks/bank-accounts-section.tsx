"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import {
  AlertTriangleIcon,
  LandmarkIcon,
  Loader2Icon,
  PencilIcon,
  PlusIcon,
  PrinterIcon,
  QrCodeIcon,
  Trash2Icon,
} from "lucide-react";
import type { BankDto } from "shared";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  useBanks,
  useDeleteBankMutation,
} from "@/hooks/settings/use-bank-settings-query";
import { getApiErrorMessage } from "@/lib/api/client/core-client";
import { toast } from "sonner";
import { BankFormDialog } from "./bank-form-dialog";
import { MoneyActionsPanel } from "@/components/money/money-actions-panel";

export function BankAccountsSection() {
  const { data: banks, isLoading, error } = useBanks();
  const deleteMutation = useDeleteBankMutation();

  const [formOpen, setFormOpen] = useState(false);
  const [editingBank, setEditingBank] = useState<BankDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BankDto | null>(null);

  const openCreate = useCallback(() => {
    setEditingBank(null);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((bank: BankDto) => {
    setEditingBank(bank);
    setFormOpen(true);
  }, []);

  const handleSaved = useCallback(() => {
    setFormOpen(false);
    setEditingBank(null);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success("Bank deleted");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
      setDeleteTarget(null);
    }
  }, [deleteTarget, deleteMutation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2Icon className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
        <AlertTriangleIcon className="h-6 w-6 text-destructive" />
        <p className="text-sm text-muted-foreground">
          {getApiErrorMessage(error)}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-muted-foreground">
          {banks?.length ?? 0} bank{(banks?.length ?? 0) !== 1 ? "s" : ""}{" "}
          added
        </p>
        <div className="flex items-center gap-2">
          <MoneyActionsPanel banks={banks ?? []} />
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={openCreate}
          >
            <PlusIcon className="h-4 w-4" />
            Add Bank
          </Button>
        </div>
      </div>

      <div className="border rounded-xl overflow-hidden">
        {banks && banks.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Bank</th>
                  <th className="px-4 py-3 font-medium">Opening Balance</th>
                  <th className="px-4 py-3 font-medium">Current Balance</th>
                  <th className="px-4 py-3 font-medium">Print On Invoice</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {banks.map((bank) => (
                  <BankRow
                    key={bank.id}
                    bank={bank}
                    onEdit={openEdit}
                    onDelete={setDeleteTarget}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <LandmarkIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-medium">No banks yet</p>
              <p className="text-sm text-muted-foreground">
                Add a bank account to print its details or UPI QR on invoices.
              </p>
            </div>
            <Button variant="outline" className="gap-1" onClick={openCreate}>
              <PlusIcon className="h-4 w-4" />
              Add Bank
            </Button>
          </div>
        )}
      </div>

      <BankFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        bank={editingBank}
        onSaved={handleSaved}
      />

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangleIcon className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <DialogTitle>Delete Bank</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete{" "}
                  <span className="font-medium text-foreground">
                    {deleteTarget?.name}
                  </span>
                  ?
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="text-sm text-muted-foreground">
            This action cannot be undone.
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="gap-2"
            >
              {deleteMutation.isPending ? (
                <Loader2Icon className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2Icon className="h-4 w-4" />
              )}
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function BankRow({
  bank,
  onEdit,
  onDelete,
}: {
  bank: BankDto;
  onEdit: (bank: BankDto) => void;
  onDelete: (bank: BankDto) => void;
}) {
  const balanceLabel =
    bank.openingBalance === null
      ? "—"
      : `${bank.openingBalance.toLocaleString("en-IN")}${
          bank.openingBalanceDate
            ? " · as of " + bank.openingBalanceDate.slice(0, 10)
            : ""
        }`;

  return (
    <tr className="transition-colors hover:bg-muted/30">
      <td className="px-4 py-3">
        <Link
          href={`/banks/${bank.id}`}
          className="font-medium transition-colors hover:text-primary hover:underline"
        >
          {bank.name}
        </Link>
        {bank.accountNumber && (
          <p className="text-xs text-muted-foreground">
            {bank.branchName ? `${bank.branchName} · ` : ""}
            {bank.accountNumber}
          </p>
        )}
      </td>
      <td className="px-4 py-3 text-muted-foreground">{balanceLabel}</td>
      <td className="px-4 py-3">
        <span className="font-semibold tabular-nums">
          {bank.currentBalance.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 4,
          })}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-1.5">
          <Badge
            variant={bank.printBankDetails ? "secondary" : "outline"}
            className="text-[10px] gap-1"
          >
            <PrinterIcon className="h-3 w-3" />
            {bank.printBankDetails ? "Bank Details" : "Off"}
          </Badge>
          {bank.printUpiQr && (
            <Badge variant="secondary" className="text-[10px] gap-1">
              <QrCodeIcon className="h-3 w-3" />
              UPI QR
            </Badge>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex justify-end gap-1">
          <Button size="icon" variant="ghost" onClick={() => onEdit(bank)}>
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => onDelete(bank)}>
            <Trash2Icon className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </td>
    </tr>
  );
}