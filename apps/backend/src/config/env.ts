import { z } from "zod";
import { loadEnv } from "backend-p";

export const env = loadEnv(3001, {
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_EXPIRES_IN: z.coerce.number().int().positive().default(900),
  REFRESH_TOKEN_EXPIRES_IN: z.coerce.number().int().positive().default(604800),
});

export type Env = typeof env;
