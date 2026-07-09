import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const activeCompany = request.cookies.get("active_company")?.value;
  const { pathname } = request.nextUrl;

  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register");
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isOnboarding = pathname.startsWith("/onboarding");

  if ((isDashboardRoute || isOnboarding) && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isDashboardRoute && token && !activeCompany) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  if (isAuthRoute && token) {
    const destination = activeCompany ? "/dashboard" : "/onboarding";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/login",
    "/register",
    "/onboarding",
    "/onboarding/:path*",
  ],
};
