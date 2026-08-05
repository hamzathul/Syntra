import { createProxyHandler } from "@/lib/proxy-handler";

const CORE_URL = process.env.CORE_API_URL ?? "http://localhost:3001/api/v1";

const isAuthPath = (path: string) =>
  path === "auth/login" || path === "auth/register";

const isLogoutPath = (path: string) => path === "auth/logout";

const handler = createProxyHandler({
  baseUrl: CORE_URL,
  setSessionCookies: isAuthPath,
  clearSessionCookies: isLogoutPath,
  injectRefreshTokenBody: isLogoutPath,
});

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
