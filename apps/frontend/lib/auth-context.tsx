"use client";

import { createContext, useContext, useCallback, type ReactNode } from "react";
import type { AuthUserDto, LoginRequestDto, RegisterRequestDto } from "shared";
import {
  useAuthUser,
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
} from "@/hooks/use-auth-query";

interface AuthContextValue {
  user: AuthUserDto | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoggingIn: boolean;
  isRegistering: boolean;
  login: (dto: LoginRequestDto) => Promise<void>;
  register: (dto: RegisterRequestDto) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user, isLoading } = useAuthUser();
  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();
  const logoutMutation = useLogoutMutation();

  const login = useCallback(
    async (dto: LoginRequestDto): Promise<void> => {
      await loginMutation.mutateAsync(dto);
    },
    [loginMutation],
  );

  const register = useCallback(
    async (dto: RegisterRequestDto): Promise<void> => {
      await registerMutation.mutateAsync(dto);
    },
    [registerMutation],
  );

  const logout = useCallback(
    async (): Promise<void> => {
      await logoutMutation.mutateAsync();
    },
    [logoutMutation],
  );

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isAuthenticated: !!user,
        isLoading,
        isLoggingIn: loginMutation.isPending,
        isRegistering: registerMutation.isPending,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
