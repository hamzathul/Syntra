import type { AuthUserDto } from "shared";
import { coreApi } from "../client/core-client";

export interface AuthResponse {
  user: AuthUserDto;
}

export const authService = {
  login: (data: { email: string; password: string }) =>
    coreApi.post<AuthResponse>("/auth/login", data).then((r) => r.data),

  register: (data: { name: string; email: string; password: string }) =>
    coreApi.post<AuthResponse>("/auth/register", data).then((r) => r.data),

  logout: () => coreApi.post("/auth/logout").then(() => undefined),
};
