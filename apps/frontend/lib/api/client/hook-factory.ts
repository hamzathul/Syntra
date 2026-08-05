import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseQueryResult, UseMutationResult } from "@tanstack/react-query";

export function createGetQueryHook<TResult>(
  keyFactory: () => readonly unknown[],
  queryFn: () => Promise<TResult>,
  staleTime = 60_000,
) {
  return (): UseQueryResult<TResult> =>
    useQuery({ queryKey: keyFactory(), queryFn, staleTime });
}

export function createMutationHook<TVariables, TResult>(
  keyFactory: () => readonly unknown[],
  mutationFn: (variables: TVariables) => Promise<TResult>,
) {
  return (): UseMutationResult<TResult, Error, TVariables> => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn,
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: keyFactory() }),
    });
  };
}

export function createUpdateMutationHook<TDto, TResult>(
  keyFactory: () => readonly unknown[],
  mutationFn: (id: string, dto: TDto) => Promise<TResult>,
) {
  return (): UseMutationResult<TResult, Error, { id: string; dto: TDto }> => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (vars: { id: string; dto: TDto }) =>
        mutationFn(vars.id, vars.dto),
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: keyFactory() }),
    });
  };
}

export function createPlainMutationHook<TResult>(
  mutationFn: () => Promise<TResult>,
) {
  return (): UseMutationResult<TResult, Error, void> =>
    useMutation({ mutationFn });
}
