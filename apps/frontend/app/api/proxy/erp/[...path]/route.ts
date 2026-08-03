import { createProxyHandler } from "@/lib/proxy-handler";

const ERP_URL = process.env.ERP_API_URL ?? "http://localhost:3002/api/v1";

const handler = createProxyHandler({ baseUrl: ERP_URL });

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
