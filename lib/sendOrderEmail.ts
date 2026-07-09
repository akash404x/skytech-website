import { EmailService } from './email-provider';

// Order status types
export type OrderStatus = 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

// Email data interface
export interface OrderEmailData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  status: OrderStatus;
  orderDate: string;
  estimatedDelivery?: string;
}

// Status-specific email subjects
const getSubject = (orderId: string, status: OrderStatus): string => {
  const subjects: Record<OrderStatus, string> = {
    Pending: `Order #${orderId} Received`,
    Confirmed: `Order #${orderId} Confirmed`,
    Processing: `Order #${orderId} is Being Processed`,
    Shipped: `Your Order #${orderId} Has Been Shipped`,
    Delivered: `Order #${orderId} Delivered Successfully`,
    Cancelled: `Order #${orderId} Has Been Cancelled`,
  };
  return subjects[status];
};

// Status-specific messages
const getStatusMessage = (status: OrderStatus): string => {
  const messages: Record<OrderStatus, string> = {
    Pending: 'We have received your order and are reviewing it. You will receive a confirmation email shortly.',
    Confirmed: 'Great news! Your order has been confirmed and is now being prepared for processing.',
    Processing: 'Your order is currently being processed and will be shipped soon.',
    Shipped: 'Your order has been shipped and is on its way to you. Track your delivery using the provided tracking information.',
    Delivered: 'Your order has been successfully delivered. Thank you for shopping with Sky Tech!',
    Cancelled: 'Your order has been cancelled. If you have any questions, please contact our support team.',
  };
  return messages[status];
};

// Status-specific colors
const getStatusColor = (status: OrderStatus): string => {
  const colors: Record<OrderStatus, string> = {
    Pending: '#f59e0b', // amber
    Confirmed: '#22c55e', // green
    Processing: '#3b82f6', // blue
    Shipped: '#06b6d4', // cyan
    Delivered: '#10b981', // emerald
    Cancelled: '#ef4444', // red
  };
  return colors[status];
};

