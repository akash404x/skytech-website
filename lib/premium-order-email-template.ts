import { toDate } from './format';
import type { Order, OrderStatus } from './types';

// Status configuration for email display
const STATUS_CONFIG: Record<OrderStatus, {
  emoji: string;
  title: string;
  message: string;
  color: string;
  bgColor: string;
  subject: string;
}> = {
  pending: {
    emoji: '⏳',
    title: 'ORDER PENDING',
    message: 'We have received your order and are reviewing it. You will receive a confirmation email shortly.',
    color: '#F59E0B',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    subject: 'Order Pending - SkyTech',
  },
  confirmed: {
    emoji: '✅',
    title: 'ORDER CONFIRMED',
    message: 'Great news! Your order has been confirmed and is now being prepared for processing.',
    color: '#00C8FF',
    bgColor: 'rgba(0, 200, 255, 0.15)',
    subject: 'Order Confirmed - SkyTech',
  },
  processing: {
    emoji: '⚙️',
    title: 'ORDER PROCESSING',
    message: 'Your order is currently being processed by our team. We are preparing your items for shipment.',
    color: '#8B5CF6',
    bgColor: 'rgba(139, 92, 246, 0.15)',
    subject: 'Your Order Is Being Processed',
  },
  packed: {
    emoji: '📦',
    title: 'ORDER PACKED',
    message: 'Your order has been carefully packed by our team and is now ready for shipment. You\'ll receive another email as soon as it\'s handed over to our courier partner.',
    color: '#38BDF8',
    bgColor: 'rgba(56, 189, 248, 0.15)',
    subject: 'Your SkyTech Order Has Been Packed',
  },
  shipped: {
    emoji: '🚚',
    title: 'ORDER SHIPPED',
    message: 'Your order has been shipped and is on its way to you! Track your delivery using the tracking information provided below.',
    color: '#0EA5E9',
    bgColor: 'rgba(14, 165, 233, 0.15)',
    subject: 'Your Order Has Been Shipped',
  },
  out_for_delivery: {
    emoji: '🚛',
    title: 'OUT FOR DELIVERY',
    message: 'Your order is out for delivery and will reach you soon! Our courier partner will deliver it to your doorstep today.',
    color: '#F97316',
    bgColor: 'rgba(249, 115, 22, 0.15)',
    subject: 'Your Order Is Out For Delivery',
  },
  delivered: {
    emoji: '✅',
    title: 'ORDER DELIVERED',
    message: 'Your order has been successfully delivered! Thank you for shopping with SkyTech. We hope you love your purchase.',
    color: '#10B981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    subject: 'Your Order Has Been Delivered',
  },
  cancelled: {
    emoji: '❌',
    title: 'ORDER CANCELLED',
    message: 'Your order has been cancelled as per your request. If you had paid, the refund will be processed to your original payment method within 5-7 business days.',
    color: '#EF4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    subject: 'Your Order Has Been Cancelled',
  },
  cancellation_requested: {
    emoji: '⏳',
    title: 'CANCELLATION REQUESTED',
    message: 'Your cancellation request has been received and is being reviewed. You will be notified once it is processed.',
    color: '#F59E0B',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    subject: 'Cancellation Requested - SkyTech',
  },
  cancellation_rejected: {
    emoji: '❌',
    title: 'CANCELLATION REJECTED',
    message: 'Your cancellation request has been rejected. Your order will continue processing as normal.',
    color: '#EF4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    subject: 'Cancellation Rejected - SkyTech',
  },
};

