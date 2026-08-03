"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ItemFormState } from "./item-form-state";

interface ItemStockTabProps {
  state: ItemFormState;
  patch: (partial: Partial<ItemFormState>) => void;
}

export function ItemStockTab({ state, patch }: ItemStockTabProps) {
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
            value={state.openingStock}
            onChange={(e) => patch({ openingStock: e.target.value })}
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="opening-stock-date" className="text-sm font-medium">
            Opening Stock Date
          </Label>
          <Input
            id="opening-stock-date"
            type="date"
            value={state.openingStockDate}
            onChange={(e) => patch({ openingStockDate: e.target.value })}
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
            value={state.openingStockValuePerUnit}
            onChange={(e) => patch({ openingStockValuePerUnit: e.target.value })}
          />
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
            value={state.minStockQuantity}
            onChange={(e) => patch({ minStockQuantity: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
