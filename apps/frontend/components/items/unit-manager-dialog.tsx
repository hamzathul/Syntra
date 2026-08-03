"use client";

import { useState, useCallback } from "react";
import {
  Trash2Icon,
  CheckIcon,
  XIcon,
  Loader2Icon,
  AlertTriangleIcon,
  PackageIcon,
} from "lucide-react";
import type { UnitDto } from "shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  useUnits,
  useCreateUnitMutation,
  useDeleteUnitMutation,
} from "@/hooks/items/use-items-query";
import { getApiErrorMessage } from "@/lib/api/client/core-client";
import { toast } from "sonner";

interface UnitManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect?: (unit: UnitDto) => void;
}

export function UnitManagerDialog({
  open,
  onOpenChange,
  onSelect,
}: UnitManagerDialogProps) {
  const { data: units } = useUnits();
  const createMutation = useCreateUnitMutation();
  const deleteMutation = useDeleteUnitMutation();

  const [newName, setNewName] = useState("");
  const [newShortName, setNewShortName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<UnitDto | null>(null);

  const resetForm = useCallback(() => {
    setNewName("");
    setNewShortName("");
  }, []);

  const handleCreate = useCallback(async () => {
    if (!newName.trim()) return;
    try {
      await createMutation.mutateAsync({
        name: newName.trim(),
        shortName: newShortName.trim() || undefined,
      });
      toast.success("Unit added");
      resetForm();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }, [newName, newShortName, createMutation, resetForm]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success("Unit deleted");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
      setDeleteTarget(null);
    }
  }, [deleteTarget, deleteMutation]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <PackageIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Manage Units</DialogTitle>
              <DialogDescription>
                Create units of measure. Units in use by items cannot be
                deleted.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-end gap-2 p-3 rounded-lg border bg-muted/30">
            <div className="grid gap-1.5 flex-1">
              <Label htmlFor="unit-name" className="text-xs">
                Name
              </Label>
              <Input
                id="unit-name"
                placeholder="e.g. Kilogram"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
            </div>
            <div className="grid gap-1.5 w-28">
              <Label htmlFor="unit-short" className="text-xs">
                Short
              </Label>
              <Input
                id="unit-short"
                placeholder="kg"
                maxLength={10}
                value={newShortName}
                onChange={(e) => setNewShortName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
            </div>
            <div className="flex gap-1">
              <Button
                size="icon"
                variant="ghost"
                onClick={handleCreate}
                disabled={!newName.trim() || createMutation.isPending}
              >
                <CheckIcon className="h-4 w-4 text-green-600" />
              </Button>
              <Button size="icon" variant="ghost" onClick={resetForm}>
                <XIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
            {units && units.length > 0 ? (
              units.map((unit) => (
                <div
                  key={unit.id}
                  className="flex items-center gap-3 px-4 py-2.5"
                >
                  <button
                    type="button"
                    className="flex-1 text-left"
                    onClick={() => {
                      onSelect?.(unit);
                      onOpenChange(false);
                    }}
                  >
                    <span className="text-sm font-medium">{unit.name}</span>
                    {unit.shortName && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({unit.shortName})
                      </span>
                    )}
                  </button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setDeleteTarget(unit)}
                  >
                    <Trash2Icon className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                No units yet. Add your first unit above.
              </div>
            )}
          </div>
        </div>

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
                  <DialogTitle>Delete Unit</DialogTitle>
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
            <div className="text-sm text-muted-foreground">
              This action cannot be undone. Units used by an item cannot be
              deleted.
            </div>
            <div className="flex justify-end gap-2">
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
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}
