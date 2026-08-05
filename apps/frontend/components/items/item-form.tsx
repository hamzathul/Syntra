"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2Icon,
  SaveIcon,
  Trash2Icon,
  AlertTriangleIcon,
} from "lucide-react";
import type { ItemDto } from "shared";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  useCreateItemMutation,
  useUpdateItemMutation,
  useDeleteItemMutation,
} from "@/hooks/items/use-items-query";
import { getApiErrorMessage } from "@/lib/api/client/core-client";
import { toast } from "sonner";
import {
  emptyItemFormState,
  itemFormStateFromDto,
  toCreateItemPayload,
  toUpdateItemPayload,
  type ItemFormState,
} from "./item-form-state";
import { ItemGeneralTab } from "./item-general-tab";
import { ItemPricingTab } from "./item-pricing-tab";
import { ItemTaxTab } from "./item-tax-tab";
import { ItemStockTab } from "./item-stock-tab";

type Tab = "general" | "pricing" | "tax" | "stock";

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "general", label: "General" },
  { id: "pricing", label: "Sale & Purchase" },
  { id: "tax", label: "Tax" },
  { id: "stock", label: "Stock" },
];

interface ItemFormProps {
  item?: ItemDto;
}

export function ItemForm({ item }: ItemFormProps) {
  const router = useRouter();
  const isEdit = Boolean(item);

  const createMutation = useCreateItemMutation();
  const updateMutation = useUpdateItemMutation();
  const deleteMutation = useDeleteItemMutation();

  const [state, setState] = useState<ItemFormState>(
    item ? itemFormStateFromDto(item) : emptyItemFormState(),
  );
  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (item) setState(itemFormStateFromDto(item));
  }, [item]);

  const patch = useCallback(
    (partial: Partial<ItemFormState>) => {
      setState((prev) => ({ ...prev, ...partial }));
    },
    [],
  );

  const canSubmit = state.name.trim() !== "" && state.unitPrimaryId !== "";

  const handleSave = useCallback(async () => {
    if (!canSubmit) {
      toast.error("Item name and a primary unit are required");
      return;
    }
    try {
      if (isEdit && item) {
        await updateMutation.mutateAsync({
          id: item.id,
          dto: toUpdateItemPayload(state),
        });
        toast.success("Item updated");
      } else {
        await createMutation.mutateAsync(toCreateItemPayload(state));
        toast.success("Item created");
      }
      router.push("/items");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }, [canSubmit, isEdit, item, state, updateMutation, createMutation, router]);

  const handleDelete = useCallback(async () => {
    if (!item) return;
    try {
      await deleteMutation.mutateAsync(item.id);
      toast.success("Item deleted");
      router.push("/items");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
      setDeleteOpen(false);
    }
  }, [item, deleteMutation, router]);

  const tabClass = (tab: Tab) =>
    `px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
      activeTab === tab
        ? "border-primary text-primary"
        : "border-transparent text-muted-foreground hover:text-foreground"
    }`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-0 border-b">
          {TABS.map((tab) => (
            <Button
              key={tab.id}
              type="button"
              variant="ghost"
              className={tabClass(tab.id)}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      <div className="max-w-3xl">
        {activeTab === "general" && (
          <ItemGeneralTab state={state} patch={patch} />
        )}
        {activeTab === "pricing" && (
          <ItemPricingTab state={state} patch={patch} />
        )}
        {activeTab === "tax" && <ItemTaxTab state={state} patch={patch} />}
        {activeTab === "stock" && <ItemStockTab state={state} patch={patch} />}
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={handleSave}
            disabled={!canSubmit || createMutation.isPending || updateMutation.isPending}
            className="gap-2"
          >
            {createMutation.isPending || updateMutation.isPending ? (
              <Loader2Icon className="h-4 w-4 animate-spin" />
            ) : (
              <SaveIcon className="h-4 w-4" />
            )}
            {isEdit ? "Save Changes" : "Create Item"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push("/items")}>
            Cancel
          </Button>
        </div>

        {isEdit && item && (
          <Button
            type="button"
            variant="destructive"
            onClick={() => setDeleteOpen(true)}
            className="gap-2"
          >
            <Trash2Icon className="h-4 w-4" />
            Delete
          </Button>
        )}
      </div>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangleIcon className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <DialogTitle>Delete Item</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete{" "}
                  <span className="font-medium text-foreground">{item?.name}</span>
                  ?
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="text-sm text-muted-foreground">
            This action cannot be undone.
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="gap-2"
            >
              {deleteMutation.isPending ? (
                <Loader2Icon className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2Icon className="h-4 w-4" />
              )}
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
