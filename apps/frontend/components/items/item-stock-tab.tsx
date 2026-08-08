"use client";

import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ItemFormValues } from "./item-form-values";

interface ItemStockTabProps {
  register: UseFormRegister<ItemFormValues>;
  errors: FieldErrors<ItemFormValues>;
}

export function ItemStockTab({ register, errors }: ItemStockTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold">Opening Stock</h3>
        <p className="text-xs text-muted-foreground">
          Record the initial stock quantity for this item
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
        <div className="grid gap-1.5">
          <Label htmlFor="opening-stock" className="text-sm font-medium">
            Opening Stock Quantity
          </Label>
          <Input
            id="opening-stock"
            type="number"
            step="0.0001"
            min="0"
            placeholder="0"
            {...register("openingStock")}
          />
          {errors.openingStock && (
            <p className="text-xs text-destructive mt-1">
              {errors.openingStock.message}
            </p>
          )}
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="opening-stock-date" className="text-sm font-medium">
            Opening Stock Date
          </Label>
          <Input
            id="opening-stock-date"
            type="date"
            {...register("openingStockDate")}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
        <div className="grid gap-1.5">
          <Label
            htmlFor="opening-value"
            className="text-sm font-medium"
          >
            Opening Stock Value (per unit)
          </Label>
          <Input
            id="opening-value"
            type="number"
            step="0.0001"
            min="0"
            placeholder="0.00"
            {...register("openingStockValuePerUnit")}
          />
          {errors.openingStockValuePerUnit && (
            <p className="text-xs text-destructive mt-1">
              {errors.openingStockValuePerUnit.message}
            </p>
          )}
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="min-stock" className="text-sm font-medium">
            Minimum Stock Quantity
          </Label>
          <Input
            id="min-stock"
            type="number"
            step="0.0001"
            min="0"
            placeholder="0"
            {...register("minStockQuantity")}
          />
          {errors.minStockQuantity && (
            <p className="text-xs text-destructive mt-1">
              {errors.minStockQuantity.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}