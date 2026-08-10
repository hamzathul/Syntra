"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowDownCircle,
  ArrowLeftRight,
  ArrowUpCircle,
  Loader2Icon,
  SaveIcon,
} from "lucide-react";
import { CASH, type BankDto, type CreateTransferDto, type TransferDto } from "shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUploadField } from "./image-upload-field";
import {
  useCreateTransferMutation,
  useUpdateTransferMutation,
} from "@/hooks/money/use-money-query";
import { getApiErrorMessage } from "@/lib/api/client/core-client";
import { toast } from "sonner";

const formSchema = z.object({
  date: z.string().min(1, "Date is required"),
  from: z.string().min(1, "From is required"),
  to: z.string().min(1, "To is required"),
  amount: z
    .string()
    .refine((v) => {
      const n = Number(v);
      return Number.isFinite(n) && n > 0;
    }, "Amount must be a positive number"),
  description: z.string().max(500, "Description too long"),
});

type FormValues = z.infer<typeof formSchema>;

function today() {
  return new Date().toISOString().slice(0, 10);
}

export type TransferMode = "TO_BANK" | "FROM_BANK" | "BETWEEN_BANKS";

interface TransferDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly banks: BankDto[];
  readonly mode: TransferMode;
  readonly editing?: TransferDto | null;
}

const modeCopy: Record<
  TransferMode,
  {
    title: string;
    description: string;
    hint: string;
    subtitle: string;
  }
> = {
  TO_BANK: {
    title: "Deposit Cash to Bank",
    description: "Move cash from your till to a bank account.",
    hint: "Money leaves your cash balance and is added to the selected bank.",
    subtitle: "From: Cash (fixed)",
  },
  FROM_BANK: {
    title: "Withdraw Cash from Bank",
    description: "Move money from a bank account to your cash balance.",
    hint: "Money leaves the selected bank and is added to your cash balance.",
    subtitle: "To: Cash (fixed)",
  },
  BETWEEN_BANKS: {
    title: "Bank to Bank Transfer",
    description: "Move money between two bank accounts.",
    hint: "The same bank cannot be both the source and the destination.",
    subtitle: "Choose two different bank accounts",
  },
};

