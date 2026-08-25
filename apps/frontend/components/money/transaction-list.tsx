"use client";

import { useState } from "react";
import {
  AlertTriangleIcon,
  ArrowDownLeft,
  ArrowUpRight,
  FileIcon,
  HistoryIcon,
  Loader2Icon,
  PencilIcon,
  ReceiptIcon,
  SlidersHorizontal,
  Trash2Icon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { getApiErrorMessage } from "@/lib/api/client/core-client";
import { toast } from "sonner";

export interface TransactionItem {
  readonly id: string;
  readonly kind: "adjustment" | "transfer" | "sale";
  readonly label: string;
  readonly date: string;
  readonly amount: number;
  readonly description: string | null;
  readonly image: string | null;
  readonly href?: string;
}

interface TransactionListProps {
  readonly items: TransactionItem[];
  readonly currencySymbol: string;
  readonly onEdit: (item: TransactionItem) => void;
  readonly onDelete: (item: TransactionItem) => Promise<void>;
  readonly emptyText?: string;
}

export function TransactionList({
  items,
  currencySymbol,
  onEdit,
  onDelete,
  emptyText = "No transactions yet.",
}: TransactionListProps) {
  const [deleteTarget, setDeleteTarget] = useState<TransactionItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await onDelete(deleteTarget);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
        <HistoryIcon className="h-6 w-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{emptyText}</p>
      </div>
    );
  }

  return (
    <>
      <ul className="divide-y">
        {items.map((item) => (
          <li
            key={`${item.kind}-${item.id}`}
            className="flex items-center gap-3 py-3"
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                item.amount >= 0
                  ? "bg-emerald-500/10 text-emerald-600"
                  : "bg-red-500/10 text-red-600"
              }`}
            >
              {item.kind === "adjustment" ? (
                <SlidersHorizontal className="h-4 w-4" />
              ) : item.kind === "sale" ? (
                <ReceiptIcon className="h-4 w-4" />
              ) : item.amount >= 0 ? (
                <ArrowDownLeft className="h-4 w-4" />
              ) : (
                <ArrowUpRight className="h-4 w-4" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{item.label}</p>
              <p className="truncate text-xs text-muted-foreground">
                {formatDate(item.date)}
                {item.description ? ` · ${item.description}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <div className="mr-1 flex items-center gap-2">
                {item.image && (
                  <FileIcon className="h-4 w-4 text-muted-foreground" />
                )}
                <span
                  className={`shrink-0 text-sm font-semibold tabular-nums ${
                    item.amount >= 0 ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  {item.amount >= 0 ? "+" : ""}
                  {formatAmount(item.amount, currencySymbol)}
                </span>
              </div>
              {item.href ? (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  asChild
                  aria-label="View sale"
                >
                  <Link href={item.href}>
                    <PencilIcon className="h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => onEdit(item)}
                  aria-label="Edit transaction"
                >
                  <PencilIcon className="h-4 w-4" />
                </Button>
              )}
              {!item.href && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 hover:text-destructive"
                  onClick={() => setDeleteTarget(item)}
                  aria-label="Delete transaction"
                >
                  <Trash2Icon className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangleIcon className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <DialogTitle>Delete transaction</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this {deleteTarget?.label}?
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="text-sm text-muted-foreground">
            The stored balance will be repaired by undoing this transaction.
            This action cannot be undone.
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
              className="gap-2"
            >
              {deleting ? (
                <Loader2Icon className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2Icon className="h-4 w-4" />
              )}
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function formatAmount(amount: number, symbol: string): string {
  return `${symbol}${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  })}`;
}

function formatDate(date: string): string {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}