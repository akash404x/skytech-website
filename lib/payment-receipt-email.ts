import { generateSkyTechEmailTemplate, SkyTechEmailData } from '@/lib/skytech-email-template';
import type { PaymentReceipt, OrderItem } from '@/lib/types';

export function generatePaymentReceiptEmailTemplate(receipt: PaymentReceipt, items: OrderItem[]): string {
  const itemsList = items.map(item => 
    `<li style="margin-bottom: 8px; padding: 12px; background: #F8FBFF; border-radius: 8px; border: 1px solid #DCEEFF;">
      <div style="font-weight: 600; color: #1F2937; margin-bottom: 4px;">${item.name}</div>
      <div style="font-size: 14px; color: #64748B;">Qty: ${item.quantity} × ₹${item.unitPrice.toFixed(2)} = ₹${item.lineTotal.toFixed(2)}</div>
    </li>`
  ).join('');

  const content = `
    <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 30px; border-radius: 12px; margin-bottom: 30px; text-align: center;">
      <h2 style="color: white; font-size: 28px; font-weight: bold; margin: 0 0 10px 0;">Payment Successful!</h2>
      <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 0;">Your payment has been received and your order has been placed.</p>
    </div>

    <div style="background: #F8FBFF; border: 1px solid #DCEEFF; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
      <h3 style="color: #1F2937; font-size: 18px; font-weight: bold; margin: 0 0 16px 0; border-bottom: 2px solid #0EA5FF; padding-bottom: 8px;">Payment Receipt Details</h3>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
        <div>
          <p style="color: #64748B; font-size: 14px; margin: 0 0 4px 0;">Receipt Number</p>
          <p style="color: #1F2937; font-weight: 600; font-size: 16px; margin: 0;">${receipt.receiptNumber}</p>
        </div>
        <div>
          <p style="color: #64748B; font-size: 14px; margin: 0 0 4px 0;">Order Number</p>
          <p style="color: #1F2937; font-weight: 600; font-size: 16px; margin: 0;">${receipt.orderNumber}</p>
        </div>
        <div>
          <p style="color: #64748B; font-size: 14px; margin: 0 0 4px 0;">Payment ID</p>
          <p style="color: #1F2937; font-weight: 600; font-size: 16px; margin: 0;">${receipt.paymentId}</p>
        </div>
        <div>
          <p style="color: #64748B; font-size: 14px; margin: 0 0 4px 0;">Payment Method</p>
          <p style="color: #1F2937; font-weight: 600; font-size: 16px; margin: 0;">${receipt.paymentMethod}</p>
        </div>
      </div>

      <div style="background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 12px; border-radius: 4px; margin-bottom: 20px;">
        <p style="color: #92400E; font-size: 14px; font-weight: 600; margin: 0 0 4px 0;">⚠️ Important Notice</p>
        <p style="color: #92400E; font-size: 14px; margin: 0;">This is a Payment Receipt, not a Tax Invoice. Your Tax Invoice will be generated after your order is confirmed by our team.</p>
      </div>
    </div>

    <div style="background: #F8FBFF; border: 1px solid #DCEEFF; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
      <h3 style="color: #1F2937; font-size: 18px; font-weight: bold; margin: 0 0 16px 0; border-bottom: 2px solid #0EA5FF; padding-bottom: 8px;">Order Items</h3>
      <ul style="list-style: none; padding: 0; margin: 0;">
        ${itemsList}
      </ul>
    </div>

    <div style="background: #F8FBFF; border: 1px solid #DCEEFF; border-radius: 12px; padding: 24px;">
      <h3 style="color: #1F2937; font-size: 18px; font-weight: bold; margin: 0 0 16px 0; border-bottom: 2px solid #0EA5FF; padding-bottom: 8px;">Payment Summary</h3>
      
      <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
        <span style="color: #64748B;">Subtotal</span>
        <span style="color: #1F2937; font-weight: 600;">₹${order.subtotal.toFixed(2)}</span>
      </div>
      ${order.gstAmount ? `
      <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
        <span style="color: #64748B;">GST (${order.gstPercentage}%)</span>
        <span style="color: #1F2937; font-weight: 600;">₹${order.gstAmount.toFixed(2)}</span>
      </div>
      ` : ''}
      ${order.shippingFee ? `
      <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
        <span style="color: #64748B;">Shipping</span>
        <span style="color: #1F2937; font-weight: 600;">₹${order.shippingFee.toFixed(2)}</span>
      </div>
      ` : ''}
      ${order.deliveryCharge ? `
      <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
        <span style="color: #64748B;">Delivery Charge</span>
        <span style="color: #1F2937; font-weight: 600;">₹${order.deliveryCharge.toFixed(2)}</span>
      </div>
      ` : ''}
      ${order.discount ? `
      <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
        <span style="color: #10B981;">Discount</span>
        <span style="color: #10B981; font-weight: 600;">-₹${order.discount.toFixed(2)}</span>
      </div>
      ` : ''}
      ${order.walletUsed ? `
      <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
        <span style="color: #10B981;">Wallet Used</span>
        <span style="color: #10B981; font-weight: 600;">-₹${order.walletUsed.toFixed(2)}</span>
      </div>
      ` : ''}
      
      <div style="border-top: 2px solid #0EA5FF; padding-top: 16px; margin-top: 16px;">
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #1F2937; font-size: 18px; font-weight: bold;">Total Paid</span>
          <span style="color: #0EA5FF; font-size: 20px; font-weight: bold;">₹${receipt.grandTotal.toFixed(2)}</span>
        </div>
      </div>
    </div>

    <div style="text-align: center; margin-top: 30px;">
      <p style="color: #64748B; font-size: 14px; margin: 0 0 8px 0;">You can view and download your payment receipt from your Orders page.</p>
      <a href="https://theskytechnology.in/orders" style="display: inline-block; background: linear-gradient(135deg, #0EA5FF 0%, #2563EB 100%); color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">View Your Orders</a>
    </div>
  `;

  const templateData: SkyTechEmailData = {
    subject: `Payment Receipt - ${receipt.receiptNumber}`,
    recipientName: receipt.customerName,
    recipientEmail: receipt.userEmail,
    content,
    heroTitle: 'Payment Receipt',
    heroSubtitle: `Receipt #${receipt.receiptNumber}`,
    heroDescription: `Thank you for your payment. Your order ${receipt.orderNumber} has been placed successfully.`,
    ctaButton: {
      text: 'View Your Orders',
      url: 'https://theskytechnology.in/orders',
    },
  };

  return generateSkyTechEmailTemplate(templateData);
}
