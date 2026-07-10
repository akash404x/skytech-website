import { toDate } from './format';
import type { Order } from './types';

// Order status types for email templates
export type OrderEmailStatus = 
  | 'confirmed' 
  | 'packed' 
  | 'shipped' 
  | 'out_for_delivery' 
  | 'delivered' 
  | 'cancelled' 
  | 'refunded';

// Status configuration
const STATUS_CONFIG: Record<OrderEmailStatus, {
  emoji: string;
  title: string;
  message: string;
  color: string;
  bgColor: string;
}> = {
  confirmed: {
    emoji: '✅',
    title: 'ORDER CONFIRMED',
    message: 'Great news! Your order has been confirmed and is now being prepared for processing.',
    color: '#00C8FF',
    bgColor: 'rgba(0, 200, 255, 0.15)',
  },
  packed: {
    emoji: '📦',
    title: 'ORDER PACKED',
    message: 'Your order has been carefully packed by our team and is now ready for shipment. You\'ll receive another email as soon as it\'s handed over to our courier partner.',
    color: '#38BDF8',
    bgColor: 'rgba(56, 189, 248, 0.15)',
  },
  shipped: {
    emoji: '🚚',
    title: 'ORDER SHIPPED',
    message: 'Your order has been shipped and is on its way to you! Track your delivery using the tracking information provided below.',
    color: '#0EA5E9',
    bgColor: 'rgba(14, 165, 233, 0.15)',
  },
  out_for_delivery: {
    emoji: '🚗',
    title: 'OUT FOR DELIVERY',
    message: 'Your order is out for delivery and will reach you soon! The courier partner will contact you before delivery.',
    color: '#06B6D4',
    bgColor: 'rgba(6, 182, 212, 0.15)',
  },
  delivered: {
    emoji: '✅',
    title: 'ORDER DELIVERED',
    message: 'Your order has been successfully delivered! Thank you for shopping with SkyTech. We hope you love your purchase.',
    color: '#10B981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
  },
  cancelled: {
    emoji: '❌',
    title: 'ORDER CANCELLED',
    message: 'Your order has been cancelled as per your request. If you had paid, the refund will be processed to your original payment method within 5-7 business days.',
    color: '#EF4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
  },
  refunded: {
    emoji: '💰',
    title: 'ORDER REFUNDED',
    message: 'Your refund has been processed successfully. The amount has been credited to your original payment method. It may take 5-7 business days to reflect in your account.',
    color: '#F59E0B',
    bgColor: 'rgba(245, 158, 11, 0.15)',
  },
};

