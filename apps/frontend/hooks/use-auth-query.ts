"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/lib/api/services/auth.service";
import { authApi, getApiErrorMessage } from "@/lib/api/client/core-client";
import { setUser, clearSession, getUser } from "@/lib/auth";
import { authKeys } from "./query-keys";

export function useAuthUser() {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: async () => {
      const res = await authApi.me();
      return res.data.data;
    },
    retry: false,
    staleTime: 30_000,
    placeholderData: () => getUser() ?? undefined,
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      setUser(data.user);
      queryClient.setQueryData(authKeys.me(), data.user);
    },
  });
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      setUser(data.user);
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await authService.logout();
      clearSession();
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

export { getApiErrorMessage };
