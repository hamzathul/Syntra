export interface EmailAttachment {
  readonly filename: string;
  readonly contentBase64: string;
  readonly contentType: string;
}

export interface SendEmailOptions {
  readonly from: string;
  readonly to: string;
  readonly subject: string;
  readonly text?: string;
  readonly html?: string;
  readonly attachments?: readonly EmailAttachment[];
}

export interface IEmailProvider {
  send(options: SendEmailOptions): Promise<SendEmailResult>;
}

export interface SendEmailResult {
  /** Provider-side message id, when the provider reports one. */
  readonly messageId?: string;
  /**
   * Preview URL for caught test messages (e.g. Ethereal via
   * `nodemailer.getTestMessageUrl`). Only set by providers that offer one.
   */
  readonly previewUrl?: string;
}
