import { Resend } from 'resend';
import { env } from '../../config/env';

export class ResendProvider {
  private static instance: ResendProvider;
  private resend: Resend;

  private constructor() {
    this.resend = new Resend(env.RESEND_API_KEY);
  }

  public static getInstance(): ResendProvider {
    if (!ResendProvider.instance) {
      ResendProvider.instance = new ResendProvider();
    }
    return ResendProvider.instance;
  }

  /**
   * Sends transactional email using Resend SDK with exponential backoff retries.
   */
  public async send({
    to,
    subject,
    html,
    replyTo,
    attachments,
  }: {
    to: string;
    subject: string;
    html: string;
    replyTo?: string;
    attachments?: Array<{ filename: string; content: Buffer }>;
  }): Promise<any> {
    const maxRetries = 3;
    let delay = 1000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const payload: any = {
          from: env.EMAIL_FROM,
          to,
          subject,
          html,
          replyTo: replyTo || env.EMAIL_REPLY_TO,
        };

        if (attachments && attachments.length > 0) {
          payload.attachments = attachments.map((att) => ({
            filename: att.filename,
            content: att.content,
          }));
        }

        const response = await this.resend.emails.send(payload);
        if (response.error) {
          throw new Error(response.error.message);
        }
        return response;
      } catch (error: any) {
        if (attempt === maxRetries) {
          throw new Error(`Resend email delivery failed after ${maxRetries} attempts. Error: ${error.message}`);
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // exponential backoff
      }
    }
  }
}

export const resendProvider = ResendProvider.getInstance();
