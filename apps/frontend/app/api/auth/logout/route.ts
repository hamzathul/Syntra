import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const CORE_URL = process.env.CORE_API_URL ?? "http://localhost:3001/api/v1";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;

  if (refreshToken) {
    try {
      await fetch(`${CORE_URL}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      // Ignore upstream errors — local cleanup is what matters
    }
  }

  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");
  cookieStore.delete("auth_user");
  cookieStore.delete("active_company");

  return NextResponse.json({ status: "success", message: "Logged out" });
}
