"use client";

import { useState } from "react";
import { Wand2Icon, Settings2Icon } from "lucide-react";
import { Controller, useWatch } from "react-hook-form";
import type { Control, FieldErrors, UseFormRegister, UseFormSetValue } from "react-hook-form";
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
import type { ItemFormValues } from "./item-form-values";
import { CategoryCombobox } from "./category-combobox";
import { ItemImageUpload } from "./item-image-upload";
import { UnitManagerDialog } from "./unit-manager-dialog";
import { CategoryManagerDialog } from "./category-manager-dialog";

interface ItemGeneralTabProps {
  register: UseFormRegister<ItemFormValues>;
  control: Control<ItemFormValues>;
  setValue: UseFormSetValue<ItemFormValues>;
  errors: FieldErrors<ItemFormValues>;
}

export function ItemGeneralTab({
  register,
  control,
  setValue,
  errors,
}: ItemGeneralTabProps) {
  const { data: units } = useUnits();
  const codeMutation = useGenerateItemCode();
  const barcodeMutation = useGenerateItemBarcode();
  const unitPrimaryId = useWatch({ control, name: "unitPrimaryId" });
  const unitSecondaryId = useWatch({ control, name: "unitSecondaryId" });
  const image = useWatch({ control, name: "image" });
  const [unitManagerOpen, setUnitManagerOpen] = useState(false);
  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false);

  const handleAssignCode = async () => {
    try {
      const { code } = await codeMutation.mutateAsync();
      setValue("itemCode", code, { shouldDirty: true, shouldValidate: true });
      toast.success("Item code generated");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const handleAssignBarcode = async () => {
    try {
      const { barcode } = await barcodeMutation.mutateAsync();
      setValue("barcode", barcode, { shouldDirty: true, shouldValidate: true });
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
          {...register("name")}
        />
        {errors.name && (
          <p className="text-xs text-destructive mt-1">{errors.name.message}</p>
        )}
      </div>

      <div className="grid gap-1.5 max-w-xs">
        <Label htmlFor="item-type" className="text-sm font-medium">
          Item Type
        </Label>
        <Controller
          control={control}
          name="itemType"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="item-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GOODS">Goods</SelectItem>
                <SelectItem value="SERVICE">Service</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
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
              {...register("itemCode")}
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
              {...register("barcode")}
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
        <Controller
          control={control}
          name="categoryId"
          render={({ field }) => (
            <CategoryCombobox
              value={field.value}
              onChange={field.onChange}
            />
          )}
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
            {...register("hsnSac")}
          />
          {errors.hsnSac && (
            <p className="text-xs text-destructive mt-1">{errors.hsnSac.message}</p>
          )}
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="item-location" className="text-sm font-medium">
            Location / Rack
          </Label>
          <Input
            id="item-location"
            placeholder="e.g. Warehouse A - Rack 3"
            {...register("location")}
          />
          {errors.location && (
            <p className="text-xs text-destructive mt-1">{errors.location.message}</p>
          )}
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
          {...register("description")}
        />
      </div>

      <div className="grid gap-1.5">
        <Label className="text-sm font-medium">Item Image</Label>
        <ItemImageUpload
          value={image}
          onChange={(img) =>
            setValue("image", img, { shouldDirty: true, shouldValidate: true })
          }
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
            <Controller
              control={control}
              name="unitPrimaryId"
              render={({ field }) => (
                <Select
                  value={field.value || "__none__"}
                  onValueChange={(v) =>
                    field.onChange(v === "__none__" ? "" : v)
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
              )}
            />
            {errors.unitPrimaryId && (
              <p className="text-xs text-destructive mt-1">
                {errors.unitPrimaryId.message}
              </p>
            )}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="unit-secondary" className="text-xs">
              Secondary Unit
            </Label>
            <Controller
              control={control}
              name="unitSecondaryId"
              render={({ field }) => (
                <Select
                  value={field.value || "__none__"}
                  onValueChange={(v) => {
                    if (v === "__none__") {
                      field.onChange("");
                      setValue("unitConversionRate", "", {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    } else {
                      field.onChange(v);
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
              )}
            />
          </div>
        </div>

        {unitSecondaryId && (
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
              {...register("unitConversionRate")}
            />
            {errors.unitConversionRate && (
              <p className="text-xs text-destructive mt-1">
                {errors.unitConversionRate.message}
              </p>
            )}
          </div>
        )}
      </div>

      <UnitManagerDialog
        open={unitManagerOpen}
        onOpenChange={setUnitManagerOpen}
        onSelect={(unit) => {
          if (!unitPrimaryId) {
            setValue("unitPrimaryId", unit.id, {
              shouldDirty: true,
              shouldValidate: true,
            });
          } else if (!unitSecondaryId || unitSecondaryId === unit.id) {
            setValue("unitSecondaryId", unit.id, {
              shouldDirty: true,
              shouldValidate: true,
            });
          }
        }}
      />

      <CategoryManagerDialog
        open={categoryManagerOpen}
        onOpenChange={setCategoryManagerOpen}
        onSelect={(category) =>
          setValue("categoryId", category.id, {
            shouldDirty: true,
            shouldValidate: true,
          })
        }
      />
    </div>
  );
}