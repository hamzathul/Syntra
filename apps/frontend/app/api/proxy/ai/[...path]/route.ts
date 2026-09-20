import { createProxyHandler } from "@/lib/proxy-handler";

const AI_URL = process.env.AI_API_URL ?? "http://localhost:3003/api/v1";

const handler = createProxyHandler({ baseUrl: AI_URL });

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
