import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const CORE_URL = process.env.CORE_API_URL ?? "http://localhost:3001/api/v1";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;

  if (!refreshToken) {
    return NextResponse.json(
      { status: "error", message: "No refresh token" },
      { status: 401 },
    );
  }

  let res: Response;
  try {
    res = await fetch(`${CORE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
  } catch {
    return NextResponse.json(
      { status: "error", message: "Auth service unavailable" },
      { status: 503 },
    );
  }

  if (!res.ok) {
    cookieStore.delete("access_token");
    cookieStore.delete("refresh_token");
    return NextResponse.json(
      { status: "error", message: "Session expired" },
      { status: 401 },
    );
  }

  const data = await res.json();

  cookieStore.set("access_token", data.data.token.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
  cookieStore.set("refresh_token", data.data.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });

  return NextResponse.json({ status: "success" });
}
