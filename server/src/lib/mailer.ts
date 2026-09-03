export type MailMessage = {
  to: string;
  subject: string;
  text: string;
};

export interface Mailer {
  send(message: MailMessage): Promise<void>;
}

export class ConsoleMailer implements Mailer {
  async send(message: MailMessage): Promise<void> {
    console.info(`[mail] to=${message.to} subject=${message.subject}\n${message.text}`);
  }
}

export class SendGridMailer implements Mailer {
  constructor(
    private readonly apiKey: string,
    private readonly from: string,
  ) {}

  async send(message: MailMessage): Promise<void> {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: message.to }] }],
        from: { email: this.from },
        subject: message.subject,
        content: [{ type: "text/plain", value: message.text }],
      }),
    });
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`SendGrid failed: ${response.status} ${body}`);
    }
  }
}

export function createMailer(apiKey: string, from: string): Mailer {
  if (apiKey) {
    return new SendGridMailer(apiKey, from);
  }
  return new ConsoleMailer();
}
