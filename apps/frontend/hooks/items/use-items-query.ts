"use client";

import { itemsService } from "@/lib/api/services/items/items.service";
import {
  createGetQueryHook,
  createMutationHook,
  createUpdateMutationHook,
  createPlainMutationHook,
} from "@/lib/api/client/hook-factory";
import { itemKeys } from "../query-keys";

// Items
export const useItems = createGetQueryHook(itemKeys.list, itemsService.items.list);

export const useCreateItemMutation = createMutationHook(
  itemKeys.list,
  itemsService.items.create,
);

export const useUpdateItemMutation = createUpdateMutationHook(
  itemKeys.list,
  itemsService.items.update,
);

export const useDeleteItemMutation = createMutationHook(
  itemKeys.list,
  itemsService.items.remove,
);

export const useGenerateItemCode = createPlainMutationHook(() =>
  itemsService.nextCode(),
);

export const useGenerateItemBarcode = createPlainMutationHook(() =>
  itemsService.nextBarcode(),
);

// Categories
export const useCategories = createGetQueryHook(
  itemKeys.categories,
  itemsService.categories.list,
);

export const useCreateCategoryMutation = createMutationHook(
  itemKeys.categories,
  itemsService.categories.create,
);

export const useUpdateCategoryMutation = createUpdateMutationHook(
  itemKeys.categories,
  itemsService.categories.update,
);

export const useDeleteCategoryMutation = createMutationHook(
  itemKeys.categories,
  itemsService.categories.remove,
);

// Units
export const useUnits = createGetQueryHook(
  itemKeys.units,
  itemsService.units.list,
);

export const useCreateUnitMutation = createMutationHook(
  itemKeys.units,
  itemsService.units.create,
);

export const useUpdateUnitMutation = createUpdateMutationHook(
  itemKeys.units,
  itemsService.units.update,
);

export const useDeleteUnitMutation = createMutationHook(
  itemKeys.units,
  itemsService.units.remove,
);
