"use client";

import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  PlusIcon,
  PencilIcon,
  Trash2Icon,
  XIcon,
  CheckIcon,
  Loader2Icon,
  AlertTriangleIcon,
} from "lucide-react";
import type { TaxRateDto } from "shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  useTaxRates,
  useCreateTaxRateMutation,
  useUpdateTaxRateMutation,
  useDeleteTaxRateMutation,
} from "@/hooks/settings/use-tax-settings-query";
import { getApiErrorMessage } from "@/lib/api/client/core-client";
import { toast } from "sonner";

const taxRateFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name too long"),
  rate: z
    .string()
    .refine(
      (v) => v !== "" && Number.isFinite(Number(v)) && Number(v) >= 0,
      "Enter a valid rate",
    ),
});

type TaxRateFormValues = z.infer<typeof taxRateFormSchema>;

function TaxRateEditRow({
  rate,
  onCancel,
}: {
  rate: TaxRateDto;
  onCancel: () => void;
}) {
  const updateMutation = useUpdateTaxRateMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TaxRateFormValues>({
    resolver: zodResolver(taxRateFormSchema),
    defaultValues: { name: rate.name, rate: String(rate.rate) },
  });

  const onSubmit = useCallback(
    async (values: TaxRateFormValues) => {
      try {
        await updateMutation.mutateAsync({
          id: rate.id,
          dto: { name: values.name.trim(), rate: parseFloat(values.rate) },
        });
        toast.success("Tax rate updated");
        onCancel();
      } catch (err: unknown) {
        toast.error(getApiErrorMessage(err));
      }
    },
    [rate.id, updateMutation, onCancel],
  );

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex items-center gap-3 w-full"
    >
      <div className="grid gap-1 flex-1">
        <Input
          placeholder="Name"
          {...register("name")}
          className="h-8"
          aria-invalid={!!errors.name}
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>
      <div className="grid gap-1 w-24">
        <Input
          type="number"
          step="0.01"
          min="0"
          placeholder="Rate"
          {...register("rate")}
          className="h-8"
          aria-invalid={!!errors.rate}
        />
        {errors.rate && (
          <p className="text-xs text-destructive">{errors.rate.message}</p>
        )}
      </div>
      <div className="flex gap-1">
        <Button type="submit" size="icon" variant="ghost">
          <CheckIcon className="h-4 w-4 text-green-600" />
        </Button>
        <Button size="icon" variant="ghost" type="button" onClick={onCancel}>
          <XIcon className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}

export function TaxRatesTab() {
  const { data: rates, isLoading, error } = useTaxRates();
  const createMutation = useCreateTaxRateMutation();
  const deleteMutation = useDeleteTaxRateMutation();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TaxRateDto | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<TaxRateFormValues>({
    resolver: zodResolver(taxRateFormSchema),
    defaultValues: { name: "", rate: "" },
  });

  const newName = watch("name");
  const newRate = watch("rate");

  const resetAddForm = useCallback(() => {
    setIsAdding(false);
    reset({ name: "", rate: "" });
  }, [reset]);

  const handleAdd = useCallback(
    async (values: TaxRateFormValues) => {
      try {
        await createMutation.mutateAsync({
          name: values.name.trim(),
          rate: parseFloat(values.rate),
        });
        toast.success("Tax rate added");
        resetAddForm();
      } catch (err: unknown) {
        toast.error(getApiErrorMessage(err));
      }
    },
    [createMutation, resetAddForm],
  );

  const cancelEdit = useCallback(() => setEditingId(null), []);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success("Tax rate deleted");
      setDeleteTarget(null);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err));
      setDeleteTarget(null);
    }
  }, [deleteTarget, deleteMutation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2Icon className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
        <AlertTriangleIcon className="h-6 w-6 text-destructive" />
        <p className="text-sm text-muted-foreground">
          {getApiErrorMessage(error)}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {rates?.length ?? 0} tax rate{(rates?.length ?? 0) !== 1 ? "s" : ""}{" "}
          configured
        </p>
        {!isAdding && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAdding(true)}
            className="gap-1"
          >
            <PlusIcon className="h-4 w-4" />
            Add Tax Rate
          </Button>
        )}
      </div>

      {isAdding && (
        <form
          onSubmit={handleSubmit(handleAdd)}
          className="flex items-end gap-3 p-3 border rounded-lg bg-muted/30"
        >
          <div className="grid gap-1.5 flex-1">
            <Label htmlFor="new-name" className="text-xs">
              Name
            </Label>
            <Input
              id="new-name"
              placeholder="e.g. CGST"
              aria-invalid={!!errors.name}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="grid gap-1.5 w-24">
            <Label htmlFor="new-rate" className="text-xs">
              Rate (%)
            </Label>
            <Input
              id="new-rate"
              type="number"
              step="0.01"
              min="0"
              placeholder="18"
              aria-invalid={!!errors.rate}
              {...register("rate")}
            />
            {errors.rate && (
              <p className="text-xs text-destructive">{errors.rate.message}</p>
            )}
          </div>
          <div className="flex gap-1">
            <Button
              type="submit"
              size="icon"
              variant="ghost"
              disabled={!newName.trim() || !newRate || createMutation.isPending}
            >
              <CheckIcon className="h-4 w-4 text-green-600" />
            </Button>
            <Button size="icon" variant="ghost" type="button" onClick={resetAddForm}>
              <XIcon className="h-4 w-4" />
            </Button>
          </div>
        </form>
      )}

      <div className="border rounded-lg divide-y">
        {rates && rates.length > 0 ? (
          rates.map((rate) => (
            <div key={rate.id} className="flex items-center gap-3 px-4 py-3">
              {editingId === rate.id ? (
                <TaxRateEditRow rate={rate} onCancel={cancelEdit} />
              ) : (
                <>
                  <span className="flex-1 text-sm font-medium">{rate.name}</span>
                  <span className="w-24 text-sm text-muted-foreground">
                    {rate.rate}%
                  </span>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setEditingId(rate.id)}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setDeleteTarget(rate)}
                    >
                      <Trash2Icon className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))
        ) : (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            No tax rates defined yet. Add your first tax rate above.
          </div>
        )}
      </div>

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
                <DialogTitle>Delete Tax Rate</DialogTitle>
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
          <div className="text-sm text-muted-foreground px-13">
            This action cannot be undone. If this tax rate is used in any tax
            group, the deletion will be blocked.
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
    </div>
  );
}