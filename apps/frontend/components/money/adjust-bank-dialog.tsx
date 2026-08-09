"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2Icon, SaveIcon, SlidersHorizontal } from "lucide-react";
import type { AdjustBankDto, BankAdjustmentDto, BankDto } from "shared";
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
  useAdjustBankMutation,
  useUpdateBankAdjustmentMutation,
} from "@/hooks/money/use-money-query";
import { getApiErrorMessage } from "@/lib/api/client/core-client";
import { toast } from "sonner";

const formSchema = z.object({
  date: z.string().min(1, "Date is required"),
  type: z.enum(["INCREASE", "DECREASE"]),
  bankId: z.string().min(1, "Bank is required"),
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

interface AdjustBankDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly banks: BankDto[];
  readonly defaultBankId?: string;
  readonly editing?: BankAdjustmentDto | null;
}

export function AdjustBankDialog({
  open,
  onOpenChange,
  banks,
  defaultBankId,
  editing = null,
}: AdjustBankDialogProps) {
  const adjustMutation = useAdjustBankMutation();
  const updateMutation = useUpdateBankAdjustmentMutation();
  const isEdit = editing !== null;
  const initialBankId = defaultBankId ?? editing?.bankId ?? banks[0]?.id ?? "";

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
      type: "INCREASE",
      bankId: initialBankId,
      amount: "",
      description: "",
    },
  });

  const [image, setImage] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (open) {
      reset(
        editing
          ? {
              date: editing.date.slice(0, 10),
              type: editing.type,
              bankId: editing.bankId,
              amount: String(editing.amount),
              description: editing.description ?? "",
            }
          : {
              date: today(),
              type: "INCREASE",
              bankId: defaultBankId ?? banks[0]?.id ?? "",
              amount: "",
              description: "",
            },
      );
      setImage(editing?.image ?? undefined);
    }
  }, [open, editing, defaultBankId, banks, reset]);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) {
        reset({
          date: today(),
          type: "INCREASE",
          bankId: defaultBankId ?? banks[0]?.id ?? "",
          amount: "",
          description: "",
        });
        setImage(undefined);
      }
      onOpenChange(next);
    },
    [reset, defaultBankId, banks, onOpenChange],
  );

  const pending = adjustMutation.isPending || updateMutation.isPending;

  const onSubmit = useCallback(
    async (values: FormValues) => {
      const payload: AdjustBankDto = {
        date: values.date,
        type: values.type,
        amount: Number(values.amount),
      };
      if (values.description.trim() !== "") {
        payload.description = values.description.trim();
      }
      if (image) payload.image = image;

      try {
        if (isEdit && editing) {
          await updateMutation.mutateAsync({
            adjustmentId: editing.id,
            bankId: editing.bankId,
            dto: payload,
          });
        } else {
          await adjustMutation.mutateAsync({
            bankId: values.bankId,
            dto: payload,
          });
        }
        toast.success(
          values.type === "INCREASE"
            ? isEdit
              ? "Bank adjustment updated"
              : "Bank balance increased"
            : isEdit
              ? "Bank adjustment updated"
              : "Bank balance reduced",
        );
        onOpenChange(false);
        reset();
        setImage(undefined);
      } catch (err) {
        toast.error(getApiErrorMessage(err));
      }
    },
    [adjustMutation, updateMutation, isEdit, editing, onOpenChange, reset, image],
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <SlidersHorizontal className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>{isEdit ? "Edit Bank Adjustment" : "Adjust Bank Balance"}</DialogTitle>
              <DialogDescription>
                {isEdit
                  ? "Update this one-time balance adjustment for the bank account."
                  : "Record a one-time increase or decrease in a bank account balance."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-1.5">
            <Label htmlFor="adjust-bank-select" className="text-sm font-medium">
              Bank <span className="text-destructive">*</span>
            </Label>
            <Select
              value={watch("bankId")}
              onValueChange={(v) => setValue("bankId", v, { shouldValidate: true })}
              disabled={isEdit}
            >
              <SelectTrigger id="adjust-bank-select">
                <SelectValue placeholder="Select bank" />
              </SelectTrigger>
              <SelectContent>
                {banks.map((bank) => (
                  <SelectItem key={bank.id} value={bank.id}>
                    {bank.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="adjust-bank-type" className="text-sm font-medium">
                Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={watch("type")}
                onValueChange={(v) =>
                  setValue("type", v as "INCREASE" | "DECREASE", {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger id="adjust-bank-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INCREASE">Increase balance</SelectItem>
                  <SelectItem value="DECREASE">Decrease balance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="adjust-bank-date" className="text-sm font-medium">
                Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="adjust-bank-date"
                type="date"
                {...register("date")}
                aria-invalid={!!errors.date}
              />
              {errors.date && (
                <p className="text-xs text-destructive">{errors.date.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="adjust-bank-amount" className="text-sm font-medium">
              Amount <span className="text-destructive">*</span>
            </Label>
            <Input
              id="adjust-bank-amount"
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

          <div className="grid gap-1.5">
            <Label htmlFor="adjust-bank-desc" className="text-sm font-medium">
              Description <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="adjust-bank-desc"
              placeholder="e.g. Bank charged a maintenance fee"
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
              onClick={() => onOpenChange(false)}
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
              {isEdit ? "Save Changes" : "Save Adjustment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}