import { z } from "zod";
import { loadEnv } from "backend-p";

export const env = loadEnv(3002, {
  CORE_API_URL: z.string().url("CORE_API_URL must be a valid URL"),
});

export type Env = typeof env;
