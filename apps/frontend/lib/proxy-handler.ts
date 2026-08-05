import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
};

interface ProxyHandlerOptions {
  readonly baseUrl: string;
  readonly setSessionCookies?: (path: string) => boolean;
  readonly clearSessionCookies?: (path: string) => boolean;
  readonly injectRefreshTokenBody?: (path: string) => boolean;
}

async function handler(
  req: NextRequest,
  options: ProxyHandlerOptions,
  path: string[],
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  const url = `${options.baseUrl}/${path.join("/")}${req.nextUrl.search}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const companyId = req.headers.get("x-company-id");
  if (companyId) headers["X-Company-Id"] = companyId;

  let body =
    req.method !== "GET" && req.method !== "HEAD"
      ? await req.text()
      : undefined;

  if (options.injectRefreshTokenBody?.(path.join("/"))) {
    const refreshToken = cookieStore.get("refresh_token")?.value ?? "";
    body = JSON.stringify({ refreshToken });
  }

  let res: Response;
  try {
    res = await fetch(url, { method: req.method, headers, body });
  } catch {
    return NextResponse.json(
      { status: "error", message: "Service unavailable" },
      { status: 503 },
    );
  }

  if (res.status === 401) {
    const refreshToken = cookieStore.get("refresh_token")?.value;

    if (refreshToken) {
      const coreUrl =
        process.env.CORE_API_URL ?? "http://localhost:3001/api/v1";

      try {
        const refreshRes = await fetch(`${coreUrl}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          const newToken = refreshData?.data?.token?.accessToken as
            | string
            | undefined;

          if (newToken) {
            cookieStore.set("access_token", newToken, {
              ...COOKIE_OPTIONS,
              maxAge: refreshData.data.token.expiresIn,
            });
            cookieStore.set("refresh_token", refreshData.data.refreshToken, {
              ...COOKIE_OPTIONS,
              maxAge: refreshData.data.refreshExpiresIn,
            });

            headers["Authorization"] = `Bearer ${newToken}`;
            res = await fetch(url, { method: req.method, headers, body });
          }
        }
      } catch {
        return NextResponse.json(
          { status: "error", message: "Auth service unavailable" },
          { status: 503 },
        );
      }
    }
  }

  const data = await res.json();

  if (
    res.ok &&
    options.setSessionCookies?.(path.join("/")) &&
    data?.data?.token?.accessToken
  ) {
    cookieStore.set("access_token", data.data.token.accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: data.data.token.expiresIn,
    });
    cookieStore.set("refresh_token", data.data.refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: data.data.refreshExpiresIn,
    });
  }

  if (res.ok && options.clearSessionCookies?.(path.join("/"))) {
    cookieStore.set("access_token", "", { ...COOKIE_OPTIONS, maxAge: 0 });
    cookieStore.set("refresh_token", "", { ...COOKIE_OPTIONS, maxAge: 0 });
  }

  return NextResponse.json(data, { status: res.status });
}

export function createProxyHandler(options: ProxyHandlerOptions) {
  return async function routeHandler(
    req: NextRequest,
    { params }: { params: Promise<{ path: string[] }> },
  ) {
    const { path } = await params;
    return handler(req, options, path);
  };
}
