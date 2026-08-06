"use client";

import { useQuery } from "@tanstack/react-query";
import { partiesService } from "@/lib/api/services/parties/parties.service";
import {
  createGetQueryHook,
  createMutationHook,
  createUpdateMutationHook,
} from "@/lib/api/client/hook-factory";
import { partyKeys } from "../query-keys";

export const useParties = createGetQueryHook(
  partyKeys.list,
  partiesService.parties.list,
);

export const useParty = (id: string) =>
  useQuery({
    queryKey: partyKeys.detail(id),
    queryFn: () => partiesService.parties.get(id),
    staleTime: 60_000,
  });

export const useCreatePartyMutation = createMutationHook(
  partyKeys.list,
  partiesService.parties.create,
);

export const useUpdatePartyMutation = createUpdateMutationHook(
  partyKeys.list,
  partiesService.parties.update,
);

export const useDeletePartyMutation = createMutationHook(
  partyKeys.list,
  partiesService.parties.remove,
);