// Progress timeline stages - must match OrderStatus values
const TIMELINE_STAGES: Array<{ key: OrderStatus; label: string }> = [
  { key: 'pending', label: 'Order Placed' },
  { key: 'confirmed', label: 'Order Confirmed' },
  { key: 'processing', label: 'Processing' },
  { key: 'packed', label: 'Packed' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' },
];

// Helper function to format currency
function formatCurrency(amount: number | undefined | null): string {
  if (amount === undefined || amount === null) return '₹0.00';
  return `₹${amount.toFixed(2)}`;
}

// Helper function to format date
function formatDate(dateValue: any): string {
  if (!dateValue) return 'N/A';
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

// Helper function to get current stage index based on order status
function getCurrentStageIndex(status: OrderStatus): number {
  const stageMap: Partial<Record<OrderStatus, number>> = {
    pending: 0,
    confirmed: 1,
    processing: 2,
    packed: 3,
    shipped: 4,
    out_for_delivery: 5,
    delivered: 6,
  };
  return stageMap[status] ?? 0;
}

// Helper function to generate progress timeline HTML
function generateProgressTimeline(status: OrderStatus): string {
  const currentIndex = getCurrentStageIndex(status);
  
  // For cancelled/cancellation statuses, show different timeline
  if (status === 'cancelled' || status === 'cancellation_requested' || status === 'cancellation_rejected') {
    const icon = status === 'cancelled' ? '✖' : status === 'cancellation_requested' ? '⏳' : '✖';
    const label = status === 'cancelled' ? 'Order Cancelled' : 
                  status === 'cancellation_requested' ? 'Cancellation Requested' : 'Cancellation Rejected';
    const color = status === 'cancelled' ? '#EF4444' : '#F59E0B';
    
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
            <span style="color: ${color}; font-size: 18px;">${icon}</span>
            <span style="color: #E2E8F0; font-size: 14px; font-weight: 600;">${label}</span>
          </div>
        </div>
      </div>
    `;
  }

  // For pending status, show minimal timeline
  if (status === 'pending') {
    return `
      <div style="background-color: #1A2235; border-radius: 12px; padding: 24px; margin: 24px 0; border: 1px solid rgba(0, 200, 255, 0.2);">
        <h3 style="margin: 0 0 16px; color: #00C8FF; font-size: 16px; font-weight: 600;">Order Progress</h3>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="color: #F59E0B; font-size: 18px;">⏳</span>
            <span style="color: #E2E8F0; font-size: 14px; font-weight: 600;">Order Pending - Awaiting Confirmation</span>
          </div>
        </div>
      </div>
    `;
  }

  // Normal progress timeline for confirmed/packed/shipped/delivered
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
    return `
      <div style="margin: 24px 0;">
        <h3 style="margin: 0 0 16px; color: #FFFFFF; font-size: 18px; font-weight: 600;">Order Items</h3>
        <p style="color: #94A3B8; font-size: 14px;">No items in this order.</p>
      </div>
    `;
  }

  const productCards = items.map(item => {
    const productImage = item.image || 'https://via.placeholder.com/80x80?text=Product';
    const productName = item.name || 'Product';
    const productCategory = item.category || '';
    const quantity = item.quantity || 1;
    const unitPrice = item.unitPrice || 0;
    const lineTotal = item.lineTotal || 0;

    return `
      <div style="display: table; width: 100%; padding: 16px; background-color: #1A2235; border-radius: 12px; margin-bottom: 12px; border: 1px solid rgba(0, 200, 255, 0.1);">
        <div style="display: table-cell; vertical-align: top; width: 80px; padding-right: 16px;">
          <img src="${productImage}" alt="${productName}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; background-color: #0B1220; display: block;">
        </div>
        <div style="display: table-cell; vertical-align: top;">
          <h4 style="margin: 0 0 4px; color: #FFFFFF; font-size: 16px; font-weight: 600; word-wrap: break-word; overflow-wrap: break-word;">${productName}</h4>
          ${productCategory ? `<p style="margin: 0 0 8px; color: #94A3B8; font-size: 13px;">${productCategory}</p>` : ''}
          <div style="display: table; width: 100%;">
            <div style="display: table-cell; vertical-align: middle;">
              <span style="color: #94A3B8; font-size: 13px;">Qty: ${quantity}</span>
            </div>
            <div style="display: table-cell; vertical-align: middle; text-align: right;">
              <span style="color: #00C8FF; font-size: 16px; font-weight: 600;">${formatCurrency(lineTotal)}</span>
            </div>
          </div>
          <div style="margin-top: 4px;">
            <span style="color: #64748B; font-size: 12px;">${formatCurrency(unitPrice)} each</span>
          </div>
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
  const subtotal = order.subtotal ?? 0;
  const gstAmount = order.gstAmount ?? 0;
  const gstPercentage = order.gstPercentage ?? 0;
  const shippingFee = order.shippingFee ?? 0;
  const deliveryCharge = order.deliveryCharge ?? 0;
  const discount = order.discount ?? 0;
  const walletUsed = order.walletUsed ?? 0;
  const total = order.total ?? 0;

  // Calculate CGST and SGST (half of GST each)
  const cgst = gstAmount / 2;
  const sgst = gstAmount / 2;

  // Calculate payable amount before wallet
  const payableBeforeWallet = subtotal + gstAmount + shippingFee + deliveryCharge - discount;
  
  // Calculate grand total: max(0, payable - wallet used)
  const grandTotal = Math.max(0, payableBeforeWallet - walletUsed);
  
  // Check if fully paid by wallet
  const isFullyPaidByWallet = walletUsed >= payableBeforeWallet;

  return `
    <div style="background-color: #1A2235; border-radius: 12px; padding: 24px; margin: 24px 0; border: 1px solid rgba(0, 200, 255, 0.2);">
      <h3 style="margin: 0 0 16px; color: #00C8FF; font-size: 16px; font-weight: 600;">Payment Summary</h3>
      
      <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
        <span style="color: #94A3B8; font-size: 14px;">Subtotal</span>
        <span style="color: #E2E8F0; font-size: 14px; font-weight: 600; text-align: right;">= ${formatCurrency(subtotal)}</span>
      </div>
      
      ${cgst > 0 ? `
      <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
        <span style="color: #94A3B8; font-size: 14px;">CGST (${gstPercentage / 2}%)</span>
        <span style="color: #E2E8F0; font-size: 14px; font-weight: 600; text-align: right;">= ${formatCurrency(cgst)}</span>
      </div>
      ` : ''}
      
      ${sgst > 0 ? `
      <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
        <span style="color: #94A3B8; font-size: 14px;">SGST (${gstPercentage / 2}%)</span>
        <span style="color: #E2E8F0; font-size: 14px; font-weight: 600; text-align: right;">= ${formatCurrency(sgst)}</span>
      </div>
      ` : ''}
      
      ${shippingFee > 0 ? `
      <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
        <span style="color: #94A3B8; font-size: 14px;">Shipping</span>
        <span style="color: #E2E8F0; font-size: 14px; font-weight: 600; text-align: right;">= ${formatCurrency(shippingFee)}</span>
      </div>
      ` : `
      <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
        <span style="color: #94A3B8; font-size: 14px;">Shipping</span>
        <span style="color: #10B981; font-size: 14px; font-weight: 600; text-align: right;">= FREE</span>
      </div>
      `}
      
      ${deliveryCharge > 0 ? `
      <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
        <span style="color: #94A3B8; font-size: 14px;">Delivery Charge</span>
        <span style="color: #E2E8F0; font-size: 14px; font-weight: 600; text-align: right;">= ${formatCurrency(deliveryCharge)}</span>
      </div>
      ` : ''}
      
      ${discount > 0 ? `
      <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
        <span style="color: #10B981; font-size: 14px;">Discount</span>
        <span style="color: #10B981; font-size: 14px; font-weight: 600; text-align: right;">= -${formatCurrency(discount)}</span>
      </div>
      ` : ''}
      
      ${walletUsed > 0 ? `
      <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
        <span style="color: #94A3B8; font-size: 14px;">Wallet Used</span>
        <span style="color: #E2E8F0; font-size: 14px; font-weight: 600; text-align: right;">= -${formatCurrency(walletUsed)}</span>
      </div>
      ` : ''}
      
      <div style="border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 16px; margin-top: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="color: #FFFFFF; font-size: 18px; font-weight: 700;">Grand Total</span>
          <span style="color: #00C8FF; font-size: 20px; font-weight: 700; text-align: right;">= ${formatCurrency(grandTotal)}</span>
        </div>
        ${isFullyPaidByWallet ? `
        <div style="margin-top: 8px; text-align: right;">
          <span style="color: #10B981; font-size: 14px; font-weight: 600;">✅ Fully Paid using Wallet</span>
        </div>
        ` : ''}
      </div>
    </div>
  `;
}

// Helper function to generate order summary card HTML
function generateOrderSummaryCard(order: Order, estimatedDelivery?: string): string {
  const orderNumber = order.orderNumber || 'N/A';
  const orderDate = formatDate(order.createdAt);
  const paymentStatus = order.payment?.status === 'captured' ? 'Paid' : 'Pending';
  const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.confirmed;

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
function generateCTAButtons(order: Order): string {
  const trackingUrl = 'https://theskytechnology.in/orders';
  const invoiceUrl = order.invoiceUrl;
  const websiteUrl = 'https://theskytechnology.in';
  const status = order.status;

  // For cancelled/cancellation statuses, show different buttons
  if (status === 'cancelled' || status === 'cancellation_requested' || status === 'cancellation_rejected') {
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
  estimatedDelivery?: string
): { html: string; subject: string } {
  // Use the actual order.status directly
  const status = order.status;
  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.confirmed;
  const customerName = order.customerName || 'Customer';
  const customerEmail = order.userEmail;

  const html = `
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
            ${generateOrderSummaryCard(order, estimatedDelivery)}

            <!-- Progress Timeline -->
            ${generateProgressTimeline(status)}

            <!-- Product Cards -->
            ${generateProductCards(order.items)}

            <!-- Payment Summary -->
            ${generatePaymentSummary(order)}

            <!-- CTA Buttons -->
            ${generateCTAButtons(order)}

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

  return {
    html,
    subject: statusConfig.subject,
  };
}
