"use client";

import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Trash2Icon,
  CheckIcon,
  XIcon,
  Loader2Icon,
  AlertTriangleIcon,
  FolderIcon,
} from "lucide-react";
import type { ItemCategoryDto } from "shared";
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
  useCategories,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
} from "@/hooks/items/use-items-query";
import { getApiErrorMessage } from "@/lib/api/client/core-client";
import { toast } from "sonner";

const categoryFormSchema = z.object({
  name: z.string().trim().min(1, "Category name is required").max(100),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

interface CategoryManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect?: (category: ItemCategoryDto) => void;
}

export function CategoryManagerDialog({
  open,
  onOpenChange,
  onSelect,
}: CategoryManagerDialogProps) {
  const { data: categories } = useCategories();
  const createMutation = useCreateCategoryMutation();
  const deleteMutation = useDeleteCategoryMutation();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: { name: "" },
  });

  const newName = watch("name");
  const [deleteTarget, setDeleteTarget] = useState<ItemCategoryDto | null>(null);

  const resetForm = useCallback(() => reset({ name: "" }), [reset]);

  const handleCreate = useCallback(
    async (values: CategoryFormValues) => {
      try {
        await createMutation.mutateAsync({ name: values.name.trim() });
        toast.success("Category added");
        resetForm();
      } catch (err) {
        toast.error(getApiErrorMessage(err));
      }
    },
    [createMutation, resetForm],
  );

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success("Category deleted");
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
              <FolderIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Manage Categories</DialogTitle>
              <DialogDescription>
                Create item categories for organizing your catalog.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <form
            onSubmit={handleSubmit(handleCreate)}
            className="flex items-end gap-2 p-3 rounded-lg border bg-muted/30"
          >
            <div className="grid gap-1.5 flex-1">
              <Label htmlFor="category-name" className="text-xs">
                Name
              </Label>
              <Input
                id="category-name"
                placeholder="e.g. Grains"
                {...register("name")}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSubmit(handleCreate)();
                  }
                }}
              />
              {errors.name && (
                <p className="text-xs text-destructive mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div className="flex gap-1">
              <Button
                type="submit"
                size="icon"
                variant="ghost"
                disabled={!newName.trim() || createMutation.isPending}
              >
                <CheckIcon className="h-4 w-4 text-green-600" />
              </Button>
              <Button size="icon" variant="ghost" type="button" onClick={resetForm}>
                <XIcon className="h-4 w-4" />
              </Button>
            </div>
          </form>

          <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
            {categories && categories.length > 0 ? (
              categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center gap-3 px-4 py-2.5"
                >
                  <button
                    type="button"
                    className="flex-1 text-left"
                    onClick={() => {
                      onSelect?.(category);
                      onOpenChange(false);
                    }}
                  >
                    <span className="text-sm font-medium">{category.name}</span>
                  </button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setDeleteTarget(category)}
                  >
                    <Trash2Icon className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                No categories yet. Add your first category above.
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
                  <DialogTitle>Delete Category</DialogTitle>
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
              Items assigned to this category will keep their data but lose the
              category association.
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