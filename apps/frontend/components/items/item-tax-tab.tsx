"use client";

import { useState } from "react";
import { Loader2Icon } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  useTaxRates,
  useTaxGroups,
} from "@/hooks/settings/use-tax-settings-query";
import type { ItemFormState } from "./item-form-state";

interface ItemTaxTabProps {
  state: ItemFormState;
  patch: (partial: Partial<ItemFormState>) => void;
}

export function ItemTaxTab({ state, patch }: ItemTaxTabProps) {
  const { data: rates, isLoading: ratesLoading } = useTaxRates();
  const { data: groups, isLoading: groupsLoading } = useTaxGroups();

  const [mode, setMode] = useState<"none" | "rate" | "group">(() => {
    if (state.taxGroupId) return "group";
    if (state.taxRateId) return "rate";
    return "none";
  });

  const selectedGroup = groups?.find((g) => g.id === state.taxGroupId);

  const handleModeChange = (next: "none" | "rate" | "group") => {
    setMode(next);
    if (next === "none") patch({ taxRateId: "", taxGroupId: "" });
    if (next === "rate") patch({ taxGroupId: "" });
    if (next === "group") patch({ taxRateId: "" });
  };

  if (ratesLoading || groupsLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2Icon className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold">Tax Configuration</h3>
          <p className="text-xs text-muted-foreground">
            Apply a single tax rate or a tax group to this item
          </p>
        </div>

        <div className="grid gap-1.5 max-w-xs">
          <Label htmlFor="tax-mode" className="text-sm font-medium">
            Tax Mode
          </Label>
          <Select value={mode} onValueChange={handleModeChange}>
            <SelectTrigger id="tax-mode">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No tax</SelectItem>
              <SelectItem value="rate">Single tax rate</SelectItem>
              <SelectItem value="group">Tax group</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {mode === "rate" && (
          <div className="grid gap-1.5 max-w-md">
            <Label htmlFor="tax-rate" className="text-sm font-medium">
              Tax Rate
            </Label>
            <Select
              value={state.taxRateId || "__none__"}
              onValueChange={(v) =>
                patch({ taxRateId: v === "__none__" ? "" : v })
              }
            >
              <SelectTrigger id="tax-rate">
                <SelectValue placeholder="Select a tax rate..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Select a tax rate...</SelectItem>
                {(rates ?? []).map((rate) => (
                  <SelectItem key={rate.id} value={rate.id}>
                    {rate.name} ({rate.rate}%)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {mode === "group" && (
          <>
            <div className="grid gap-1.5 max-w-md">
              <Label htmlFor="tax-group" className="text-sm font-medium">
                Tax Group
              </Label>
              <Select
                value={state.taxGroupId || "__none__"}
                onValueChange={(v) =>
                  patch({ taxGroupId: v === "__none__" ? "" : v })
                }
              >
                <SelectTrigger id="tax-group">
                  <SelectValue placeholder="Select a tax group..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Select a tax group...</SelectItem>
                  {(groups ?? []).map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name} ({group.totalRate}%)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedGroup && (
              <div className="max-w-md">
                <Separator className="mb-3" />
                <p className="text-xs text-muted-foreground mb-2">
                  This group combines the following rates:
                </p>
                <div className="rounded-lg border divide-y">
                  {selectedGroup.rates.map((rate) => (
                    <div
                      key={rate.id}
                      className="flex items-center justify-between px-4 py-2"
                    >
                      <span className="text-sm">{rate.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {rate.rate}%
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between px-4 py-2 bg-muted/40">
                    <span className="text-sm font-medium">Total</span>
                    <span className="text-sm font-medium">
                      {selectedGroup.totalRate}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {mode === "none" && (
          <p className="text-xs text-muted-foreground max-w-md">
            No tax will be applied to this item. Configure tax rates and groups
            under Settings → Taxes.
          </p>
        )}
      </div>
    </div>
  );
}
