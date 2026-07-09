import { EmailService } from './email-provider';
import { toDate } from './format';
import type { Order } from './types';

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

export function getOrderStatusEmailTemplate(order: Order, status: string): string {
  const statusMessages: Record<string, { title: string; message: string; color: string }> = {
    pending: {
      title: 'Order Placed Successfully',
      message: 'Your order has been received and is being processed.',
      color: '#f59e0b',
    },
    confirmed: {
      title: 'Order Confirmed',
      message: 'Your order has been confirmed and is being prepared for shipment.',
      color: '#22c55e',
    },
    packed: {
      title: 'Order Packed',
      message: 'Your order has been packed and is ready for pickup by the courier.',
      color: '#3b82f6',
    },
    shipped: {
      title: 'Order Shipped',
      message: 'Your order has been shipped and is on its way to you.',
      color: '#8b5cf6',
    },
    delivered: {
      title: 'Order Delivered',
      message: 'Your order has been delivered successfully. Thank you for shopping with SkyTech!',
      color: '#10b981',
    },
    cancelled: {
      title: 'Order Cancelled',
      message: 'Your order has been cancelled. If you have any questions, please contact our support team.',
      color: '#ef4444',
    },
  };

  const invoiceSection = order.invoiceUrl ? `
          <div style="background-color: #f0fdf4; border: 1px solid #22c55e; border-radius: 6px; padding: 20px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #166534; font-size: 16px;">📄 Invoice</h3>
            <p style="margin: 0 0 15px 0; color: #475569; font-size: 14px;">Your invoice is ready. You can download it using the button below.</p>
            <div style="text-align: center;">
              <a href="${order.invoiceUrl}" class="button" target="_blank">Download Invoice</a>
            </div>
            <p style="margin: 10px 0 0 0; color: #64748b; font-size: 12px; text-align: center;">Invoice Number: ${order.invoiceNumber || 'N/A'}</p>
          </div>
        ` : '';

  const statusInfo = statusMessages[status] || statusMessages.pending;
  const orderDate = toDate(order.createdAt).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${statusInfo.title} - SkyTech</title>
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
        .status-badge {
          display: inline-block;
          padding: 8px 16px;
          background-color: ${statusInfo.color};
          color: white;
          border-radius: 20px;
          font-weight: bold;
          font-size: 14px;
          margin-bottom: 20px;
        }
        .order-info {
          background-color: #f8fafc;
          border-radius: 6px;
          padding: 20px;
          margin: 20px 0;
        }
        .order-info h3 {
          margin: 0 0 15px 0;
          color: #020617;
          font-size: 16px;
        }
        .order-info p {
          margin: 5px 0;
          color: #475569;
          font-size: 14px;
        }
        .order-info strong {
          color: #020617;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        .items-table th {
          background-color: #f1f5f9;
          padding: 12px;
          text-align: left;
          font-weight: bold;
          color: #020617;
          font-size: 14px;
        }
        .items-table td {
          padding: 12px;
          border-bottom: 1px solid #e2e8f0;
          color: #475569;
          font-size: 14px;
        }
        .total-section {
          background-color: #f8fafc;
          border-radius: 6px;
          padding: 20px;
          margin: 20px 0;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          margin: 8px 0;
          color: #475569;
          font-size: 14px;
        }
        .total-row.grand-total {
          font-weight: bold;
          color: #020617;
          font-size: 18px;
          border-top: 2px solid #e2e8f0;
          padding-top: 12px;
          margin-top: 12px;
        }
        .footer {
          background-color: #f8fafc;
          padding: 20px;
          text-align: center;
          color: #64748b;
          font-size: 12px;
        }
        .footer a {
          color: #0ea5e9;
          text-decoration: none;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #0ea5e9;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          font-weight: bold;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>SkyTech</h1>
        </div>
        <div class="content">
          <div class="status-badge">${statusInfo.title}</div>
          <p style="font-size: 16px; color: #334155;">${statusInfo.message}</p>
          
          <div class="order-info">
            <h3>Order Information</h3>
            <p><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p><strong>Order Date:</strong> ${orderDate}</p>
            <p><strong>Customer:</strong> ${order.customerName}</p>
            <p><strong>Email:</strong> ${order.userEmail}</p>
            ${order.shippingAddress ? `
            <h3 style="margin-top: 20px; margin-bottom: 10px; color: #020617; font-size: 16px;">Shipping Address</h3>
            <p style="margin: 5px 0; color: #475569; font-size: 14px;">${order.shippingAddress.fullName}</p>
            <p style="margin: 5px 0; color: #475569; font-size: 14px;">${order.shippingAddress.line1}</p>
            ${order.shippingAddress.line2 ? `<p style="margin: 5px 0; color: #475569; font-size: 14px;">${order.shippingAddress.line2}</p>` : ''}
            <p style="margin: 5px 0; color: #475569; font-size: 14px;">${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}</p>
            <p style="margin: 5px 0; color: #475569; font-size: 14px;">${order.shippingAddress.country}</p>
            <p style="margin: 5px 0; color: #475569; font-size: 14px;">Phone: ${order.shippingAddress.phone}</p>
            ` : ''}
          </div>

          <h3 style="color: #020617; font-size: 16px;">Order Items</h3>
          <table class="items-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.quantity}</td>
                  <td>₹${item.unitPrice.toFixed(2)}</td>
                  <td>₹${item.lineTotal.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="total-section">
            <div class="total-row">
              <span>Subtotal</span>
              <span>₹${order.subtotal.toFixed(2)}</span>
            </div>
            ${order.gstAmount ? `
              <div class="total-row">
                <span>GST (${order.gstPercentage}%)</span>
                <span>₹${order.gstAmount.toFixed(2)}</span>
              </div>
            ` : ''}
            ${order.shippingFee ? `
              <div class="total-row">
                <span>Shipping Fee</span>
                <span>₹${order.shippingFee.toFixed(2)}</span>
              </div>
            ` : ''}
            ${order.deliveryCharge ? `
              <div class="total-row">
                <span>Delivery Charge</span>
                <span>₹${order.deliveryCharge.toFixed(2)}</span>
              </div>
            ` : ''}
            ${order.discount ? `
              <div class="total-row" style="color: #22c55e;">
                <span>Discount</span>
                <span>-₹${order.discount.toFixed(2)}</span>
              </div>
            ` : ''}
            ${order.walletUsed ? `
              <div class="total-row">
                <span>Wallet Used</span>
                <span>-₹${order.walletUsed.toFixed(2)}</span>
              </div>
            ` : ''}
            <div class="total-row grand-total">
              <span>Grand Total</span>
              <span>₹${order.total.toFixed(2)}</span>
            </div>
          </div>

          ${invoiceSection}

          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/orders" class="button">View Your Orders</a>
          </div>
        </div>
        <div class="footer">
          <p>Thank you for shopping with SkyTech!</p>
          <p>If you have any questions, please contact us at <a href="mailto:support@skytech.com">support@skytech.com</a></p>
          <p style="margin-top: 10px;">© ${new Date().getFullYear()} SkyTech. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
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
