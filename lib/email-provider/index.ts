// Email Provider Abstraction Layer
// This allows switching between email providers (Zoho, Brevo, Resend, SES, Mailgun) without changing frontend

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
  replyTo?: string;
}

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
}

export interface EmailMessage {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  attachments?: EmailAttachment[];
  replyTo?: string;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  provider?: string;
}

export interface EmailProvider {
  send(message: EmailMessage): Promise<EmailSendResult>;
  verify(): Promise<boolean>;
  getProviderName(): string;
}

// Zoho Mail Provider (Current implementation)
export class ZohoProvider implements EmailProvider {
  private config: EmailConfig;
  private transporter: any = null;

  constructor(config: EmailConfig) {
    this.config = config;
  }

  private async getTransporter() {
    if (!this.transporter) {
      const nodemailer = await import('nodemailer');
      this.transporter = nodemailer.createTransport({
        host: this.config.host,
        port: this.config.port,
        secure: this.config.secure,
        auth: this.config.auth,
        tls: {
          rejectUnauthorized: false,
        },
      });
    }
    return this.transporter;
  }

  getProviderName(): string {
    return 'Zoho Mail';
  }

  async verify(): Promise<boolean> {
    const transporter = await this.getTransporter();

    return new Promise((resolve) => {
      transporter.verify((error: any) => {
        resolve(!error);
      });
    });
  }

  async send(message: EmailMessage): Promise<EmailSendResult> {
    try {
      console.log('=== SENDING EMAIL VIA ZOHO PROVIDER ===');
      console.log('To:', message.to);
      console.log('Subject:', message.subject);
      console.log('From:', this.config.from);
      console.log('ReplyTo:', message.replyTo || this.config.replyTo);
      console.log('==========================================');

      const transporter = await this.getTransporter();

      const info = await transporter.sendMail({
        from: this.config.from,
        to: message.to,
        subject: message.subject,
        html: message.html,
        text: message.text,
        attachments: message.attachments,
        replyTo: message.replyTo || this.config.replyTo,
      });

      console.log('✅ Email sent successfully via Zoho:', info.messageId);
      console.log('==========================================');

      return {
        success: true,
        messageId: info.messageId,
        provider: this.getProviderName(),
      };
    } catch (error) {
      console.error('❌ Zoho SMTP Error Details:', error);
      console.error('==========================================');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: this.getProviderName(),
      };
    }
  }
}

// Brevo Provider (Future implementation)
export class BrevoProvider implements EmailProvider {
  private apiKey: string;
  private senderEmail: string;

  constructor(apiKey: string, senderEmail: string) {
    this.apiKey = apiKey;
    this.senderEmail = senderEmail;
  }

  getProviderName(): string {
    return 'Brevo';
  }

  async verify(): Promise<boolean> {
    // TODO: Implement Brevo API verification
    return true;
  }

  async send(message: EmailMessage): Promise<EmailSendResult> {
    // TODO: Implement Brevo API send
    return {
      success: false,
      error: 'Brevo provider not yet implemented',
      provider: this.getProviderName(),
    };
  }
}

// Resend Provider (Future implementation)
export class ResendProvider implements EmailProvider {
  private apiKey: string;
  private senderEmail: string;

  constructor(apiKey: string, senderEmail: string) {
    this.apiKey = apiKey;
    this.senderEmail = senderEmail;
  }

  getProviderName(): string {
    return 'Resend';
  }

  async verify(): Promise<boolean> {
    // TODO: Implement Resend API verification
    return true;
  }

  async send(message: EmailMessage): Promise<EmailSendResult> {
    // TODO: Implement Resend API send
    return {
      success: false,
      error: 'Resend provider not yet implemented',
      provider: this.getProviderName(),
    };
  }
}

// Email Service Factory
export class EmailService {
  private provider: EmailProvider;

  constructor(provider: EmailProvider) {
    this.provider = provider;
  }

  static createZohoProvider(): EmailService {
    const config: EmailConfig = {
      host: process.env.ZOHO_SMTP_HOST?.trim() || 'smtp.zoho.com',
      port: Number(process.env.ZOHO_SMTP_PORT) || 465,
      secure: process.env.ZOHO_SMTP_SECURE === 'true',
      auth: {
        user: process.env.ZOHO_EMAIL?.trim() || '',
        pass: process.env.ZOHO_PASSWORD?.trim() || '',
      },
      from: process.env.ZOHO_SMTP_FROM?.trim() || 'Sky Tech <contact@theskytechnology.in>',
      replyTo: process.env.ZOHO_SMTP_FROM?.trim() || 'contact@theskytechnology.in',
    };

    return new EmailService(new ZohoProvider(config));
  }

  static createBrevoProvider(): EmailService {
    const apiKey = process.env.BREVO_API_KEY || '';
    const senderEmail = process.env.BREVO_SENDER_EMAIL || '';
    return new EmailService(new BrevoProvider(apiKey, senderEmail));
  }

  static createResendProvider(): EmailService {
    const apiKey = process.env.RESEND_API_KEY || '';
    const senderEmail = process.env.RESEND_SENDER_EMAIL || '';
    return new EmailService(new ResendProvider(apiKey, senderEmail));
  }

  static createDefaultProvider(): EmailService {
    // Default to Zoho, can be changed via environment variable
    const providerType = process.env.EMAIL_PROVIDER?.toLowerCase() || 'zoho';

    switch (providerType) {
      case 'brevo':
        return this.createBrevoProvider();
      case 'resend':
        return this.createResendProvider();
      case 'zoho':
      default:
        return this.createZohoProvider();
    }
  }

  async send(message: EmailMessage): Promise<EmailSendResult> {
    return this.provider.send(message);
  }

  async verify(): Promise<boolean> {
    return this.provider.verify();
  }

  getProviderName(): string {
    return this.provider.getProviderName();
  }
}
