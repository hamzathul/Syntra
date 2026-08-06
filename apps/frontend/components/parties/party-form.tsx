"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2Icon,
  SaveIcon,
  Trash2Icon,
  AlertTriangleIcon,
} from "lucide-react";
import type { PartyDto } from "shared";
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
  useCreatePartyMutation,
  useUpdatePartyMutation,
  useDeletePartyMutation,
} from "@/hooks/parties/use-parties-query";
import { getApiErrorMessage } from "@/lib/api/client/core-client";
import { toast } from "sonner";
import {
  partyFormDefaultValues,
  partyFormSchema,
  partyFormValuesFromDto,
  toCreatePartyPayload,
  toUpdatePartyPayload,
  type PartyFormValues,
} from "./party-form-values";
import { PartyGeneralTab } from "./party-general-tab";
import { PartyAddressTab } from "./party-address-tab";

type Tab = "general" | "address";

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "general", label: "General" },
  { id: "address", label: "Address" },
];

interface PartyFormProps {
  party?: PartyDto;
}

export function PartyForm({ party }: PartyFormProps) {
  const router = useRouter();
  const isEdit = Boolean(party);

  const createMutation = useCreatePartyMutation();
  const updateMutation = useUpdatePartyMutation();
  const deleteMutation = useDeletePartyMutation();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<PartyFormValues>({
    resolver: zodResolver(partyFormSchema),
    defaultValues: party
      ? partyFormValuesFromDto(party)
      : partyFormDefaultValues(),
  });

  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (party) reset(partyFormValuesFromDto(party));
  }, [party, reset]);

  const onSubmit = useCallback(
    async (values: PartyFormValues) => {
      try {
        if (isEdit && party) {
          await updateMutation.mutateAsync({
            id: party.id,
            dto: toUpdatePartyPayload(values),
          });
          toast.success("Party updated");
        } else {
          await createMutation.mutateAsync(toCreatePartyPayload(values));
          toast.success("Party created");
        }
        router.push("/parties");
      } catch (err) {
        toast.error(getApiErrorMessage(err));
      }
    },
    [isEdit, party, updateMutation, createMutation, router],
  );

  const handleDelete = useCallback(async () => {
    if (!party) return;
    try {
      await deleteMutation.mutateAsync(party.id);
      toast.success("Party deleted");
      router.push("/parties");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
      setDeleteOpen(false);
    }
  }, [party, deleteMutation, router]);

  const tabClass = (tab: Tab) =>
    `px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
      activeTab === tab
        ? "border-primary text-primary"
        : "border-transparent text-muted-foreground hover:text-foreground"
    }`;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
          <PartyGeneralTab register={register} control={control} errors={errors} />
        )}
        {activeTab === "address" && (
          <PartyAddressTab register={register} errors={errors} />
        )}
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
            className="gap-2"
          >
            {createMutation.isPending || updateMutation.isPending ? (
              <Loader2Icon className="h-4 w-4 animate-spin" />
            ) : (
              <SaveIcon className="h-4 w-4" />
            )}
            {isEdit ? "Save Changes" : "Create Party"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push("/parties")}>
            Cancel
          </Button>
        </div>

        {isEdit && party && (
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
                <DialogTitle>Delete Party</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete{" "}
                  <span className="font-medium text-foreground">{party?.name}</span>
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
    </form>
  );
}