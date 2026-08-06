"use client";

import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  PlusIcon,
  PencilIcon,
  Trash2Icon,
  Loader2Icon,
  AlertTriangleIcon,
} from "lucide-react";
import type { TaxGroupDto } from "shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
import { getApiErrorMessage } from "@/lib/api/client/core-client";
import { toast } from "sonner";

const taxGroupFormSchema = z.object({
  name: z.string().trim().min(1, "Group name is required").max(100),
  rateIds: z.array(z.string()),
});

type TaxGroupFormValues = z.infer<typeof taxGroupFormSchema>;

export function TaxGroupsTab() {
  const { data: groups, isLoading: groupsLoading, error } = useTaxGroups();
  const { data: rates, error: ratesError } = useTaxRates();
  const createMutation = useCreateTaxGroupMutation();
  const updateMutation = useUpdateTaxGroupMutation();
  const deleteMutation = useDeleteTaxGroupMutation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<TaxGroupDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TaxGroupDto | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TaxGroupFormValues>({
    resolver: zodResolver(taxGroupFormSchema),
    defaultValues: { name: "", rateIds: [] },
  });

  const groupName = watch("name");
  const rateIds = watch("rateIds");

  const openAddDialog = useCallback(() => {
    setEditingGroup(null);
    reset({ name: "", rateIds: [] });
    setDialogOpen(true);
  }, [reset]);

  const openEditDialog = useCallback(
    (group: TaxGroupDto) => {
      setEditingGroup(group);
      reset({ name: group.name, rateIds: group.rates.map((r) => r.id) });
      setDialogOpen(true);
    },
    [reset],
  );

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setEditingGroup(null);
    reset({ name: "", rateIds: [] });
  }, [reset]);

  const toggleRateId = useCallback(
    (rateId: string) => {
      setValue(
        "rateIds",
        rateIds.includes(rateId)
          ? rateIds.filter((id) => id !== rateId)
          : [...rateIds, rateId],
        { shouldDirty: true },
      );
    },
    [rateIds, setValue],
  );

  const handleSave = useCallback(
    async (values: TaxGroupFormValues) => {
      if (values.rateIds.length === 0) {
        toast.error("Select at least one tax rate");
        return;
      }

      try {
        if (editingGroup) {
          await updateMutation.mutateAsync({
            id: editingGroup.id,
            dto: { name: values.name.trim(), taxRateIds: values.rateIds },
          });
          toast.success("Tax group updated");
        } else {
          await createMutation.mutateAsync({
            name: values.name.trim(),
            taxRateIds: values.rateIds,
          });
          toast.success("Tax group created");
        }
        closeDialog();
      } catch (err: unknown) {
        toast.error(getApiErrorMessage(err));
      }
    },
    [editingGroup, createMutation, updateMutation, closeDialog],
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success("Tax group deleted");
      setDeleteTarget(null);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err));
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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
        <AlertTriangleIcon className="h-6 w-6 text-destructive" />
        <p className="text-sm text-muted-foreground">
          {getApiErrorMessage(error)}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {groups?.length ?? 0} tax group
          {(groups?.length ?? 0) !== 1 ? "s" : ""} configured
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={openAddDialog}
          className="gap-1"
        >
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
                <span className="text-sm font-semibold tabular-nums">
                  {group.totalRate}%
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => openEditDialog(group)}
                >
                  <PencilIcon className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setDeleteTarget(group)}
                >
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
            <DialogTitle>
              {editingGroup ? "Edit Tax Group" : "Add Tax Group"}
            </DialogTitle>
            <DialogDescription>
              {editingGroup
                ? "Update the group name and selected tax rates."
                : "Give your group a name and select the tax rates to include."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(handleSave)} className="space-y-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="group-name">Group Name</Label>
              <Input
                id="group-name"
                placeholder="e.g. GST Composite"
                aria-invalid={!!errors.name}
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label>Applicable Tax Rates</Label>
              {ratesError ? (
                <p className="text-sm text-destructive">
                  {getApiErrorMessage(ratesError)}
                </p>
              ) : rates && rates.length > 0 ? (
                <div className="border rounded-lg divide-y max-h-48 overflow-y-auto">
                  {rates.map((rate) => (
                    <label
                      key={rate.id}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-muted/50 cursor-pointer text-sm"
                    >
                      <Checkbox
                        checked={rateIds.includes(rate.id)}
                        onCheckedChange={() => toggleRateId(rate.id)}
                      />
                      <span className="flex-1">{rate.name}</span>
                      <span className="text-muted-foreground">
                        {rate.rate}%
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No tax rates available. Add tax rates first.
                </p>
              )}
              {rateIds.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Total:{" "}
                  {rates
                    ?.filter((r) => rateIds.includes(r.id))
                    .reduce((sum, r) => sum + r.rate, 0)}
                  %
                </p>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" type="button" onClick={closeDialog}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!groupName.trim() || rateIds.length === 0}
              >
                {editingGroup ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangleIcon className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <DialogTitle>Delete Tax Group</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete{" "}
                  <span className="font-medium text-foreground">
                    {deleteTarget?.name}
                  </span>
                  ?
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="text-sm text-muted-foreground px-13">
            This action cannot be undone. The tax rates within the group will
            not be affected.
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