import { z } from "zod";
import { createApiSuccessResponseSchema } from "../api/schemas";

export const healthStatusSchema = z.object({
  service: z.literal("backend"),
  status: z.enum(["ok", "degraded"]),
  uptime: z.number().nonnegative(),
  checkedAt: z.string().datetime(),
});

export const healthResponseSchema =
  createApiSuccessResponseSchema(healthStatusSchema);

export type HealthStatusDto = z.infer<typeof healthStatusSchema>;
export type HealthResponseDto = z.infer<typeof healthResponseSchema>;
