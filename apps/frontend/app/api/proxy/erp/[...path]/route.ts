import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const ERP_URL = process.env.ERP_API_URL ?? "http://localhost:3002/api/v1";

async function handler(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  const url = `${ERP_URL}/${path.join("/")}${req.nextUrl.search}`;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const companyId = req.headers.get("x-company-id");
  if (companyId) headers["X-Company-Id"] = companyId;

  const body =
    req.method !== "GET" && req.method !== "HEAD" ? await req.text() : undefined;

  let res: Response;
  try {
    res = await fetch(url, { method: req.method, headers, body });
  } catch {
    return NextResponse.json(
      { status: "error", message: "ERP service unavailable" },
      { status: 503 },
    );
  }

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
