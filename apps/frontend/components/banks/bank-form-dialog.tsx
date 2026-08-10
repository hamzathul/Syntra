"use client";

import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { HelpCircleIcon, Loader2Icon, SaveIcon } from "lucide-react";
import type { BankDto } from "shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useCreateBankMutation,
  useUpdateBankMutation,
} from "@/hooks/settings/use-bank-settings-query";
import { getApiErrorMessage } from "@/lib/api/client/core-client";
import { toast } from "sonner";
import {
  bankFormDefaultValues,
  bankFormSchema,
  bankFormValuesFromDto,
  toCreateBankPayload,
  toUpdateBankPayload,
  type BankFormValues,
} from "./bank-form-values";

interface BankFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bank: BankDto | null;
  onSaved: () => void;
}

export function BankFormDialog({
  open,
  onOpenChange,
  bank,
  onSaved,
}: BankFormDialogProps) {
  const createMutation = useCreateBankMutation();
  const updateMutation = useUpdateBankMutation();
  const isEdit = bank !== null;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BankFormValues>({
    resolver: zodResolver(bankFormSchema),
    defaultValues: bank ? bankFormValuesFromDto(bank) : bankFormDefaultValues(),
  });

  useEffect(() => {
    if (open) {
      reset(bank ? bankFormValuesFromDto(bank) : bankFormDefaultValues());
    }
  }, [open, bank, reset]);

  const printBankDetails = watch("printBankDetails");
  const printUpiQr = watch("printUpiQr");

  const onSubmit = useCallback(
    async (values: BankFormValues) => {
      try {
        if (isEdit && bank) {
          await updateMutation.mutateAsync({
            id: bank.id,
            dto: toUpdateBankPayload(values),
          });
          toast.success("Bank updated");
        } else {
          await createMutation.mutateAsync(toCreateBankPayload(values));
          toast.success("Bank added");
        }
        onSaved();
      } catch (err) {
        toast.error(getApiErrorMessage(err));
      }
    },
    [isEdit, bank, updateMutation, createMutation, onSaved],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Bank" : "Add Bank"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the bank account details."
              : "Add a bank account to print its details or UPI QR on invoices."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
          id="bank-form"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="bank-name" className="text-sm font-medium">
                Bank Name / Account Display Name{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="bank-name"
                placeholder="e.g. HDFC Bank - Current"
                {...register("name")}
                aria-invalid={!!errors.name}
              />
              {errors.name && (
                <p className="text-xs text-destructive mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 max-w-xl">
            <div className="grid gap-1.5">
              <Label htmlFor="bank-opening" className="text-sm font-medium">
                Opening Balance
              </Label>
              <Input
                id="bank-opening"
                type="number"
                step="0.0001"
                min="0"
                placeholder="0.00"
                {...register("openingBalance")}
                aria-invalid={!!errors.openingBalance}
              />
              {errors.openingBalance && (
                <p className="text-xs text-destructive mt-1">
                  {errors.openingBalance.message}
                </p>
              )}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="bank-opening-date" className="text-sm font-medium">
                As On Date
              </Label>
              <Input
                id="bank-opening-date"
                type="date"
                {...register("openingBalanceDate")}
              />
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between gap-4">
            <div className="grid gap-1">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="print-bank-details" className="text-sm font-medium">
                  Print bank details on invoices
                </Label>
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="About printing bank details on invoices"
                      >
                        <HelpCircleIcon className="h-3.5 w-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="font-medium">Print bank details on invoices</p>
                      <p className="text-muted-foreground">
                        When enabled, your account holder name, account number,
                        IFSC code, and branch name are printed on invoices so
                        customers can pay you by bank transfer. The account number
                        is required when this is turned on.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="text-xs text-muted-foreground">
                Shows account details for manually paid invoices
              </p>
            </div>
            <Switch
              id="print-bank-details"
              checked={printBankDetails}
              onCheckedChange={(checked) =>
                setValue("printBankDetails", checked, { shouldValidate: true })
              }
            />
          </div>

          {printBankDetails && (
            <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="bank-holder" className="text-sm font-medium">
                    Account Holder Name
                  </Label>
                  <Input
                    id="bank-holder"
                    placeholder="e.g. Syntra Pvt Ltd"
                    {...register("accountHolderName")}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="bank-account" className="text-sm font-medium">
                    Account Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="bank-account"
                    placeholder="e.g. 50100123456789"
                    {...register("accountNumber")}
                    aria-invalid={!!errors.accountNumber}
                  />
                  {errors.accountNumber && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.accountNumber.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="bank-ifsc" className="text-sm font-medium">
                    IFSC Code
                  </Label>
                  <Input
                    id="bank-ifsc"
                    placeholder="e.g. HDFC0001234"
                    {...register("ifscCode")}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="bank-branch" className="text-sm font-medium">
                    Branch Name
                  </Label>
                  <Input
                    id="bank-branch"
                    placeholder="e.g. Koramangala"
                    {...register("branchName")}
                  />
                </div>
              </div>
            </div>
          )}

          <Separator />

          <div className="flex items-center justify-between gap-4">
            <div className="grid gap-1">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="print-upi-qr" className="text-sm font-medium">
                  Print UPI QR code on invoices
                </Label>
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="About printing a UPI QR code on invoices"
                      >
                        <HelpCircleIcon className="h-3.5 w-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="font-medium">Print UPI QR code on invoices</p>
                      <p className="text-muted-foreground">
                        When enabled, a UPI payment QR code is printed on your
                        invoices. Add your UPI ID to point the QR directly to it;
                        if left empty, the QR is generated from the account number
                        and IFSC code when available.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="text-xs text-muted-foreground">
                Lets customers scan and pay instantly
              </p>
            </div>
            <Switch
              id="print-upi-qr"
              checked={printUpiQr}
              onCheckedChange={(checked) =>
                setValue("printUpiQr", checked, { shouldValidate: true })
              }
            />
          </div>

          {printUpiQr && (
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="grid gap-1.5 max-w-xs">
                <Label htmlFor="bank-upi" className="text-sm font-medium">
                  UPI ID <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="bank-upi"
                  placeholder="e.g. yourname@hdfc"
                  {...register("upiId")}
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty to auto-generate the QR from the account number and
                  IFSC code.
                </p>
              </div>
            </div>
          )}

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
              disabled={createMutation.isPending || updateMutation.isPending}
              className="gap-2"
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <Loader2Icon className="h-4 w-4 animate-spin" />
              ) : (
                <SaveIcon className="h-4 w-4" />
              )}
              {isEdit ? "Save Changes" : "Add Bank"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}