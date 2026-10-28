import type { LoggerPort } from "backend-p";
import { env } from "../../config/env";
import logger from "../../utils/logger";
import type { IEmailProvider } from "./email-provider.port";
import { LogEmailProvider } from "./log-email.provider";
import { ResendEmailAdapter } from "./resend-email.adapter";
import { SmtpEmailAdapter } from "./smtp-email.adapter";

export interface EmailProviderConfig {
  readonly provider: "smtp" | "resend" | "log";
  readonly smtpHost: string;
  readonly smtpPort: number;
  readonly smtpSecure: boolean;
  readonly smtpUser: string;
  readonly smtpPass: string;
  readonly resendApiKey: string;
}

export function createEmailProvider(
  config: EmailProviderConfig,
  log: LoggerPort,
): IEmailProvider {
  switch (config.provider) {
    case "smtp": {
      if (!config.smtpHost) {
        throw new Error("SMTP_HOST is required when EMAIL_PROVIDER=smtp");
      }
      return new SmtpEmailAdapter({
        host: config.smtpHost,
        port: config.smtpPort,
        secure: config.smtpSecure,
        user: config.smtpUser,
        pass: config.smtpPass,
      });
    }
    case "resend": {
      if (!config.resendApiKey) {
        throw new Error(
          "RESEND_API_KEY is required when EMAIL_PROVIDER=resend",
        );
      }
      return new ResendEmailAdapter({ apiKey: config.resendApiKey });
    }
    case "log":
    default: {
      return new LogEmailProvider(log);
    }
  }
}

export class EmailModuleFactory {
  private static provider: IEmailProvider | null = null;

  static getProvider(): IEmailProvider {
    if (EmailModuleFactory.provider === null) {
      EmailModuleFactory.provider = createEmailProvider(
        {
          provider: env.EMAIL_PROVIDER,
          smtpHost: env.SMTP_HOST,
          smtpPort: env.SMTP_PORT,
          smtpSecure: env.SMTP_SECURE,
          smtpUser: env.SMTP_USER,
          smtpPass: env.SMTP_PASS,
          resendApiKey: env.RESEND_API_KEY,
        },
        logger,
      );
    }
    return EmailModuleFactory.provider;
  }
}
