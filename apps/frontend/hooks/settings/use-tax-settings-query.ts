"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { taxesService } from "@/lib/api/services/settings/taxes.service";
import type { CreateTaxRateDto, UpdateTaxRateDto, CreateTaxGroupDto, UpdateTaxGroupDto } from "shared";
import { taxKeys } from "../query-keys";

export function useTaxRates() {
  return useQuery({
    queryKey: taxKeys.rates(),
    queryFn: taxesService.rates.list,
    staleTime: 60_000,
  });
}

export function useCreateTaxRateMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateTaxRateDto) => taxesService.rates.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taxKeys.rates() });
    },
  });
}

export function useUpdateTaxRateMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateTaxRateDto }) => taxesService.rates.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taxKeys.rates() });
    },
  });
}

export function useDeleteTaxRateMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => taxesService.rates.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taxKeys.rates() });
    },
  });
}

export function useTaxGroups() {
  return useQuery({
    queryKey: taxKeys.groups(),
    queryFn: taxesService.groups.list,
    staleTime: 60_000,
  });
}

export function useCreateTaxGroupMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateTaxGroupDto) => taxesService.groups.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taxKeys.groups() });
    },
  });
}

export function useUpdateTaxGroupMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateTaxGroupDto }) => taxesService.groups.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taxKeys.groups() });
    },
  });
}

export function useDeleteTaxGroupMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => taxesService.groups.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taxKeys.groups() });
    },
  });
}
