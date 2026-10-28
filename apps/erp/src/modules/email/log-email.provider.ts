import type { LoggerPort } from "backend-p";
import type {
  IEmailProvider,
  SendEmailOptions,
  SendEmailResult,
} from "./email-provider.port";

export class LogEmailProvider implements IEmailProvider {
  constructor(private readonly logger: LoggerPort) {}

  async send(options: SendEmailOptions): Promise<SendEmailResult> {
    this.logger.info(
      {
        category: "email",
        action: "email.skipped",
        to: options.to,
        subject: options.subject,
        attachmentCount: options.attachments?.length ?? 0,
      },
      "Email sending skipped (log provider)",
    );
    return {};
  }
}
