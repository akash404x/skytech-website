import { EmailService } from './email-provider';
import { generatePremiumOrderEmailTemplate, OrderEmailStatus } from './premium-order-email-template';
import type { Order } from './types';

// Order status types (legacy, kept for compatibility)
export type OrderStatus = 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

// Email data interface (legacy, kept for compatibility)
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
    Pending: 'Order #' + orderId + ' Received',
    Confirmed: 'Order #' + orderId + ' Confirmed',
    Processing: 'Order #' + orderId + ' is Being Processed',
    Shipped: 'Your Order #' + orderId + ' Has Been Shipped',
    Delivered: 'Order #' + orderId + ' Delivered Successfully',
    Cancelled: 'Order #' + orderId + ' Has Been Cancelled',
  };
  return subjects[status];
};

// Map legacy status to premium email status
const mapToPremiumStatus = (status: OrderStatus): OrderEmailStatus => {
  const statusMap: Record<OrderStatus, OrderEmailStatus> = {
    Pending: 'confirmed',
    Confirmed: 'confirmed',
    Processing: 'packed',
    Shipped: 'shipped',
    Delivered: 'delivered',
    Cancelled: 'cancelled',
  };
  return statusMap[status] || 'confirmed';
};

// Generate HTML email template using premium template
const generateEmailTemplate = (data: OrderEmailData): string => {
  // This function is kept for backward compatibility but now uses the premium template
  // Note: This requires an Order object, so callers should use the new function directly
  const premiumStatus = mapToPremiumStatus(data.status);
  
  // Create a minimal Order object for the template
  const minimalOrder: Partial<Order> = {
    orderNumber: data.orderId,
    customerName: data.customerName,
    userEmail: data.customerEmail,
    createdAt: new Date(data.orderDate),
    items: [],
    subtotal: 0,
    total: 0,
    currency: 'INR',
    status: premiumStatus as any,
    payment: { razorpayOrderId: '', razorpayPaymentId: '', amount: 0, currency: 'INR', status: 'captured' },
    shippingAddress: {
      fullName: data.customerName,
      phone: '',
      line1: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
    },
    timeline: [],
  };
  
  return generatePremiumOrderEmailTemplate(minimalOrder as Order, premiumStatus, data.estimatedDelivery);
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
      missingVars.forEach(v => console.error('  - ' + v));
      return {
        success: false,
        error: 'Missing environment variables: ' + missingVars.join(', ')
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
        subject: subject,
        html: html,
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
      errors.push('Order #' + data.orderId + ': ' + result.error);
    }
  }
  return {
    success: errors.length === 0,
    errors: errors,
  };
}
