"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Controller,
  useFieldArray,
  useForm,
  useWatch,
} from "react-hook-form";
import type {
  Control,
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangleIcon,
  BanknoteIcon,
  Loader2Icon,
  LockIcon,
  PlusIcon,
  SaveIcon,
  Trash2Icon,
} from "lucide-react";
import type { SaleDto } from "shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
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
import { ImageUploadField } from "@/components/money/image-upload-field";
import {
  useCreateSaleMutation,
  useDeleteSaleMutation,
  useUpdateSaleMutation,
} from "@/hooks/sales/use-sales-query";
import { useParties } from "@/hooks/parties/use-parties-query";
import { useBanks } from "@/hooks/settings/use-bank-settings-query";
import { getApiErrorMessage } from "@/lib/api/client/core-client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  emptySaleFormValues,
  saleFormSchema,
  saleFormValuesFromDto,
  toCreateSalePayload,
  toUpdateSalePayload,
  type SaleFormValues,
  type SalePaymentFormValues,
} from "./sale-form-values";
import { DocumentUploadField } from "./document-upload-field";

const formatAmount = (value: number) =>
  value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const paymentModeCopy: Record<SalePaymentFormValues["mode"], string> = {
  CASH: "Cash",
  CHEQUE: "Cheque",
  BANK: "Bank",
};

const saleTypeCopy: Record<"CASH" | "CREDIT", string> = {
  CASH: "Cash",
  CREDIT: "Credit",
};

interface SaleFormProps {
  sale?: SaleDto;
}

