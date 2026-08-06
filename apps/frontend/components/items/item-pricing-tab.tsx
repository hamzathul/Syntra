"use client";

import { Controller, useWatch } from "react-hook-form";
import type { Control, FieldErrors, UseFormRegister } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { ItemFormValues } from "./item-form-values";

interface ItemPricingTabProps {
  register: UseFormRegister<ItemFormValues>;
  control: Control<ItemFormValues>;
  errors: FieldErrors<ItemFormValues>;
}

function PriceInput({
  id,
  label,
  error,
  placeholder,
  register,
  name,
}: {
  id: string;
  label: string;
  error?: string;
  placeholder?: string;
  register: UseFormRegister<ItemFormValues>;
  name: keyof ItemFormValues;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      <Input
        id={id}
        type="number"
        step="0.0001"
        min="0"
        placeholder={placeholder ?? "0.00"}
        {...register(name)}
      />
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}

export function ItemPricingTab({ register, control, errors }: ItemPricingTabProps) {
  const saleDiscountType = useWatch({ control, name: "saleDiscountType" });
  const saleDiscountValue = useWatch({ control, name: "saleDiscountValue" });

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold">Sale Price</h3>
            <p className="text-xs text-muted-foreground">
              Configure the selling price and any discount applied at sale
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
          <PriceInput
            id="sale-excl"
            label="Sale Price (excl. tax)"
            error={errors.salePriceExclTax?.message}
            register={register}
            name="salePriceExclTax"
          />
          <PriceInput
            id="sale-incl"
            label="Sale Price (incl. tax)"
            error={errors.salePriceInclTax?.message}
            register={register}
            name="salePriceInclTax"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
          <div className="grid gap-1.5">
            <Label htmlFor="discount-type" className="text-sm font-medium">
              Discount Type
            </Label>
            <Controller
              control={control}
              name="saleDiscountType"
              render={({ field }) => (
                <Select
                  value={field.value || "__none__"}
                  onValueChange={(v) =>
                    field.onChange(v === "__none__" ? "" : v)
                  }
                >
                  <SelectTrigger id="discount-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                    <SelectItem value="AMOUNT">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.saleDiscountType && (
              <p className="text-xs text-destructive mt-1">
                {errors.saleDiscountType.message}
              </p>
            )}
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="discount-value" className="text-sm font-medium">
              Discount Value
            </Label>
            <Input
              id="discount-value"
              type="number"
              step="0.0001"
              min="0"
              placeholder={saleDiscountType === "PERCENTAGE" ? "10" : "0.00"}
              {...register("saleDiscountValue")}
            />
            {errors.saleDiscountValue && (
              <p className="text-xs text-destructive mt-1">
                {errors.saleDiscountValue.message}
              </p>
            )}
          </div>
        </div>

        {saleDiscountType !== "" && saleDiscountValue.trim() === "" && (
          <p className="text-xs text-destructive">
            Both discount type and value are required together.
          </p>
        )}
        {saleDiscountType === "" && saleDiscountValue.trim() !== "" && (
          <p className="text-xs text-destructive">
            Select a discount type to use the entered discount value.
          </p>
        )}
      </section>

      <Separator />

      <section className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold">Purchase Price</h3>
          <p className="text-xs text-muted-foreground">
            Configure the buying cost for this item
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
          <PriceInput
            id="purchase-excl"
            label="Purchase Price (excl. tax)"
            error={errors.purchasePriceExclTax?.message}
            register={register}
            name="purchasePriceExclTax"
          />
          <PriceInput
            id="purchase-incl"
            label="Purchase Price (incl. tax)"
            error={errors.purchasePriceInclTax?.message}
            register={register}
            name="purchasePriceInclTax"
          />
        </div>
      </section>
    </div>
  );
}