// Generate HTML email template with Sky Tech branding
const generateEmailTemplate = (data: OrderEmailData): string => {
  const statusColor = getStatusColor(data.status);
  const statusMessage = getStatusMessage(data.status);
  const websiteUrl = 'https://theskytechnology.in';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Update - Sky Tech</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          background-color: #0f172a;
          margin: 0;
          padding: 20px;
          line-height: 1.6;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        .header {
          background: linear-gradient(135deg, #00bfff 0%, #00e5ff 100%);
          padding: 40px 30px;
          text-align: center;
        }
        .logo {
          font-size: 32px;
          font-weight: bold;
          font-style: italic;
          color: #020617;
          margin: 0;
        }
        .logo span {
          background: linear-gradient(135deg, #00bfff 0%, #00e5ff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .content {
          padding: 40px 30px;
        }
        .greeting {
          color: #e2e8f0;
          font-size: 24px;
          font-weight: 600;
          margin: 0 0 20px 0;
        }
        .status-badge {
          display: inline-block;
          padding: 12px 24px;
          background-color: ${statusColor};
          color: white;
          font-size: 18px;
          font-weight: 600;
          border-radius: 50px;
          margin: 20px 0;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        }
        .message {
          color: #cbd5e1;
          font-size: 16px;
          margin: 20px 0;
        }
        .order-details {
          background-color: rgba(30, 41, 59, 0.8);
          border-radius: 12px;
          padding: 24px;
          margin: 24px 0;
          border: 1px solid rgba(0, 191, 255, 0.2);
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .detail-row:last-child {
          border-bottom: none;
        }
        .detail-label {
          color: #94a3b8;
          font-size: 14px;
          font-weight: 500;
        }
        .detail-value {
          color: #e2e8f0;
          font-size: 14px;
          font-weight: 600;
        }
        .cta-button {
          display: inline-block;
          padding: 16px 32px;
          background: linear-gradient(135deg, #00bfff 0%, #00e5ff 100%);
          color: #020617;
          text-decoration: none;
          font-size: 16px;
          font-weight: 600;
          border-radius: 50px;
          margin: 24px 0;
          box-shadow: 0 4px 15px rgba(0, 191, 255, 0.4);
          transition: transform 0.2s ease;
        }
        .cta-button:hover {
          transform: translateY(-2px);
        }
        .footer {
          background-color: #0f172a;
          padding: 30px;
          text-align: center;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        .footer-text {
          color: #64748b;
          font-size: 14px;
          margin: 5px 0;
        }
        .footer-link {
          color: #00e5ff;
          text-decoration: none;
        }
        .footer-link:hover {
          text-decoration: underline;
        }
        @media (max-width: 600px) {
          .container {
            border-radius: 0;
          }
          .header {
            padding: 30px 20px;
          }
          .content {
            padding: 30px 20px;
          }
          .greeting {
            font-size: 20px;
          }
          .status-badge {
            font-size: 16px;
            padding: 10px 20px;
          }
          .detail-row {
            flex-direction: column;
            gap: 8px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="logo">Sky<span>Tech</span></h1>
        </div>
        <div class="content">
          <h2 class="greeting">Hello ${data.customerName},</h2>
          <div class="status-badge">${data.status}</div>
          <p class="message">${statusMessage}</p>
          
          <div class="order-details">
            <div class="detail-row">
              <span class="detail-label">Order ID</span>
              <span class="detail-value">#${data.orderId}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Order Date</span>
              <span class="detail-value">${data.orderDate}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Current Status</span>
              <span class="detail-value">${data.status}</span>
            </div>
            ${data.estimatedDelivery ? `
            <div class="detail-row">
              <span class="detail-label">Estimated Delivery</span>
              <span class="detail-value">${data.estimatedDelivery}</span>
            </div>
            ` : ''}
          </div>
          
          <div style="text-align: center;">
            <a href="${websiteUrl}" class="cta-button">Visit Website</a>
          </div>
          
          <p class="message" style="text-align: center; margin-top: 30px;">
            Thank you for choosing Sky Tech. If you have any questions, please don't hesitate to contact our support team.
          </p>
        </div>
        <div class="footer">
          <p class="footer-text">© ${new Date().getFullYear()} Sky Tech. All rights reserved.</p>
          <p class="footer-text">
            <a href="${websiteUrl}" class="footer-link">theskytechnology.in</a>
          </p>
          <p class="footer-text" style="margin-top: 15px;">
            This is an automated email. Please do not reply.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Main function to send order status email
export async function sendOrderStatusEmail(data: OrderEmailData): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate environment variables
    const missingVars: string[] = [];
    if (!process.env.ORDER_EMAIL) missingVars.push('ORDER_EMAIL');
    if (!process.env.ORDER_EMAIL_PASSWORD) missingVars.push('ORDER_EMAIL_PASSWORD');
    if (!process.env.ZOHO_SMTP_HOST) missingVars.push('ZOHO_SMTP_HOST');
    if (!process.env.ZOHO_SMTP_PORT) missingVars.push('ZOHO_SMTP_PORT');
    if (!process.env.ZOHO_SMTP_SECURE) missingVars.push('ZOHO_SMTP_SECURE');
    if (!process.env.ORDER_SMTP_FROM) missingVars.push('ORDER_SMTP_FROM');

    if (missingVars.length > 0) {
      console.error('❌ Missing environment variables:');
      missingVars.forEach(v => console.error(`  - ${v}`));
      return {
        success: false,
        error: `Missing environment variables: ${missingVars.join(', ')}'
      };
    }

    // Validate required fields
    if (!data.orderId || !data.customerName || !data.customerEmail || !data.status || !data.orderDate) {
      throw new Error('Missing required email data fields');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.customerEmail)) {
      throw new Error('Invalid customer email format');
    }

    // Generate email content
    const subject = getSubject(data.orderId, data.status);
    const html = generateEmailTemplate(data);

    // Log email sending
    console.log('=== SENDING ORDER STATUS EMAIL ===');
    console.log('To:', data.customerEmail);
    console.log('Subject:', subject);
    console.log('From:', process.env.ORDER_SMTP_FROM?.trim() || process.env.ORDER_EMAIL?.trim());
    console.log('=====================================');

    // Send email using order provider
    try {
      const emailService = EmailService.createOrderProvider();
      const verified = await emailService.verify();

      if (!verified) {
        console.error('❌ Email provider verification failed');
        return {
          success: false,
          error: 'Email provider verification failed'
        };
      }

      const result = await emailService.send({
        to: data.customerEmail,
        subject,
        html,
      });

      if (result.success) {
        console.log('✅ Email sent successfully:', result.messageId);
        return { success: true };
      } else {
        console.error('❌ Failed to send email:', result.error);
        return {
          success: false,
          error: result.error || 'Unknown error occurred'
        };
      }
    } catch (error) {
      console.error('Vercel SMTP Error Details:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  } catch (error) {
    console.error('Vercel SMTP Error Details:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// Function to send multiple emails (batch processing)
export async function sendBatchOrderEmails(emailDataArray: OrderEmailData[]): Promise<{ success: boolean; errors: string[] }> {
  const errors: string[] = [];

  for (const data of emailDataArray) {
    const result = await sendOrderStatusEmail(data);
    if (!result.success) {
      errors.push(`Order #${data.orderId}: ${result.error}`);
    }
  }

  return {
    success: errors.length === 0,
    errors,
  };
}
