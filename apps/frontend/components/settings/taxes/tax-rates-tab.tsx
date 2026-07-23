"use client";

import { useState, useCallback } from "react";
import { PlusIcon, PencilIcon, Trash2Icon, XIcon, CheckIcon, Loader2Icon, AlertTriangleIcon } from "lucide-react";
import type { TaxRateDto } from "shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  useTaxRates,
  useCreateTaxRateMutation,
  useUpdateTaxRateMutation,
  useDeleteTaxRateMutation,
} from "@/hooks/settings/use-tax-settings-query";
import type { AxiosError } from "axios";
import { toast } from "sonner";

export function TaxRatesTab() {
  const { data: rates, isLoading } = useTaxRates();
  const createMutation = useCreateTaxRateMutation();
  const updateMutation = useUpdateTaxRateMutation();
  const deleteMutation = useDeleteTaxRateMutation();

  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRate, setNewRate] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editRate, setEditRate] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<TaxRateDto | null>(null);

  const resetAddForm = useCallback(() => {
    setIsAdding(false);
    setNewName("");
    setNewRate("");
  }, []);

  const handleAdd = useCallback(async () => {
    if (!newName.trim() || !newRate) return;
    try {
      await createMutation.mutateAsync({ name: newName.trim(), rate: parseFloat(newRate) });
      toast.success("Tax rate added");
      resetAddForm();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to add tax rate";
      toast.error(msg);
    }
  }, [newName, newRate, createMutation, resetAddForm]);

  const startEdit = useCallback((rate: TaxRateDto) => {
    setEditingId(rate.id);
    setEditName(rate.name);
    setEditRate(String(rate.rate));
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditName("");
    setEditRate("");
  }, []);

  const handleUpdate = useCallback(async (id: string) => {
    if (!editName.trim() || !editRate) return;
    try {
      await updateMutation.mutateAsync({
        id,
        dto: { name: editName.trim(), rate: parseFloat(editRate) },
      });
      toast.success("Tax rate updated");
      cancelEdit();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update tax rate";
      toast.error(msg);
    }
  }, [editName, editRate, updateMutation, cancelEdit]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success("Tax rate deleted");
      setDeleteTarget(null);
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message?: string }>;
      const msg = axiosError?.response?.data?.message ?? "Cannot delete tax rate used in a group";
      toast.error(msg);
      setDeleteTarget(null);
    }
  }, [deleteTarget, deleteMutation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2Icon className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {rates?.length ?? 0} tax rate{(rates?.length ?? 0) !== 1 ? "s" : ""} configured
        </p>
        {!isAdding && (
          <Button variant="outline" size="sm" onClick={() => setIsAdding(true)} className="gap-1">
            <PlusIcon className="h-4 w-4" />
            Add Tax Rate
          </Button>
        )}
      </div>

      {isAdding && (
        <div className="flex items-end gap-3 p-3 border rounded-lg bg-muted/30">
          <div className="grid gap-1.5 flex-1">
            <Label htmlFor="new-name" className="text-xs">Name</Label>
            <Input
              id="new-name"
              placeholder="e.g. CGST"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5 w-24">
            <Label htmlFor="new-rate" className="text-xs">Rate (%)</Label>
            <Input
              id="new-rate"
              type="number"
              step="0.01"
              min="0"
              placeholder="18"
              value={newRate}
              onChange={(e) => setNewRate(e.target.value)}
            />
          </div>
          <div className="flex gap-1">
            <Button size="icon" variant="ghost" onClick={handleAdd} disabled={!newName.trim() || !newRate}>
              <CheckIcon className="h-4 w-4 text-green-600" />
            </Button>
            <Button size="icon" variant="ghost" onClick={resetAddForm}>
              <XIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="border rounded-lg divide-y">
        {rates && rates.length > 0 ? (
          rates.map((rate) => (
            <div key={rate.id} className="flex items-center gap-3 px-4 py-3">
              {editingId === rate.id ? (
                <>
                  <div className="grid gap-1.5 flex-1">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <div className="grid gap-1.5 w-24">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editRate}
                      onChange={(e) => setEditRate(e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => handleUpdate(rate.id)}>
                      <CheckIcon className="h-4 w-4 text-green-600" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={cancelEdit}>
                      <XIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm font-medium">{rate.name}</span>
                  <span className="w-24 text-sm text-muted-foreground">{rate.rate}%</span>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => startEdit(rate)}>
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => setDeleteTarget(rate)}>
                      <Trash2Icon className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))
        ) : (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            No tax rates defined yet. Add your first tax rate above.
          </div>
        )}
      </div>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangleIcon className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <DialogTitle>Delete Tax Rate</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete <span className="font-medium text-foreground">{deleteTarget?.name}</span>?
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="text-sm text-muted-foreground px-13">
            This action cannot be undone. If this tax rate is used in any tax group, the deletion will be blocked.
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
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
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
