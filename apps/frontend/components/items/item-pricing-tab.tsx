"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { ItemFormState } from "./item-form-state";

interface ItemPricingTabProps {
  state: ItemFormState;
  patch: (partial: Partial<ItemFormState>) => void;
}

function PriceInput({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
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
        placeholder="0.00"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export function ItemPricingTab({ state, patch }: ItemPricingTabProps) {
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
            value={state.salePriceExclTax}
            onChange={(v) => patch({ salePriceExclTax: v })}
          />
          <PriceInput
            id="sale-incl"
            label="Sale Price (incl. tax)"
            value={state.salePriceInclTax}
            onChange={(v) => patch({ salePriceInclTax: v })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
          <div className="grid gap-1.5">
            <Label htmlFor="discount-type" className="text-sm font-medium">
              Discount Type
            </Label>
            <Select
              value={state.saleDiscountType || "__none__"}
              onValueChange={(v) =>
                patch({
                  saleDiscountType: (v === "__none__"
                    ? ""
                    : v) as ItemFormState["saleDiscountType"],
                })
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
              placeholder={state.saleDiscountType === "PERCENTAGE" ? "10" : "0.00"}
              value={state.saleDiscountValue}
              onChange={(e) => patch({ saleDiscountValue: e.target.value })}
            />
          </div>
        </div>

        {state.saleDiscountType !== "" &&
          state.saleDiscountValue.trim() === "" && (
            <p className="text-xs text-destructive">
              Both discount type and value are required together.
            </p>
          )}
        {state.saleDiscountType === "" &&
          state.saleDiscountValue.trim() !== "" && (
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
            value={state.purchasePriceExclTax}
            onChange={(v) => patch({ purchasePriceExclTax: v })}
          />
          <PriceInput
            id="purchase-incl"
            label="Purchase Price (incl. tax)"
            value={state.purchasePriceInclTax}
            onChange={(v) => patch({ purchasePriceInclTax: v })}
          />
        </div>
      </section>
    </div>
  );
}
