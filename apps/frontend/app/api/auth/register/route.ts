import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const CORE_URL = process.env.CORE_API_URL ?? "http://localhost:3001/api/v1";

export async function POST(req: NextRequest) {
  const body = await req.json();

  let res: Response;
  try {
    res = await fetch(`${CORE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    return NextResponse.json(
      { status: "error", message: "Auth service unavailable" },
      { status: 503 },
    );
  }

  const data = await res.json();
  if (!res.ok) return NextResponse.json(data, { status: res.status });

  const cookieStore = await cookies();
  cookieStore.set("access_token", data.data.token.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  return NextResponse.json({
    status: "success",
    message: data.message,
    data: { user: data.data.user },
  });
}
