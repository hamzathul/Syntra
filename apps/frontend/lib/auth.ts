import Cookies from "js-cookie";
import type { CompanyDto } from "shared";

export const TOKEN_KEY = "access_token";
export const USER_KEY = "auth_user";
export const ACTIVE_COMPANY_KEY = "active_company";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
}

export type { CompanyDto };

export interface ActiveCompany {
  id: string;
  name: string;
  role: CompanyDto["role"];
}

export const getToken = (): string | null => Cookies.get(TOKEN_KEY) ?? null;

export const getUser = (): AuthUser | null => {
  const raw = Cookies.get(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
};

export const setSession = (token: string, user: AuthUser): void => {
  Cookies.set(TOKEN_KEY, token, { expires: 1, sameSite: "strict" });
  Cookies.set(USER_KEY, JSON.stringify(user), { expires: 1, sameSite: "strict" });
};

export const clearSession = (): void => {
  Cookies.remove(TOKEN_KEY);
  Cookies.remove(USER_KEY);
  Cookies.remove(ACTIVE_COMPANY_KEY);
};

export const getActiveCompany = (): ActiveCompany | null => {
  const raw = Cookies.get(ACTIVE_COMPANY_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ActiveCompany;
  } catch {
    return null;
  }
};

export const setActiveCompany = (company: ActiveCompany): void => {
  Cookies.set(ACTIVE_COMPANY_KEY, JSON.stringify(company), {
    expires: 30,
    sameSite: "strict",
  });
};

export const clearActiveCompany = (): void => {
  Cookies.remove(ACTIVE_COMPANY_KEY);
};

export const isAuthenticated = (): boolean => Boolean(getToken());
