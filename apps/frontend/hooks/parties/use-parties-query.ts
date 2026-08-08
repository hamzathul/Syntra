"use client";

import { partiesService } from "@/lib/api/services/parties/parties.service";
import {
  createGetDetailQueryHook,
  createGetQueryHook,
  createMutationHook,
  createUpdateMutationHook,
} from "@/lib/api/client/hook-factory";
import { partyKeys } from "../query-keys";

export const useParties = createGetQueryHook(
  partyKeys.list,
  partiesService.parties.list,
);

export const useParty = createGetDetailQueryHook(
  (id: string) => partyKeys.detail(id),
  (id: string) => partiesService.parties.get(id),
);

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