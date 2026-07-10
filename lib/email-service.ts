import { EmailService } from './email-provider';
import { toDate } from './format';
import type { Order } from './types';
import { generatePremiumOrderEmailTemplate } from './premium-order-email-template';

export async function getEmailDebugInfo() {
  const config: any = {
    provider: 'Email Service with Provider Selection',
    environment: process.env.NODE_ENV || 'development',
    smtpHost: process.env.ZOHO_SMTP_HOST || 'smtp.zoho.com',
    smtpPort: process.env.ZOHO_SMTP_PORT || '465',
    smtpSecure: process.env.ZOHO_SMTP_SECURE === 'true',
    orderEmailPresent: !!process.env.ORDER_EMAIL,
    orderEmail: process.env.ORDER_EMAIL ? process.env.ORDER_EMAIL.substring(0, 3) + '***' : 'NOT SET',
    orderPassPresent: !!process.env.ORDER_EMAIL_PASSWORD,
    orderPassLength: process.env.ORDER_EMAIL_PASSWORD ? process.env.ORDER_EMAIL_PASSWORD.length : 0,
    orderFrom: process.env.ORDER_SMTP_FROM || 'Sky Tech <order@theskytechnology.in>',
    contactEmailPresent: !!process.env.CONTACT_EMAIL,
    contactEmail: process.env.CONTACT_EMAIL ? process.env.CONTACT_EMAIL.substring(0, 3) + '***' : 'NOT SET',
    contactPassPresent: !!process.env.CONTACT_EMAIL_PASSWORD,
    contactPassLength: process.env.CONTACT_EMAIL_PASSWORD ? process.env.CONTACT_EMAIL_PASSWORD.length : 0,
    contactFrom: process.env.CONTACT_SMTP_FROM || 'Sky Tech <contact@theskytechnology.in>',
  };
  
  return config;
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
  provider = 'order',
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  provider?: 'order' | 'contact';
}): Promise<{ success: boolean; error?: string; details?: any }> {
  try {
    console.log('=== SENDING EMAIL ===');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('Provider:', provider);
    
    const emailService = EmailService.createProvider(provider);
    const verified = await emailService.verify();

    if (!verified) {
      console.error('❌ Email provider verification failed for:', provider);
      return { 
        success: false, 
        error: `Email provider verification failed for ${provider}`
      };
    }

    const result = await emailService.send({
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
    });

    if (result.success) {
      console.log('✅ Email sent successfully:', result.messageId);
      console.log('====================');
      return { success: true };
    } else {
      console.error('❌ Failed to send email:', result.error);
      console.error('====================');
      return { 
        success: false, 
        error: result.error || 'Unknown error'
      };
    }
  } catch (error) {
    console.error('Vercel SMTP Error Details:', error);
    console.error('====================');
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? {
        name: error.name,
        message: error.message,
        response: (error as any).response,
        responseStatus: (error as any).responseStatus,
        responseCode: (error as any).responseCode,
        command: (error as any).command,
      } : null
    };
  }
}

export function getOrderStatusEmailTemplate(order: Order, status?: string): string {
  // Use the new premium template - it now uses order.status directly
  const result = generatePremiumOrderEmailTemplate(order);
  return result.html;
}

export function getOrderStatusEmailSubject(order: Order, status?: string): string {
  // Use the new premium template - it now uses order.status directly
  const result = generatePremiumOrderEmailTemplate(order);
  return result.subject;
}

export function getReturnApprovedEmailTemplate(order: Order, amount: number): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Return Approved - SkyTech</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          background-color: #f5f5f5;
          margin: 0;
          padding: 20px;
          line-height: 1.6;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, #020617 0%, #1e293b 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: bold;
        }
        .content {
          padding: 30px;
        }
        .success-box {
          background-color: #dcfce7;
          border: 1px solid #22c55e;
          border-radius: 6px;
          padding: 20px;
          margin: 20px 0;
          text-align: center;
        }
        .success-box h2 {
          margin: 0 0 10px 0;
          color: #166534;
          font-size: 20px;
        }
        .success-box p {
          margin: 0;
          color: #166534;
          font-size: 16px;
        }
        .amount-highlight {
          font-size: 32px;
          font-weight: bold;
          color: #22c55e;
          margin: 20px 0;
        }
        .footer {
          background-color: #f8fafc;
          padding: 20px;
          text-align: center;
          color: #64748b;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>SkyTech</h1>
        </div>
        <div class="content">
          <div class="success-box">
            <h2>Return Approved</h2>
            <p>Your return request for order ${order.orderNumber} has been approved.</p>
          </div>
          
          <p style="text-align: center; color: #475569; font-size: 16px;">The refund amount has been credited to your wallet:</p>
          
          <div class="amount-highlight">₹${amount.toFixed(2)}</div>
          
          <p style="text-align: center; color: #475569; font-size: 14px;">You can use this wallet balance for future purchases.</p>
        </div>
        <div class="footer">
          <p>Thank you for shopping with SkyTech!</p>
          <p>© ${new Date().getFullYear()} SkyTech. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function getReplacementApprovedEmailTemplate(order: Order): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Replacement Approved - SkyTech</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          background-color: #f5f5f5;
          margin: 0;
          padding: 20px;
          line-height: 1.6;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, #020617 0%, #1e293b 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: bold;
        }
        .content {
          padding: 30px;
        }
        .success-box {
          background-color: #dbeafe;
          border: 1px solid #3b82f6;
          border-radius: 6px;
          padding: 20px;
          margin: 20px 0;
          text-align: center;
        }
        .success-box h2 {
          margin: 0 0 10px 0;
          color: #1e40af;
          font-size: 20px;
        }
        .success-box p {
          margin: 0;
          color: #1e40af;
          font-size: 16px;
        }
        .footer {
          background-color: #f8fafc;
          padding: 20px;
          text-align: center;
          color: #64748b;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>SkyTech</h1>
        </div>
        <div class="content">
          <div class="success-box">
            <h2>Replacement Approved</h2>
            <p>Your replacement request for order ${order.orderNumber} has been approved.</p>
          </div>
          
          <p style="text-align: center; color: #475569; font-size: 16px;">Our team will contact you shortly to schedule the pickup of the original item and delivery of the replacement.</p>
        </div>
        <div class="footer">
          <p>Thank you for shopping with SkyTech!</p>
          <p>© ${new Date().getFullYear()} SkyTech. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