// Progress timeline stages
const TIMELINE_STAGES = [
  { key: 'confirmed', label: 'Order Confirmed' },
  { key: 'packed', label: 'Packed' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' },
];

// Helper function to format currency
function formatCurrency(amount: number): string {
  return `₹${amount.toFixed(2)}`;
}

// Helper function to format date
function formatDate(dateValue: any): string {
  try {
    const date = toDate(dateValue);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return 'N/A';
  }
}

// Helper function to get current stage index
function getCurrentStageIndex(status: OrderEmailStatus): number {
  const stageMap: Record<OrderEmailStatus, number> = {
    confirmed: 0,
    packed: 1,
    shipped: 2,
    out_for_delivery: 3,
    delivered: 4,
    cancelled: 0,
    refunded: 0,
  };
  return stageMap[status] || 0;
}

// Helper function to generate progress timeline HTML
function generateProgressTimeline(currentStatus: OrderEmailStatus): string {
  const currentIndex = getCurrentStageIndex(currentStatus);
  
  // For cancelled/refunded, show different timeline
  if (currentStatus === 'cancelled' || currentStatus === 'refunded') {
    return `
      <div style="background-color: #1A2235; border-radius: 12px; padding: 24px; margin: 24px 0; border: 1px solid rgba(0, 200, 255, 0.2);">
        <h3 style="margin: 0 0 16px; color: #00C8FF; font-size: 16px; font-weight: 600;">Order Progress</h3>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="color: #10B981; font-size: 18px;">✔</span>
            <span style="color: #E2E8F0; font-size: 14px;">Order Placed</span>
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="color: #10B981; font-size: 18px;">✔</span>
            <span style="color: #E2E8F0; font-size: 14px;">Order Confirmed</span>
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="color: ${currentStatus === 'cancelled' ? '#EF4444' : '#F59E0B'}; font-size: 18px;">${currentStatus === 'cancelled' ? '✖' : '💰'}</span>
            <span style="color: #E2E8F0; font-size: 14px; font-weight: 600;">${currentStatus === 'cancelled' ? 'Order Cancelled' : 'Order Refunded'}</span>
          </div>
        </div>
      </div>
    `;
  }

  const timelineHTML = TIMELINE_STAGES.map((stage, index) => {
    const isCompleted = index < currentIndex;
    const isCurrent = index === currentIndex;
    const isPending = index > currentIndex;
    
    const icon = isCompleted ? '✔' : isCurrent ? '●' : '⬜';
    const color = isCompleted ? '#10B981' : isCurrent ? '#00C8FF' : '#64748B';
    const fontWeight = isCurrent ? '600' : '400';
    
    return `
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="color: ${color}; font-size: 18px;">${icon}</span>
        <span style="color: ${isCurrent ? '#00C8FF' : '#E2E8F0'}; font-size: 14px; font-weight: ${fontWeight};">${stage.label}</span>
      </div>
    `;
  }).join('');

  return `
    <div style="background-color: #1A2235; border-radius: 12px; padding: 24px; margin: 24px 0; border: 1px solid rgba(0, 200, 255, 0.2);">
      <h3 style="margin: 0 0 16px; color: #00C8FF; font-size: 16px; font-weight: 600;">Order Progress</h3>
      <div style="display: flex; flex-direction: column; gap: 12px;">
        ${timelineHTML}
      </div>
    </div>
  `;
}

// Helper function to generate product cards HTML
function generateProductCards(items: Order['items']): string {
  if (!items || items.length === 0) {
    return '';
  }

  const productCards = items.map(item => {
    const productImage = item.image || 'https://via.placeholder.com/80x80?text=Product';
    const productName = item.name || 'Product';
    const productCategory = item.category || '';
    const quantity = item.quantity || 1;
    const unitPrice = item.unitPrice || 0;
    const lineTotal = item.lineTotal || 0;

    return `
      <div style="display: flex; gap: 16px; padding: 16px; background-color: #1A2235; border-radius: 12px; margin-bottom: 12px; border: 1px solid rgba(0, 200, 255, 0.1);">
        <div style="flex-shrink: 0;">
          <img src="${productImage}" alt="${productName}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; background-color: #0B1220;">
        </div>
        <div style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
          <h4 style="margin: 0 0 4px; color: #FFFFFF; font-size: 16px; font-weight: 600;">${productName}</h4>
          ${productCategory ? `<p style="margin: 0 0 8px; color: #94A3B8; font-size: 13px;">${productCategory}</p>` : ''}
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: #94A3B8; font-size: 13px;">Qty: ${quantity}</span>
            <span style="color: #00C8FF; font-size: 16px; font-weight: 600;">${formatCurrency(lineTotal)}</span>
          </div>
          <span style="color: #64748B; font-size: 12px;">${formatCurrency(unitPrice)} each</span>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div style="margin: 24px 0;">
      <h3 style="margin: 0 0 16px; color: #FFFFFF; font-size: 18px; font-weight: 600;">Order Items</h3>
      ${productCards}
    </div>
  `;
}

// Helper function to generate payment summary HTML
function generatePaymentSummary(order: Order): string {
  const subtotal = order.subtotal || 0;
  const gstAmount = order.gstAmount || 0;
  const gstPercentage = order.gstPercentage || 0;
  const shippingFee = order.shippingFee || 0;
  const deliveryCharge = order.deliveryCharge || 0;
  const discount = order.discount || 0;
  const walletUsed = order.walletUsed || 0;
  const total = order.total || 0;

  return `
    <div style="background-color: #1A2235; border-radius: 12px; padding: 24px; margin: 24px 0; border: 1px solid rgba(0, 200, 255, 0.2);">
      <h3 style="margin: 0 0 16px; color: #00C8FF; font-size: 16px; font-weight: 600;">Payment Summary</h3>
      
      <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
        <span style="color: #94A3B8; font-size: 14px;">Subtotal</span>
        <span style="color: #E2E8F0; font-size: 14px; font-weight: 600;">${formatCurrency(subtotal)}</span>
      </div>
      
      ${gstAmount > 0 ? `
      <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
        <span style="color: #94A3B8; font-size: 14px;">Tax (${gstPercentage}%)</span>
        <span style="color: #E2E8F0; font-size: 14px; font-weight: 600;">${formatCurrency(gstAmount)}</span>
      </div>
      ` : ''}
      
      ${shippingFee > 0 ? `
      <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
        <span style="color: #94A3B8; font-size: 14px;">Shipping</span>
        <span style="color: #E2E8F0; font-size: 14px; font-weight: 600;">${formatCurrency(shippingFee)}</span>
      </div>
      ` : `
      <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
        <span style="color: #94A3B8; font-size: 14px;">Shipping</span>
        <span style="color: #10B981; font-size: 14px; font-weight: 600;">FREE</span>
      </div>
      `}
      
      ${deliveryCharge > 0 ? `
      <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
        <span style="color: #94A3B8; font-size: 14px;">Delivery Charge</span>
        <span style="color: #E2E8F0; font-size: 14px; font-weight: 600;">${formatCurrency(deliveryCharge)}</span>
      </div>
      ` : ''}
      
      ${discount > 0 ? `
      <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
        <span style="color: #10B981; font-size: 14px;">Discount</span>
        <span style="color: #10B981; font-size: 14px; font-weight: 600;">-${formatCurrency(discount)}</span>
      </div>
      ` : ''}
      
      ${walletUsed > 0 ? `
      <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
        <span style="color: #94A3B8; font-size: 14px;">Wallet Used</span>
        <span style="color: #E2E8F0; font-size: 14px; font-weight: 600;">-${formatCurrency(walletUsed)}</span>
      </div>
      ` : ''}
      
      <div style="border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 16px; margin-top: 16px;">
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #FFFFFF; font-size: 18px; font-weight: 700;">Total Paid</span>
          <span style="color: #00C8FF; font-size: 20px; font-weight: 700;">${formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  `;
}

// Helper function to generate order summary card HTML
function generateOrderSummaryCard(order: Order, status: OrderEmailStatus, estimatedDelivery?: string): string {
  const orderNumber = order.orderNumber || 'N/A';
  const orderDate = formatDate(order.createdAt);
  const paymentMethod = order.payment?.razorpayPaymentId ? 'Razorpay' : 'Online Payment';
  const paymentStatus = order.payment?.status === 'captured' ? 'Paid' : 'Pending';
  const statusConfig = STATUS_CONFIG[status];

  return `
    <div style="background-color: #1A2235; border-radius: 12px; padding: 24px; margin: 24px 0; border: 1px solid rgba(0, 200, 255, 0.2);">
      <h3 style="margin: 0 0 16px; color: #00C8FF; font-size: 16px; font-weight: 600;">Order Details</h3>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
        <div>
          <p style="margin: 0 0 4px; color: #94A3B8; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Order ID</p>
          <p style="margin: 0; color: #FFFFFF; font-size: 16px; font-weight: 600;">#${orderNumber}</p>
        </div>
        <div>
          <p style="margin: 0 0 4px; color: #94A3B8; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Order Date</p>
          <p style="margin: 0; color: #FFFFFF; font-size: 16px; font-weight: 600;">${orderDate}</p>
        </div>
        <div>
          <p style="margin: 0 0 4px; color: #94A3B8; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Payment</p>
          <p style="margin: 0; color: #10B981; font-size: 16px; font-weight: 600;">${paymentStatus}</p>
        </div>
        <div>
          <p style="margin: 0 0 4px; color: #94A3B8; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Status</p>
          <p style="margin: 0; color: ${statusConfig.color}; font-size: 16px; font-weight: 600;">${statusConfig.title.replace('ORDER ', '')}</p>
        </div>
      </div>
      
      ${estimatedDelivery ? `
      <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
        <p style="margin: 0 0 4px; color: #94A3B8; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Estimated Delivery</p>
        <p style="margin: 0; color: #00C8FF; font-size: 16px; font-weight: 600;">${estimatedDelivery}</p>
      </div>
      ` : ''}
    </div>
  `;
}

// Helper function to generate CTA buttons HTML
function generateCTAButtons(order: Order, status: OrderEmailStatus): string {
  const trackingUrl = 'https://theskytechnology.in/orders';
  const invoiceUrl = order.invoiceUrl;
  const websiteUrl = 'https://theskytechnology.in';

  // For cancelled/refunded, show different buttons
  if (status === 'cancelled' || status === 'refunded') {
    return `
      <div style="text-align: center; margin: 32px 0;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
          <tr>
            <td style="background: linear-gradient(135deg, #00C8FF 0%, #38BDF8 100%); border-radius: 50px; box-shadow: 0 4px 15px rgba(0, 200, 255, 0.3);">
              <a href="${websiteUrl}" style="display: inline-block; padding: 16px 40px; color: #0B1220; font-size: 16px; font-weight: 700; text-decoration: none; letter-spacing: 0.5px;">Continue Shopping</a>
            </td>
          </tr>
        </table>
      </div>
    `;
  }

  let buttonsHTML = `
    <div style="text-align: center; margin: 32px 0;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin-bottom: 12px;">
        <tr>
          <td style="background: linear-gradient(135deg, #00C8FF 0%, #38BDF8 100%); border-radius: 50px; box-shadow: 0 4px 15px rgba(0, 200, 255, 0.3);">
            <a href="${trackingUrl}" style="display: inline-block; padding: 16px 40px; color: #0B1220; font-size: 16px; font-weight: 700; text-decoration: none; letter-spacing: 0.5px;">Track Order</a>
          </td>
        </tr>
      </table>
  `;

  if (invoiceUrl) {
    buttonsHTML += `
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
        <tr>
          <td style="background: transparent; border: 2px solid #00C8FF; border-radius: 50px;">
            <a href="${invoiceUrl}" style="display: inline-block; padding: 14px 36px; color: #00C8FF; font-size: 15px; font-weight: 600; text-decoration: none; letter-spacing: 0.5px;">Download Invoice</a>
          </td>
        </tr>
      </table>
    `;
  }

  buttonsHTML += '</div>';
  return buttonsHTML;
}

// Helper function to generate support section HTML
function generateSupportSection(): string {
  return `
    <div style="background-color: #1A2235; border-radius: 12px; padding: 24px; margin: 32px 0; border: 1px solid rgba(0, 200, 255, 0.2);">
      <h3 style="margin: 0 0 16px; color: #00C8FF; font-size: 16px; font-weight: 600; text-align: center;">Need Help?</h3>
      <p style="margin: 0 0 20px; color: #94A3B8; font-size: 14px; text-align: center;">Our support team is available to assist you.</p>
      
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td style="padding: 12px; text-align: center; background-color: #0B1220; border-radius: 8px;">
            <p style="margin: 0 0 4px; color: #00C8FF; font-size: 13px; font-weight: 600;">📧 Email</p>
            <a href="mailto:support@theskytechnology.in" style="color: #E2E8F0; font-size: 14px; text-decoration: none;">support@theskytechnology.in</a>
          </td>
          <td style="width: 12px;"></td>
          <td style="padding: 12px; text-align: center; background-color: #0B1220; border-radius: 8px;">
            <p style="margin: 0 0 4px; color: #00C8FF; font-size: 13px; font-weight: 600;">💬 WhatsApp</p>
            <a href="https://wa.me/918429372020" style="color: #E2E8F0; font-size: 14px; text-decoration: none;">+91 8429372020</a>
          </td>
        </tr>
        <tr>
          <td colspan="3" style="height: 12px;"></td>
        </tr>
        <tr>
          <td colspan="3" style="padding: 12px; text-align: center; background-color: #0B1220; border-radius: 8px;">
            <p style="margin: 0 0 4px; color: #00C8FF; font-size: 13px; font-weight: 600;">🌐 Website</p>
            <a href="https://www.theskytechnology.in" style="color: #E2E8F0; font-size: 14px; text-decoration: none;">www.theskytechnology.in</a>
          </td>
        </tr>
      </table>
    </div>
  `;
}

// Helper function to generate footer HTML
function generateFooter(customerEmail?: string): string {
  const currentYear = new Date().getFullYear();
  
  return `
    <div style="text-align: center; padding: 32px 0; border-top: 1px solid rgba(255, 255, 255, 0.1);">
      <p style="margin: 0 0 8px; color: #FFFFFF; font-size: 16px; font-weight: 600;">Thank you for choosing SkyTech ❤️</p>
      <p style="margin: 0 0 24px; color: #94A3B8; font-size: 14px; font-style: italic;">We're excited to build the future with you.</p>
      
      <div style="margin-bottom: 24px;">
        <a href="https://instagram.com/theskytechnology" style="display: inline-block; margin: 0 8px; color: #00C8FF; text-decoration: none; font-size: 24px;">Instagram</a>
        <a href="https://linkedin.com/company/theskytechnology" style="display: inline-block; margin: 0 8px; color: #00C8FF; text-decoration: none; font-size: 24px;">LinkedIn</a>
        <a href="https://youtube.com/@theskytechnology" style="display: inline-block; margin: 0 8px; color: #00C8FF; text-decoration: none; font-size: 24px;">YouTube</a>
        <a href="https://facebook.com/theskytechnology" style="display: inline-block; margin: 0 8px; color: #00C8FF; text-decoration: none; font-size: 24px;">Facebook</a>
      </div>
      
      <p style="margin: 0 0 8px; color: #64748B; font-size: 12px;">© ${currentYear} SkyTech</p>
      <p style="margin: 0; color: #64748B; font-size: 12px; font-style: italic;">Building The Future Through Technology</p>
      
      ${customerEmail ? `
      <p style="margin: 16px 0 0; color: #64748B; font-size: 11px;">This email was sent to ${customerEmail}</p>
      ` : ''}
    </div>
  `;
}

// Main function to generate premium order email template
export function generatePremiumOrderEmailTemplate(
  order: Order,
  status: OrderEmailStatus,
  estimatedDelivery?: string
): string {
  const statusConfig = STATUS_CONFIG[status];
  const customerName = order.customerName || 'Customer';
  const customerEmail = order.userEmail;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <title>${statusConfig.title} - SkyTech</title>
      <!--[if mso]>
      <noscript>
        <xml>
          <o:OfficeDocumentSettings>
            <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
        </xml>
      </noscript>
      <![endif]-->
      <style>
        body, table, td, p, a, li, blockquote {
          -webkit-text-size-adjust: 100%;
          -ms-text-size-adjust: 100%;
        }
        table, td {
          mso-table-lspace: 0pt;
          mso-table-rspace: 0pt;
        }
        img {
          -ms-interpolation-mode: bicubic;
          border: 0;
          height: auto;
          line-height: 100%;
          outline: none;
          text-decoration: none;
        }
        body {
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
          background-color: #0B1220;
        }
        a {
          color: #00C8FF;
          text-decoration: none;
        }
        @media screen and (max-width: 600px) {
          .container {
            width: 100% !important;
            padding: 16px !important;
          }
          .product-card {
            flex-direction: column !important;
          }
          .product-card img {
            width: 100% !important;
            height: auto !important;
          }
          .grid-2 {
            grid-template-columns: 1fr !important;
          }
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #0B1220; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      
      <!-- Email Container -->
      <table class="container" role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        
        <!-- Header with Logo -->
        <tr>
          <td style="padding: 40px 32px; background: linear-gradient(135deg, #00C8FF 0%, #38BDF8 100%); border-radius: 16px 16px 0 0; text-align: center;">
            <div style="display: inline-block; background: rgba(11, 18, 32, 0.2); padding: 20px 40px; border-radius: 12px; backdrop-filter: blur(10px);">
              <span style="color: #0B1220; font-size: 32px; font-weight: 800; letter-spacing: -0.5px;">
                Sky<span style="color: #0B1220;">Tech</span>
              </span>
            </div>
            <p style="margin: 16px 0 0; color: #0B1220; font-size: 14px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;">
              Building The Future Through Technology
            </p>
          </td>
        </tr>

        <!-- Content Body -->
        <tr>
          <td style="padding: 32px; background-color: #0B1220; border-left: 1px solid rgba(0, 200, 255, 0.2); border-right: 1px solid rgba(0, 200, 255, 0.2);">
            
            <!-- Status Badge -->
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="display: inline-block; padding: 16px 32px; background-color: ${statusConfig.bgColor}; border: 2px solid ${statusConfig.color}; border-radius: 50px; box-shadow: 0 4px 15px rgba(0, 200, 255, 0.2);">
                <span style="font-size: 24px; margin-right: 8px;">${statusConfig.emoji}</span>
                <span style="color: ${statusConfig.color}; font-size: 18px; font-weight: 700; letter-spacing: 0.5px;">${statusConfig.title}</span>
              </div>
            </div>

            <!-- Greeting -->
            <p style="margin: 0 0 16px; color: #E2E8F0; font-size: 20px; font-weight: 600; text-align: center;">
              Hello ${customerName},
            </p>
            
            <!-- Status Message -->
            <p style="margin: 0 0 24px; color: #94A3B8; font-size: 15px; line-height: 1.6; text-align: center;">
              ${statusConfig.message}
            </p>

            <!-- Order Summary Card -->
            ${generateOrderSummaryCard(order, status, estimatedDelivery)}

            <!-- Progress Timeline -->
            ${generateProgressTimeline(status)}

            <!-- Product Cards -->
            ${generateProductCards(order.items)}

            <!-- Payment Summary -->
            ${generatePaymentSummary(order)}

            <!-- CTA Buttons -->
            ${generateCTAButtons(order, status)}

            <!-- Support Section -->
            ${generateSupportSection()}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding: 32px; background-color: #0B1220; border: 1px solid rgba(0, 200, 255, 0.2); border-top: none; border-radius: 0 0 16px 16px;">
            ${generateFooter(customerEmail)}
          </td>
        </tr>

      </table>
      <!-- End Email Container -->

    </body>
    </html>
  `;
}
