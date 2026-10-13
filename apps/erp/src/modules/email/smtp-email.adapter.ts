import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import type {
  IEmailProvider,
  SendEmailOptions,
  SendEmailResult,
} from "./email-provider.port";

export interface SmtpEmailConfig {
  readonly host: string;
  readonly port: number;
  readonly secure: boolean;
  readonly user: string;
  readonly pass: string;
}

// Must stay well under the 10s Express request timeout
// (request-timeout.middleware) and the 8s frontend axios timeout, so a
// hanging SMTP server surfaces as a 502 here instead of a 408 elsewhere.
const SMTP_TIMEOUT_MS = 5_000;

export class SmtpEmailAdapter implements IEmailProvider {
  private readonly transporter: Transporter;

  constructor(private readonly config: SmtpEmailConfig) {
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth:
        config.user || config.pass
          ? { user: config.user, pass: config.pass }
          : undefined,
      connectionTimeout: SMTP_TIMEOUT_MS,
      greetingTimeout: SMTP_TIMEOUT_MS,
      socketTimeout: SMTP_TIMEOUT_MS,
    });
  }

  async send(options: SendEmailOptions): Promise<SendEmailResult> {
    const info = await this.transporter.sendMail({
      from: options.from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments?.map((attachment) => ({
        filename: attachment.filename,
        content: Buffer.from(attachment.contentBase64, "base64"),
        contentType: attachment.contentType,
      })),
    });
    return {
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info) || undefined,
    };
  }
}