export function SaleForm({ sale }: SaleFormProps) {
  const router = useRouter();
  const isEdit = Boolean(sale);

  const createMutation = useCreateSaleMutation();
  const updateMutation = useUpdateSaleMutation();
  const deleteMutation = useDeleteSaleMutation();
  const { data: parties } = useParties();
  const { data: banks } = useBanks();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleDelete = useCallback(async () => {
    if (!sale) return;
    try {
      await deleteMutation.mutateAsync(sale.id);
      toast.success("Sale deleted");
      router.push("/sales");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
      setDeleteOpen(false);
    }
  }, [sale, deleteMutation, router]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<SaleFormValues>({
    resolver: zodResolver(saleFormSchema),
    defaultValues: sale ? saleFormValuesFromDto(sale) : emptySaleFormValues(),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "payments",
  });

  useEffect(() => {
    if (sale) reset(saleFormValuesFromDto(sale));
  }, [sale, reset]);

  const saleType = watch("saleType");
  const totalAmount = watch("totalAmount");
  const receivedAmount = watch("receivedAmount");

  const total = Number(totalAmount) || 0;
  const paymentsTotal = fields.reduce(
    (acc, _, index) => acc + (Number(watch(`payments.${index}.amount`)) || 0),
    0,
  );
  const received = saleType === "CASH" ? total : (Number(receivedAmount) || 0);
  const balanceDue = total - received;

  const lockedIndices = useMemo(() => {
    if (!sale) return [];
    return sale.payments
      .map((payment, index) =>
        payment.cheque && payment.cheque.status !== "RECEIVED" ? index : -1,
      )
      .filter((index) => index >= 0);
  }, [sale]);
  const paymentsLocked = lockedIndices.length > 0;

  const handleSaleTypeChange = useCallback(
    (type: "CASH" | "CREDIT") => {
      setValue("saleType", type, { shouldValidate: true });
      if (type === "CASH" && Number(totalAmount) > 0) {
        const current = watch("payments");
        if (current.length === 0) {
          append({
            mode: "CASH",
            amount: totalAmount,
            bankId: "",
            description: "",
            cheque: {
              drawBankName: "",
              chequeNumber: "",
              chequeDate: new Date().toISOString().slice(0, 10),
              notes: "",
              image: null,
            },
          });
        } else if (current.every((payment) => !Number(payment.amount))) {
          setValue("payments.0.amount", totalAmount, { shouldValidate: true });
        }
      }
    },
    [setValue, watch, append, totalAmount],
  );

  const addPayment = useCallback(() => {
    append({
      mode: "CASH",
      amount: "",
      bankId: "",
      description: "",
      cheque: {
        drawBankName: "",
        chequeNumber: "",
        chequeDate: new Date().toISOString().slice(0, 10),
        notes: "",
        image: null,
      },
    });
  }, [append]);

  const onSubmit = useCallback(
    async (values: SaleFormValues) => {
      try {
        if (isEdit && sale) {
          await updateMutation.mutateAsync({
            id: sale.id,
            dto: toUpdateSalePayload(values),
          });
          toast.success("Sale updated");
        } else {
          await createMutation.mutateAsync(toCreateSalePayload(values));
          toast.success("Sale created");
        }
        router.push("/sales");
      } catch (err) {
        toast.error(getApiErrorMessage(err));
      }
    },
    [isEdit, sale, updateMutation, createMutation, router],
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEdit ? "Edit Sale" : "New Sale"}
          </h1>
          <p className="text-muted-foreground">
            Record a cash or credit sale with its payments
          </p>
        </div>
      </div>

      <section className="space-y-6">
        <h2 className="text-lg font-semibold">Sale Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="sale-party" className="text-sm font-medium">
              Customer <span className="text-destructive">*</span>
            </Label>
            <Controller
              control={control}
              name="partyId"
              render={({ field }) => (
                <Select
                  value={field.value || "__none__"}
                  onValueChange={(value) =>
                    field.onChange(value === "__none__" ? "" : value)
                  }
                >
                  <SelectTrigger id="sale-party">
                    <SelectValue placeholder="Select a customer..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">
                      Select a customer...
                    </SelectItem>
                    {(parties?.items ?? []).map((party) => (
                      <SelectItem key={party.id} value={party.id}>
                        {party.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.partyId && (
              <p className="text-xs text-destructive mt-1">
                {errors.partyId.message}
              </p>
            )}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="sale-date" className="text-sm font-medium">
              Sale Date <span className="text-destructive">*</span>
            </Label>
            <Input id="sale-date" type="date" {...register("saleDate")} />
            {errors.saleDate && (
              <p className="text-xs text-destructive mt-1">
                {errors.saleDate.message}
              </p>
            )}
          </div>

          <div className="grid gap-1.5">
            <Label className="text-sm font-medium">
              Sale Type <span className="text-destructive">*</span>
            </Label>
            <div className="flex rounded-lg border overflow-hidden">
              {(["CASH", "CREDIT"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  disabled={isEdit}
                  onClick={() => handleSaleTypeChange(type)}
                  className={cn(
                    "flex-1 px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60",
                    saleType === type
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted",
                  )}
                >
                  {saleTypeCopy[type]}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {isEdit
                ? "The sale type cannot be changed after creation"
                : "Cash sales are fully received on the spot"}
            </p>
          </div>
        </div>
      </section>

      <Separator />

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Amounts</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
          <div className="grid gap-1.5">
            <Label htmlFor="sale-total" className="text-sm font-medium">
              Total Amount <span className="text-destructive">*</span>
            </Label>
            <Input
              id="sale-total"
              type="number"
              step="0.0001"
              min="0"
              placeholder="0.00"
              disabled={paymentsLocked}
              {...register("totalAmount")}
              aria-invalid={!!errors.totalAmount}
            />
            {errors.totalAmount && (
              <p className="text-xs text-destructive mt-1">
                {errors.totalAmount.message}
              </p>
            )}
          </div>

          {saleType === "CREDIT" ? (
            <div className="grid gap-1.5">
              <Label htmlFor="sale-received" className="text-sm font-medium">
                Received Amount
              </Label>
              <Input
                id="sale-received"
                type="number"
                step="0.0001"
                min="0"
                placeholder="0.00"
                disabled={paymentsLocked}
                {...register("receivedAmount")}
                aria-invalid={!!errors.receivedAmount}
              />
              {errors.receivedAmount && (
                <p className="text-xs text-destructive mt-1">
                  {errors.receivedAmount.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Must equal the payment entries below
              </p>
            </div>
          ) : (
            <div className="grid gap-1.5">
              <Label className="text-sm font-medium">Received Amount</Label>
              <div className="flex h-10 items-center rounded-md border bg-muted/30 px-3 text-sm">
                {formatAmount(received)}
              </div>
              <p className="text-xs text-muted-foreground">
                Fully received for cash sales
              </p>
            </div>
          )}

          <div className="grid gap-1.5">
            <Label className="text-sm font-medium">Balance Due</Label>
            <div
              className={cn(
                "flex h-10 items-center rounded-md border px-3 text-sm font-medium",
                balanceDue > 0 ? "text-destructive" : "text-muted-foreground",
              )}
            >
              {formatAmount(Math.max(balanceDue, 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              Total minus received
            </p>
          </div>
        </div>
      </section>

      <Separator />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Payments</h2>
            <p className="text-sm text-muted-foreground">
              Add cash, cheque or bank payments totalling the received amount
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1"
            disabled={paymentsLocked}
            onClick={addPayment}
          >
            <PlusIcon className="h-4 w-4" />
            Add Payment
          </Button>
        </div>

        {paymentsLocked && (
          <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            <LockIcon className="h-4 w-4 shrink-0" />
            Payments are locked because a cheque on this sale has already been
            deposited or bounced. Amounts can no longer be edited.
          </div>
        )}

        <div className="space-y-4">
          {fields.map((field, index) => (
            <PaymentRow
              key={field.id}
              index={index}
              register={register}
              control={control}
              setValue={setValue}
              errors={errors.payments?.[index]}
              locked={paymentsLocked}
              banks={banks ?? []}
              onRemove={() => remove(index)}
            />
          ))}
          {fields.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No payments added yet. Click &quot;Add Payment&quot; to record how
              this sale was received.
            </p>
          )}
          {(errors.payments?.message ?? errors.payments?.root?.message) && (
            <p className="text-sm text-destructive">
              {errors.payments?.message ?? errors.payments?.root?.message}
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            Payment total:{" "}
            <span className="font-medium text-foreground">
              {formatAmount(paymentsTotal)}
            </span>{" "}
            / received: {formatAmount(received)}
          </p>
        </div>
      </section>

      <Separator />

      <section className="grid gap-6 sm:grid-cols-2 max-w-3xl">
        <div className="grid gap-1.5">
          <Label htmlFor="sale-description" className="text-sm font-medium">
            Description{" "}
            <span className="text-muted-foreground">(optional)</span>
          </Label>
          <textarea
            id="sale-description"
            rows={4}
            placeholder="Add a note about this sale..."
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            {...register("description")}
          />
          {errors.description && (
            <p className="text-xs text-destructive mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="space-y-4">
          <ImageUploadField
            value={watch("image") ?? undefined}
            onChange={(value) => setValue("image", value ?? null)}
            label="Sale Image"
          />
          <DocumentUploadField
            value={watch("document") ?? undefined}
            onChange={(value) => setValue("document", value ?? null)}
            label="Sale Document"
          />
        </div>
      </section>

      <Separator />

      <div className="flex justify-end gap-2">
        {isEdit && (
          <Button
            type="button"
            variant="destructive"
            className="gap-2"
            onClick={() => setDeleteOpen(true)}
            disabled={deleteMutation.isPending}
          >
            <Trash2Icon className="h-4 w-4" />
            Delete
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/sales")}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={createMutation.isPending || updateMutation.isPending}
          className="gap-2"
        >
          {createMutation.isPending || updateMutation.isPending ? (
            <Loader2Icon className="h-4 w-4 animate-spin" />
          ) : (
            <SaveIcon className="h-4 w-4" />
          )}
          {isEdit ? "Save Changes" : "Create Sale"}
        </Button>
      </div>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangleIcon className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <DialogTitle>Delete Sale</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this sale? Any cash or bank
                  payments made on it will be reversed.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="text-sm text-muted-foreground">
            This action cannot be undone.
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
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
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </form>
  );
}

interface PaymentRowProps {
  readonly index: number;
  readonly register: UseFormRegister<SaleFormValues>;
  readonly control: Control<SaleFormValues>;
  readonly setValue: UseFormSetValue<SaleFormValues>;
  readonly errors?: FieldErrors<SalePaymentFormValues>;
  readonly locked: boolean;
  readonly banks: Array<{ id: string; name: string }>;
  readonly onRemove: () => void;
}

function PaymentRow({
  index,
  register,
  control,
  setValue,
  errors,
  locked,
  banks,
  onRemove,
}: PaymentRowProps) {
  const mode = useWatch({
    control,
    name: `payments.${index}.mode`,
  }) as SalePaymentFormValues["mode"] | undefined;
  const chequeImage = useWatch({
    control,
    name: `payments.${index}.cheque.image`,
  }) as string | null | undefined;

  const handleModeChange = useCallback(
    (next: string) => {
      setValue(`payments.${index}.mode`, next as SalePaymentFormValues["mode"], {
        shouldValidate: true,
      });
      setValue(`payments.${index}.bankId`, "", { shouldValidate: true });
    },
    [setValue, index],
  );

  return (
    <div className="space-y-4 rounded-xl border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <BanknoteIcon className="h-4 w-4 text-muted-foreground" />
          Payment {index + 1}
          {mode && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {paymentModeCopy[mode]}
            </span>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-1 text-destructive hover:text-destructive"
          disabled={locked}
          onClick={onRemove}
        >
          <Trash2Icon className="h-4 w-4" />
          Remove
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="grid gap-1.5">
          <Label className="text-sm font-medium">Payment Type</Label>
          <Controller
            control={control}
            name={`payments.${index}.mode`}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={handleModeChange}
                disabled={locked}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["CASH", "CHEQUE", "BANK"] as const).map((item) => (
                    <SelectItem key={item} value={item}>
                      {paymentModeCopy[item]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="grid gap-1.5">
          <Label className="text-sm font-medium">
            Amount <span className="text-destructive">*</span>
          </Label>
          <Input
            type="number"
            step="0.0001"
            min="0"
            placeholder="0.00"
            disabled={locked}
            {...register(`payments.${index}.amount`)}
            aria-invalid={!!errors?.amount}
          />
          {errors?.amount && (
            <p className="text-xs text-destructive mt-1">
              {errors.amount.message}
            </p>
          )}
        </div>

        <div className="grid gap-1.5">
          <Label className="text-sm font-medium">Note</Label>
          <Input
            placeholder="Optional"
            disabled={locked}
            {...register(`payments.${index}.description`)}
          />
        </div>
      </div>

      {mode === "BANK" && (
        <div className="grid gap-1.5 sm:max-w-xs">
          <Label className="text-sm font-medium">
            Bank Account <span className="text-destructive">*</span>
          </Label>
          <Controller
            control={control}
            name={`payments.${index}.bankId`}
            render={({ field }) => (
              <Select
                value={field.value || "__none__"}
                onValueChange={(value) =>
                  field.onChange(value === "__none__" ? "" : value)
                }
                disabled={locked}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a bank..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Select a bank...</SelectItem>
                  {banks.map((bank) => (
                    <SelectItem key={bank.id} value={bank.id}>
                      {bank.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors?.bankId && (
            <p className="text-xs text-destructive mt-1">
              {errors.bankId.message}
            </p>
          )}
        </div>
      )}

      {mode === "CHEQUE" && (
        <div className="space-y-4 rounded-lg bg-muted/30 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Cheque Details
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="grid gap-1.5">
              <Label className="text-sm font-medium">
                Bank Name <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="Bank on the cheque"
                disabled={locked}
                {...register(`payments.${index}.cheque.drawBankName`)}
              />
              {errors?.cheque?.drawBankName && (
                <p className="text-xs text-destructive mt-1">
                  {errors.cheque.drawBankName.message}
                </p>
              )}
            </div>
            <div className="grid gap-1.5">
              <Label className="text-sm font-medium">
                Cheque Number <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="e.g. 000123"
                disabled={locked}
                {...register(`payments.${index}.cheque.chequeNumber`)}
              />
              {errors?.cheque?.chequeNumber && (
                <p className="text-xs text-destructive mt-1">
                  {errors.cheque.chequeNumber.message}
                </p>
              )}
            </div>
            <div className="grid gap-1.5">
              <Label className="text-sm font-medium">Cheque Date</Label>
              <Input
                type="date"
                disabled={locked}
                {...register(`payments.${index}.cheque.chequeDate`)}
              />
            </div>
          </div>
          <div className="grid gap-1.5 sm:max-w-xs">
            <Label className="text-sm font-medium">Notes</Label>
            <Input
              placeholder="Optional"
              disabled={locked}
              {...register(`payments.${index}.cheque.notes`)}
            />
          </div>
          <ImageUploadField
            value={chequeImage ?? undefined}
            onChange={(value) =>
              setValue(`payments.${index}.cheque.image`, value ?? null)
            }
            label="Cheque Image"
          />
        </div>
      )}
    </div>
  );
}
