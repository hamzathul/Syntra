"use client";

import { useState, useCallback } from "react";
import { PlusIcon, PencilIcon, Trash2Icon, Loader2Icon, AlertTriangleIcon } from "lucide-react";
import type { TaxGroupDto } from "shared";
import type { AxiosError } from "axios";
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
  useTaxGroups,
  useCreateTaxGroupMutation,
  useUpdateTaxGroupMutation,
  useDeleteTaxGroupMutation,
} from "@/hooks/settings/use-tax-settings-query";
import { toast } from "sonner";

export function TaxGroupsTab() {
  const { data: groups, isLoading: groupsLoading } = useTaxGroups();
  const { data: rates } = useTaxRates();
  const createMutation = useCreateTaxGroupMutation();
  const updateMutation = useUpdateTaxGroupMutation();
  const deleteMutation = useDeleteTaxGroupMutation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<TaxGroupDto | null>(null);
  const [groupName, setGroupName] = useState("");
  const [selectedRateIds, setSelectedRateIds] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<TaxGroupDto | null>(null);

  const openAddDialog = useCallback(() => {
    setEditingGroup(null);
    setGroupName("");
    setSelectedRateIds(new Set());
    setDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((group: TaxGroupDto) => {
    setEditingGroup(group);
    setGroupName(group.name);
    setSelectedRateIds(new Set(group.rates.map((r) => r.id)));
    setDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setEditingGroup(null);
    setGroupName("");
    setSelectedRateIds(new Set());
  }, []);

  const toggleRateId = useCallback((rateId: string) => {
    setSelectedRateIds((prev) => {
      const next = new Set(prev);
      if (next.has(rateId)) {
        next.delete(rateId);
      } else {
        next.add(rateId);
      }
      return next;
    });
  }, []);

  const handleSave = useCallback(async () => {
    if (!groupName.trim()) return;
    const rateIds = Array.from(selectedRateIds);
    if (rateIds.length === 0) {
      toast.error("Select at least one tax rate");
      return;
    }

    try {
      if (editingGroup) {
        await updateMutation.mutateAsync({
          id: editingGroup.id,
          dto: { name: groupName.trim(), taxRateIds: rateIds },
        });
        toast.success("Tax group updated");
      } else {
        await createMutation.mutateAsync({ name: groupName.trim(), taxRateIds: rateIds });
        toast.success("Tax group created");
      }
      closeDialog();
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message?: string }>;
      const msg = axiosError?.response?.data?.message ?? "Failed to save tax group";
      toast.error(msg);
    }
  }, [groupName, selectedRateIds, editingGroup, createMutation, updateMutation, closeDialog]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success("Tax group deleted");
      setDeleteTarget(null);
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message?: string }>;
      const msg = axiosError?.response?.data?.message ?? "Failed to delete tax group";
      toast.error(msg);
      setDeleteTarget(null);
    }
  }, [deleteTarget, deleteMutation]);

  if (groupsLoading) {
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
          {groups?.length ?? 0} tax group{(groups?.length ?? 0) !== 1 ? "s" : ""} configured
        </p>
        <Button variant="outline" size="sm" onClick={openAddDialog} className="gap-1">
          <PlusIcon className="h-4 w-4" />
          Add Tax Group
        </Button>
      </div>

      <div className="border rounded-lg divide-y">
        {groups && groups.length > 0 ? (
          groups.map((group) => (
            <div key={group.id} className="flex items-center gap-3 px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{group.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {group.rates.map((r) => r.name).join(", ")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold tabular-nums">{group.totalRate}%</span>
                <Button size="icon" variant="ghost" onClick={() => openEditDialog(group)}>
                  <PencilIcon className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => setDeleteTarget(group)}>
                  <Trash2Icon className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            No tax groups defined yet. Create a group to combine tax rates.
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingGroup ? "Edit Tax Group" : "Add Tax Group"}</DialogTitle>
            <DialogDescription>
              {editingGroup
                ? "Update the group name and selected tax rates."
                : "Give your group a name and select the tax rates to include."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="group-name">Group Name</Label>
              <Input
                id="group-name"
                placeholder="e.g. GST Composite"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label>Applicable Tax Rates</Label>
              {rates && rates.length > 0 ? (
                <div className="border rounded-lg divide-y max-h-48 overflow-y-auto">
                  {rates.map((rate) => (
                    <label
                      key={rate.id}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-muted/50 cursor-pointer text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={selectedRateIds.has(rate.id)}
                        onChange={() => toggleRateId(rate.id)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <span className="flex-1">{rate.name}</span>
                      <span className="text-muted-foreground">{rate.rate}%</span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No tax rates available. Add tax rates first.
                </p>
              )}
              {selectedRateIds.size > 0 && (
                <p className="text-xs text-muted-foreground">
                  Total:{" "}
                  {rates
                    ?.filter((r) => selectedRateIds.has(r.id))
                    .reduce((sum, r) => sum + r.rate, 0)}
                  %
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button onClick={handleSave} disabled={!groupName.trim() || selectedRateIds.size === 0}>
              {editingGroup ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangleIcon className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <DialogTitle>Delete Tax Group</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete <span className="font-medium text-foreground">{deleteTarget?.name}</span>?
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="text-sm text-muted-foreground px-13">
            This action cannot be undone. The tax rates within the group will not be affected.
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
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
