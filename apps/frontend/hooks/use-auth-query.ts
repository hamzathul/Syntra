"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi, getApiErrorMessage } from "@/lib/api/client/core-client";
import { setUser, clearSession } from "@/lib/auth";
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
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { email: string; password: string }) => authApi.login(data),
    onSuccess: (res) => {
      const user = res.data.data.user;
      setUser(user);
      queryClient.setQueryData(authKeys.me(), user);
    },
  });
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: (data: { name: string; email: string; password: string }) =>
      authApi.register(data),
    onSuccess: (res) => {
      setUser(res.data.data.user);
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clearSession,
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

export { getApiErrorMessage };
