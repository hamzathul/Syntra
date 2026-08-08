"use client";

import { HelpCircleIcon } from "lucide-react";
import { Controller, useWatch } from "react-hook-form";
import type { Control, FieldErrors, UseFormRegister } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { PartyFormValues } from "./party-form-values";

interface PartyGeneralTabProps {
  register: UseFormRegister<PartyFormValues>;
  control: Control<PartyFormValues>;
  errors: FieldErrors<PartyFormValues>;
}

export function PartyGeneralTab({
  register,
  control,
  errors,
}: PartyGeneralTabProps) {
  const openingBalanceType = useWatch({
    control,
    name: "openingBalanceType",
  });
  const hasOpeningBalance = openingBalanceType !== "";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
        <div className="grid gap-1.5">
          <Label htmlFor="party-name" className="text-sm font-medium">
            Party Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="party-name"
            placeholder="e.g. Acme Traders"
            {...register("name")}
          />
          {errors.name && (
            <p className="text-xs text-destructive mt-1">
              {errors.name.message}
            </p>
          )}
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="party-contact" className="text-sm font-medium">
            Contact Number
          </Label>
          <Input
            id="party-contact"
            placeholder="e.g. 9876543210"
            {...register("contactNumber")}
          />
          {errors.contactNumber && (
            <p className="text-xs text-destructive mt-1">
              {errors.contactNumber.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-1.5 max-w-xl">
        <div className="flex items-center gap-1.5">
          <Label htmlFor="party-opening" className="text-sm font-medium">
            Opening Balance
          </Label>
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="About opening balance"
                >
                  <HelpCircleIcon className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="font-medium">Opening Balance</p>
                <p className="text-muted-foreground">
                  The amount you owe to this party or the amount this party owes
                  you when you started doing business with them.
                </p>
                <ul className="mt-1.5 space-y-0.5 text-muted-foreground">
                  <li>
                    <span className="font-medium text-foreground">To Pay:</span>{" "}
                    Amount you have to give to this party (you owe them).
                  </li>
                  <li>
                    <span className="font-medium text-foreground">
                      To Receive:
                    </span>{" "}
                    Amount this party has to give to you (they owe you).
                  </li>
                </ul>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="party-opening-amount" className="text-xs">
              Amount
            </Label>
            <Input
              id="party-opening-amount"
              type="number"
              step="0.0001"
              min="0"
              placeholder="0.00"
              {...register("openingBalanceAmount")}
            />
            {errors.openingBalanceAmount && (
              <p className="text-xs text-destructive mt-1">
                {errors.openingBalanceAmount.message}
              </p>
            )}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="party-opening-type" className="text-xs">
              To Pay / To Receive
            </Label>
            <Controller
              control={control}
              name="openingBalanceType"
              render={({ field }) => (
                <Select
                  value={field.value === "" ? "__none__" : field.value}
                  onValueChange={(v) =>
                    field.onChange(v === "__none__" ? "" : v)
                  }
                >
                  <SelectTrigger id="party-opening-type">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    <SelectItem value="TO_PAY">To Pay</SelectItem>
                    <SelectItem value="TO_RECEIVE">To Receive</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="party-opening-date" className="text-xs">
              As Of Date
            </Label>
            <Input
              id="party-opening-date"
              type="date"
              {...register("openingBalanceDate")}
            />
          </div>
        </div>

        {hasOpeningBalance && (
          <p className="text-xs text-muted-foreground">
            {openingBalanceType === "TO_PAY"
              ? "You owe this balance to the party."
              : "This party owes this balance to you."}
          </p>
        )}
      </div>

      <div className="grid gap-1.5 max-w-xs">
        <Label htmlFor="party-credit-limit" className="text-sm font-medium">
          Credit Limit
        </Label>
        <Input
          id="party-credit-limit"
          type="number"
          step="0.0001"
          min="0"
          placeholder="0.00"
          {...register("creditLimit")}
        />
        {errors.creditLimit && (
          <p className="text-xs text-destructive mt-1">
            {errors.creditLimit.message}
          </p>
        )}
      </div>
    </div>
  );
}