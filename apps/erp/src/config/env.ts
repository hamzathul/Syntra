import { z } from "zod";
import { loadEnv } from "backend-p";

export const env = loadEnv(3002, {
  CORE_API_URL: z.string().url("CORE_API_URL must be a valid URL"),
  EMAIL_PROVIDER: z.enum(["smtp", "resend", "log"]).default("log"),
  EMAIL_FROM_NAME: z.string().default("Syntra ERP"),
  EMAIL_FROM_ADDRESS: z
    .email("EMAIL_FROM_ADDRESS must be a valid email")
    .optional(),
  SMTP_HOST: z.string().default(""),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_SECURE: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
  SMTP_USER: z.string().default(""),
  SMTP_PASS: z.string().default(""),
  RESEND_API_KEY: z.string().default(""),
});

export type Env = typeof env;
