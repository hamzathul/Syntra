"use client";

import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2Icon, SaveIcon, SlidersHorizontal } from "lucide-react";
import type { AdjustCashDto, AdjustmentDto } from "shared";
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
import {
  useAdjustCashMutation,
  useUpdateCashAdjustmentMutation,
} from "@/hooks/money/use-money-query";
import { getApiErrorMessage } from "@/lib/api/client/core-client";
import { toast } from "sonner";

const formSchema = z.object({
  date: z.string().min(1, "Date is required"),
  type: z.enum(["INCREASE", "DECREASE"]),
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

interface AdjustCashDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly editing?: AdjustmentDto | null;
}

export function AdjustCashDialog({
  open,
  onOpenChange,
  editing = null,
}: AdjustCashDialogProps) {
  const adjustMutation = useAdjustCashMutation();
  const updateMutation = useUpdateCashAdjustmentMutation();
  const isEdit = editing !== null;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { date: today(), type: "INCREASE", amount: "", description: "" },
  });

  useEffect(() => {
    if (open) {
      reset(
        editing
          ? {
              date: editing.date.slice(0, 10),
              type: editing.type,
              amount: String(editing.amount),
              description: editing.description ?? "",
            }
          : { date: today(), type: "INCREASE", amount: "", description: "" },
      );
    }
  }, [open, editing, reset]);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) reset({ date: today(), type: "INCREASE", amount: "", description: "" });
      onOpenChange(next);
    },
    [onOpenChange, reset],
  );

  const pending = adjustMutation.isPending || updateMutation.isPending;

  const onSubmit = useCallback(
    async (values: FormValues) => {
      const payload: AdjustCashDto = {
        date: values.date,
        type: values.type,
        amount: Number(values.amount),
      };
      if (values.description.trim() !== "") {
        payload.description = values.description.trim();
      }
      try {
        if (isEdit && editing) {
          await updateMutation.mutateAsync({
            adjustmentId: editing.id,
            dto: payload,
          });
        } else {
          await adjustMutation.mutateAsync(payload);
        }
        toast.success(
          values.type === "INCREASE"
            ? isEdit
              ? "Cash adjustment updated"
              : "Cash added"
            : isEdit
              ? "Cash adjustment updated"
              : "Cash reduced",
        );
        onOpenChange(false);
        reset();
      } catch (err) {
        toast.error(getApiErrorMessage(err));
      }
    },
    [adjustMutation, updateMutation, isEdit, editing, onOpenChange, reset],
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
              <DialogTitle>{isEdit ? "Edit Cash Adjustment" : "Adjust Cash"}</DialogTitle>
              <DialogDescription>
                {isEdit
                  ? "Update this cash balance adjustment."
                  : "Increase or reduce your cash balance on hand."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="cash-adjust-type" className="text-sm font-medium">
                Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={watch("type")}
                onValueChange={(v) =>
                  setValue(
                    "type",
                    v as "INCREASE" | "DECREASE",
                    { shouldValidate: true },
                  )
                }
              >
                <SelectTrigger id="cash-adjust-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INCREASE">Add money</SelectItem>
                  <SelectItem value="DECREASE">Reduce money</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="cash-adjust-date" className="text-sm font-medium">
                Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="cash-adjust-date"
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
            <Label htmlFor="cash-adjust-amount" className="text-sm font-medium">
              Amount <span className="text-destructive">*</span>
            </Label>
            <Input
              id="cash-adjust-amount"
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
            <Label htmlFor="cash-adjust-desc" className="text-sm font-medium">
              Description <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="cash-adjust-desc"
              placeholder="e.g. Petty cash added"
              {...register("description")}
              aria-invalid={!!errors.description}
            />
            {errors.description && (
              <p className="text-xs text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

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