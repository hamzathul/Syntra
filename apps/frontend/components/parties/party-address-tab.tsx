"use client";

import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { PartyFormValues } from "./party-form-values";

interface PartyAddressTabProps {
  register: UseFormRegister<PartyFormValues>;
  errors: FieldErrors<PartyFormValues>;
}

export function PartyAddressTab({ register, errors }: PartyAddressTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold">Billing Address</h3>
        <p className="text-xs text-muted-foreground">
          The address to send invoices and correspondence
        </p>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="party-billing-address" className="text-sm font-medium">
          Billing Address
        </Label>
        <Textarea
          id="party-billing-address"
          placeholder="Street, area, city, state, pincode"
          rows={3}
          {...register("billingAddress")}
        />
        {errors.billingAddress && (
          <p className="text-xs text-destructive mt-1">
            {errors.billingAddress.message}
          </p>
        )}
      </div>

      <div className="grid gap-1.5 max-w-md">
        <Label htmlFor="party-email" className="text-sm font-medium">
          Email Address
        </Label>
        <Input
          id="party-email"
          type="email"
          placeholder="billing@example.com"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
        )}
      </div>
    </div>
  );
}