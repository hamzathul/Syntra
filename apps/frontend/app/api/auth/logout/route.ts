import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("access_token");
  cookieStore.delete("auth_user");
  cookieStore.delete("active_company");
  return NextResponse.json({ status: "success", message: "Logged out" });
}
