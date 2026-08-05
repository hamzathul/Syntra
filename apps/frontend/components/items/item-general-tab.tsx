"use client";

import { useState } from "react";
import { Wand2Icon, Settings2Icon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useUnits, useGenerateItemCode, useGenerateItemBarcode } from "@/hooks/items/use-items-query";
import { getApiErrorMessage } from "@/lib/api/client/core-client";
import { toast } from "sonner";
import type { ItemFormState } from "./item-form-state";
import { CategoryCombobox } from "./category-combobox";
import { ItemImageUpload } from "./item-image-upload";
import { UnitManagerDialog } from "./unit-manager-dialog";
import { CategoryManagerDialog } from "./category-manager-dialog";

interface ItemGeneralTabProps {
  state: ItemFormState;
  patch: (partial: Partial<ItemFormState>) => void;
}

export function ItemGeneralTab({ state, patch }: ItemGeneralTabProps) {
  const { data: units } = useUnits();
  const codeMutation = useGenerateItemCode();
  const barcodeMutation = useGenerateItemBarcode();
  const [unitManagerOpen, setUnitManagerOpen] = useState(false);
  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false);

  const handleAssignCode = async () => {
    try {
      const { code } = await codeMutation.mutateAsync();
      patch({ itemCode: code });
      toast.success("Item code generated");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const handleAssignBarcode = async () => {
    try {
      const { barcode } = await barcodeMutation.mutateAsync();
      patch({ barcode });
      toast.success("Barcode generated");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const unitItems = (units ?? []).map((unit) => (
    <SelectItem key={unit.id} value={unit.id}>
      {unit.name}
      {unit.shortName ? ` (${unit.shortName})` : ""}
    </SelectItem>
  ));

  return (
    <div className="space-y-6">
      <div className="grid gap-1.5">
        <Label htmlFor="item-name" className="text-sm font-medium">
          Item Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="item-name"
          placeholder="e.g. Organic Basmati Rice"
          value={state.name}
          onChange={(e) => patch({ name: e.target.value })}
        />
      </div>

      <div className="grid gap-1.5 max-w-xs">
        <Label htmlFor="item-type" className="text-sm font-medium">
          Item Type
        </Label>
        <Select
          value={state.itemType}
          onValueChange={(v) =>
            patch({ itemType: v as ItemFormState["itemType"] })
          }
        >
          <SelectTrigger id="item-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="GOODS">Goods</SelectItem>
            <SelectItem value="SERVICE">Service</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-1.5">
          <Label htmlFor="item-code" className="text-sm font-medium">
            Item Code
          </Label>
          <div className="flex gap-2">
            <Input
              id="item-code"
              placeholder="e.g. ITM-ABC123"
              value={state.itemCode}
              onChange={(e) => patch({ itemCode: e.target.value })}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleAssignCode}
              disabled={codeMutation.isPending}
              title="Auto-generate code"
            >
              <Wand2Icon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="item-barcode" className="text-sm font-medium">
            Barcode
          </Label>
          <div className="flex gap-2">
            <Input
              id="item-barcode"
              placeholder="e.g. 8901234567895"
              value={state.barcode}
              onChange={(e) => patch({ barcode: e.target.value })}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleAssignBarcode}
              disabled={barcodeMutation.isPending}
              title="Auto-generate barcode"
            >
              <Wand2Icon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-1.5 max-w-md">
        <div className="flex items-center justify-between">
          <Label htmlFor="item-category" className="text-sm font-medium">
            Category
          </Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 gap-1 text-xs"
            onClick={() => setCategoryManagerOpen(true)}
          >
            <Settings2Icon className="h-3.5 w-3.5" />
            Manage categories
          </Button>
        </div>
        <CategoryCombobox
          value={state.categoryId}
          onChange={(categoryId) => patch({ categoryId })}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-1.5">
          <Label htmlFor="item-hsn" className="text-sm font-medium">
            HSN/SAC Code
          </Label>
          <Input
            id="item-hsn"
            placeholder="e.g. 1006"
            value={state.hsnSac}
            onChange={(e) => patch({ hsnSac: e.target.value })}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="item-location" className="text-sm font-medium">
            Location / Rack
          </Label>
          <Input
            id="item-location"
            placeholder="e.g. Warehouse A - Rack 3"
            value={state.location}
            onChange={(e) => patch({ location: e.target.value })}
          />
        </div>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="item-description" className="text-sm font-medium">
          Description
        </Label>
        <Textarea
          id="item-description"
          placeholder="Additional details about this item"
          rows={3}
          value={state.description}
          onChange={(e) => patch({ description: e.target.value })}
        />
      </div>

      <div className="grid gap-1.5">
        <Label className="text-sm font-medium">Item Image</Label>
        <ItemImageUpload
          value={state.image}
          onChange={(image) => patch({ image })}
        />
      </div>

      <div className="grid gap-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">
            Units of Measure <span className="text-destructive">*</span>
          </Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 gap-1 text-xs"
            onClick={() => setUnitManagerOpen(true)}
          >
            <Settings2Icon className="h-3.5 w-3.5" />
            Manage units
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="unit-primary" className="text-xs">
              Primary Unit
            </Label>
            <Select
              value={state.unitPrimaryId || "__none__"}
              onValueChange={(v) =>
                patch({ unitPrimaryId: v === "__none__" ? "" : v })
              }
            >
              <SelectTrigger id="unit-primary">
                <SelectValue placeholder="Select primary unit..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Select primary unit...</SelectItem>
                {unitItems}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="unit-secondary" className="text-xs">
              Secondary Unit
            </Label>
            <Select
              value={state.unitSecondaryId || "__none__"}
              onValueChange={(v) => {
                if (v === "__none__") {
                  patch({ unitSecondaryId: "", unitConversionRate: "" });
                } else {
                  patch({ unitSecondaryId: v });
                }
              }}
            >
              <SelectTrigger id="unit-secondary">
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">None</SelectItem>
                {unitItems}
              </SelectContent>
            </Select>
          </div>
        </div>

        {state.unitSecondaryId && (
          <div className="grid gap-1.5 max-w-xs">
            <Label htmlFor="unit-conversion" className="text-xs">
              Conversion Rate (1 primary = ? secondary){" "}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="unit-conversion"
              type="number"
              step="0.0001"
              min="0"
              placeholder="e.g. 1000 for kg → g"
              value={state.unitConversionRate}
              onChange={(e) => patch({ unitConversionRate: e.target.value })}
            />
          </div>
        )}
      </div>

      <UnitManagerDialog
        open={unitManagerOpen}
        onOpenChange={setUnitManagerOpen}
        onSelect={(unit) => {
          if (!state.unitPrimaryId) {
            patch({ unitPrimaryId: unit.id });
          } else if (!state.unitSecondaryId || state.unitSecondaryId === unit.id) {
            patch({ unitSecondaryId: unit.id });
          }
        }}
      />

      <CategoryManagerDialog
        open={categoryManagerOpen}
        onOpenChange={setCategoryManagerOpen}
        onSelect={(category) => patch({ categoryId: category.id })}
      />
    </div>
  );
}
