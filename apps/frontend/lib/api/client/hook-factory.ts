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

export function createGetDetailQueryHook<TParams, TResult>(
  keyFactory: (params: TParams) => readonly unknown[],
  queryFn: (params: TParams) => Promise<TResult>,
  staleTime = 60_000,
) {
  return (params: TParams): UseQueryResult<TResult> =>
    useQuery({
      queryKey: keyFactory(params),
      queryFn: () => queryFn(params),
      staleTime,
    });
}

export function createMutationHook<TVariables, TResult>(
  keyFactory: () => readonly unknown[],
  mutationFn: (variables: TVariables) => Promise<TResult>,
  additionalKeyFactories: Array<() => readonly unknown[]> = [],
) {
  return (): UseMutationResult<TResult, Error, TVariables> => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn,
      onSuccess: () => {
        const factories = [keyFactory, ...additionalKeyFactories];
        for (const factory of factories) {
          queryClient.invalidateQueries({ queryKey: factory() });
        }
      },
    });
  };
}

export function createUpdateMutationHook<TDto, TResult>(
  keyFactory: () => readonly unknown[],
  mutationFn: (id: string, dto: TDto) => Promise<TResult>,
  additionalKeyFactories: Array<() => readonly unknown[]> = [],
  detailKeyFactory?: (id: string) => readonly unknown[],
) {
  return (): UseMutationResult<TResult, Error, { id: string; dto: TDto }> => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (vars: { id: string; dto: TDto }) =>
        mutationFn(vars.id, vars.dto),
      onSuccess: (_result, vars) => {
        const factories = [keyFactory, ...additionalKeyFactories];
        for (const factory of factories) {
          queryClient.invalidateQueries({ queryKey: factory() });
        }
        if (detailKeyFactory) {
          queryClient.invalidateQueries({
            queryKey: detailKeyFactory(vars.id),
          });
        }
      },
    });
  };
}

export function createPlainMutationHook<TResult>(
  mutationFn: () => Promise<TResult>,
) {
  return (): UseMutationResult<TResult, Error, void> =>
    useMutation({ mutationFn });
}
