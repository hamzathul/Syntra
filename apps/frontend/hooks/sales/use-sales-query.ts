"use client";

import { salesService } from "@/lib/api/services/sales/sales.service";
import {
  createGetDetailQueryHook,
  createGetQueryHook,
  createMutationHook,
  createUpdateMutationHook,
} from "@/lib/api/client/hook-factory";
import { bankKeys, moneyKeys, saleKeys } from "../query-keys";

export const useSales = createGetQueryHook(
  saleKeys.list,
  salesService.sales.list,
);

export const useSale = createGetDetailQueryHook(
  (id: string) => saleKeys.detail(id),
  (id: string) => salesService.sales.get(id),
);

export const useCreateSaleMutation = createMutationHook(
  saleKeys.list,
  salesService.sales.create,
);

export const useUpdateSaleMutation = createUpdateMutationHook(
  saleKeys.list,
  salesService.sales.update,
);

export const useDeleteSaleMutation = createMutationHook(
  saleKeys.list,
  (id: string) => salesService.sales.remove(id),
  [bankKeys.list, moneyKeys.cash],
);
