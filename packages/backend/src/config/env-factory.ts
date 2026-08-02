import "dotenv/config";
import { z } from "zod";

const LOG_LEVELS = ["trace", "debug", "info", "warn", "error", "fatal"] as const;

export interface BaseEnv {
  NODE_ENV: "development" | "production" | "test";
  PORT: number;
  DATABASE_URL: string;
  LOG_LEVEL: (typeof LOG_LEVELS)[number];
  LOG_DIR: string;
  CORS_ORIGINS: string;
}

export function loadEnv<TExtras extends z.ZodRawShape>(
  portDefault: number,
  extras?: TExtras,
): BaseEnv & z.infer<z.ZodObject<TExtras>> {
  const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT: z.coerce.number().int().positive().default(portDefault),
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
    LOG_LEVEL: z.enum(LOG_LEVELS).default("info"),
    LOG_DIR: z.string().default("logs"),
    CORS_ORIGINS: z.string().default("*"),
    ...extras,
  });

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error("Invalid environment variables:");
    for (const issue of result.error.issues) {
      console.error(`  ${issue.path.join(".")}: ${issue.message}`);
    }
    process.exit(1);
  }

  return result.data as BaseEnv & z.infer<z.ZodObject<TExtras>>;
}
