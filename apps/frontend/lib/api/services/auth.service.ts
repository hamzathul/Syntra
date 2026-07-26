import type { AuthUserDto } from "shared";

export interface AuthResponse {
  user: AuthUserDto;
}

const BASE = "/api/auth";

async function request<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw json;
  return json.data as T;
}

export const authService = {
  login: (data: { email: string; password: string }) =>
    request<AuthResponse>(`${BASE}/login`, data),

  register: (data: { name: string; email: string; password: string }) =>
    request<AuthResponse>(`${BASE}/register`, data),

  logout: () =>
    fetch(`${BASE}/logout`, { method: "POST" }).then((r) => r.json()),
};
