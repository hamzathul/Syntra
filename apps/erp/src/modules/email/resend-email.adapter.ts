import type {
  IEmailProvider,
  SendEmailOptions,
  SendEmailResult,
} from "./email-provider.port";

export interface ResendEmailConfig {
  readonly apiKey: string;
}

const RESEND_API_URL = "https://api.resend.com/emails";

export class ResendEmailAdapter implements IEmailProvider {
  constructor(private readonly config: ResendEmailConfig) {}

  async send(options: SendEmailOptions): Promise<SendEmailResult> {
    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: options.from,
        to: [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text,
        attachments: options.attachments?.map((attachment) => ({
          filename: attachment.filename,
          content: attachment.contentBase64,
        })),
      }),
    });

    if (!response.ok) {
      throw new Error(`Resend API failed with status ${response.status}`);
    }
    return {};
  }
}