export function TransferDialog({
  open,
  onOpenChange,
  banks,
  mode,
  editing = null,
}: TransferDialogProps) {
  const copy = modeCopy[mode];
  const isEdit = editing !== null;
  const transferMutation = useCreateTransferMutation();
  const updateMutation = useUpdateTransferMutation();
  const pending = transferMutation.isPending || updateMutation.isPending;
  const bankItems = banks.map((b) => ({ value: b.id, label: b.name }));
  const cashItem = { value: CASH, label: "Cash" };

  const fromIsCashLocked = mode === "TO_BANK";
  const toIsCashLocked = mode === "FROM_BANK";

  const defaultFrom = fromIsCashLocked ? CASH : "";
  const defaultTo = toIsCashLocked ? CASH : "";

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: today(),
      from: defaultFrom,
      to: defaultTo,
      amount: "",
      description: "",
    },
  });

  const [image, setImage] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      reset({
        date: editing.date.slice(0, 10),
        from: editing.fromBankId ?? CASH,
        to: editing.toBankId ?? CASH,
        amount: String(editing.amount),
        description: editing.description ?? "",
      });
      setImage(editing.image ?? undefined);
    } else {
      reset({
        date: today(),
        from: defaultFrom,
        to: defaultTo,
        amount: "",
        description: "",
      });
      setImage(undefined);
    }
  }, [open, editing, reset, defaultFrom, defaultTo]);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) {
        reset({
          date: today(),
          from: defaultFrom,
          to: defaultTo,
          amount: "",
          description: "",
        });
        setImage(undefined);
      }
      onOpenChange(next);
    },
    [reset, defaultFrom, defaultTo, onOpenChange],
  );

  const fromValue = watch("from");
  const toValue = watch("to");

  const fromOptions = fromIsCashLocked
    ? [cashItem]
    : bankItems.filter((b) => b.value !== toValue);

  const toOptions = toIsCashLocked
    ? [cashItem]
    : bankItems.filter((b) => b.value !== fromValue);

  const handleFromChange = (v: string) => {
    setValue("from", v, { shouldValidate: true });
    if (toValue === v) setValue("to", "", { shouldValidate: true });
  };

  const handleToChange = (v: string) => {
    setValue("to", v, { shouldValidate: true });
    if (fromValue === v) setValue("from", "", { shouldValidate: true });
  };

  const onSubmit = useCallback(
    async (values: FormValues) => {
      const payload: CreateTransferDto = {
        date: values.date,
        from: values.from,
        to: values.to,
        amount: Number(values.amount),
      };
      if (values.description.trim() !== "") {
        payload.description = values.description.trim();
      }
      if (image) payload.image = image;

      try {
        if (isEdit && editing) {
          await updateMutation.mutateAsync({
            transferId: editing.id,
            dto: payload,
          });
        } else {
          await transferMutation.mutateAsync(payload);
        }
        toast.success(isEdit ? "Transfer updated" : copy.title);
        onOpenChange(false);
        reset();
        setImage(undefined);
      } catch (err) {
        toast.error(getApiErrorMessage(err));
      }
    },
    [transferMutation, updateMutation, isEdit, editing, onOpenChange, reset, copy.title, image],
  );

  const actionLabel =
    mode === "TO_BANK"
      ? "Deposit"
      : mode === "FROM_BANK"
        ? "Withdraw"
        : "Transfer";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
              {mode === "TO_BANK" ? (
                <ArrowUpCircle className="h-5 w-5 text-primary" />
              ) : mode === "FROM_BANK" ? (
                <ArrowDownCircle className="h-5 w-5 text-primary" />
              ) : (
                <ArrowLeftRight className="h-5 w-5 text-primary" />
              )}
            </div>
            <div>
              <DialogTitle>{isEdit ? "Edit Transfer" : copy.title}</DialogTitle>
              <DialogDescription>
                {isEdit
                  ? "Update this money transfer."
                  : copy.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <p className="rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
            {copy.hint}
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="transfer-from" className="text-sm font-medium">
                From <span className="text-destructive">*</span>
              </Label>
              <Select
                value={fromValue}
                onValueChange={handleFromChange}
                disabled={fromIsCashLocked}
              >
                <SelectTrigger
                  id="transfer-from"
                  className={fromIsCashLocked ? "opacity-60" : ""}
                >
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  {fromOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="transfer-to" className="text-sm font-medium">
                To <span className="text-destructive">*</span>
              </Label>
              <Select
                value={toValue}
                onValueChange={handleToChange}
                disabled={toIsCashLocked}
              >
                <SelectTrigger
                  id="transfer-to"
                  className={toIsCashLocked ? "opacity-60" : ""}
                >
                  <SelectValue placeholder="Select destination" />
                </SelectTrigger>
                <SelectContent>
                  {toOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="transfer-date" className="text-sm font-medium">
                Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="transfer-date"
                type="date"
                {...register("date")}
                aria-invalid={!!errors.date}
              />
              {errors.date && (
                <p className="text-xs text-destructive">{errors.date.message}</p>
              )}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="transfer-amount" className="text-sm font-medium">
                Amount <span className="text-destructive">*</span>
              </Label>
              <Input
                id="transfer-amount"
                type="number"
                step="0.0001"
                min="0"
                placeholder="0.00"
                {...register("amount")}
                aria-invalid={!!errors.amount}
              />
              {errors.amount && (
                <p className="text-xs text-destructive">{errors.amount.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="transfer-desc" className="text-sm font-medium">
              Description <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="transfer-desc"
              placeholder="e.g. Weekly cash deposit"
              {...register("description")}
              aria-invalid={!!errors.description}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description.message}</p>
            )}
          </div>

          <ImageUploadField value={image} onChange={setImage} />

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={pending}
              className="gap-2"
            >
              {pending ? (
                <Loader2Icon className="h-4 w-4 animate-spin" />
              ) : (
                <SaveIcon className="h-4 w-4" />
              )}
              {isEdit ? "Save Changes" : actionLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}