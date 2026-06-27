import { generateSkyTechEmailTemplate, SkyTechEmailData } from '@/lib/skytech-email-template';
import { toDate } from '@/lib/format';
import type { Invoice, Order } from '@/lib/types';

export function generateOrderConfirmedEmailTemplate(invoice: Invoice, order: Order): string {
  const itemsList = invoice.items.map(item => 
    `<li style="margin-bottom: 8px; padding: 12px; background: #F8FBFF; border-radius: 8px; border: 1px solid #DCEEFF;">
      <div style="font-weight: 600; color: #1F2937; margin-bottom: 4px;">${item.name}</div>
      <div style="font-size: 14px; color: #64748B;">Qty: ${item.quantity} × ₹${item.unitPrice.toFixed(2)} = ₹${item.lineTotal.toFixed(2)}</div>
    </li>`
  ).join('');

  const content = `
    <div style="background: linear-gradient(135deg, #0EA5FF 0%, #2563EB 100%); padding: 30px; border-radius: 12px; margin-bottom: 30px; text-align: center;">
      <h2 style="color: white; font-size: 28px; font-weight: bold; margin: 0 0 10px 0;">Order Confirmed!</h2>
      <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 0;">Your order has been confirmed and your Tax Invoice has been generated.</p>
    </div>

    <div style="background: #F8FBFF; border: 1px solid #DCEEFF; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
      <h3 style="color: #1F2937; font-size: 18px; font-weight: bold; margin: 0 0 16px 0; border-bottom: 2px solid #0EA5FF; padding-bottom: 8px;">Invoice Details</h3>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
        <div>
          <p style="color: #64748B; font-size: 14px; margin: 0 0 4px 0;">Invoice Number</p>
          <p style="color: #1F2937; font-weight: 600; font-size: 16px; margin: 0;">${invoice.invoiceNumber}</p>
        </div>
        <div>
          <p style="color: #64748B; font-size: 14px; margin: 0 0 4px 0;">Order Number</p>
          <p style="color: #1F2937; font-weight: 600; font-size: 16px; margin: 0;">${invoice.orderNumber}</p>
        </div>
        <div>
          <p style="color: #64748B; font-size: 14px; margin: 0 0 4px 0;">Invoice Date</p>
          <p style="color: #1F2937; font-weight: 600; font-size: 16px; margin: 0;">${toDate(invoice.invoiceDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
        </div>
        <div>
          <p style="color: #64748B; font-size: 14px; margin: 0 0 4px 0;">Order Status</p>
          <p style="color: #10B981; font-weight: 600; font-size: 16px; margin: 0;">Confirmed</p>
        </div>
      </div>
    </div>

    <div style="background: #F8FBFF; border: 1px solid #DCEEFF; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
      <h3 style="color: #1F2937; font-size: 18px; font-weight: bold; margin: 0 0 16px 0; border-bottom: 2px solid #0EA5FF; padding-bottom: 8px;">Invoice Items</h3>
      <ul style="list-style: none; padding: 0; margin: 0;">
        ${itemsList}
      </ul>
    </div>

    <div style="background: #F8FBFF; border: 1px solid #DCEEFF; border-radius: 12px; padding: 24px;">
      <h3 style="color: #1F2937; font-size: 18px; font-weight: bold; margin: 0 0 16px 0; border-bottom: 2px solid #0EA5FF; padding-bottom: 8px;">Invoice Summary</h3>
      
      <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
        <span style="color: #64748B;">Subtotal</span>
        <span style="color: #1F2937; font-weight: 600;">₹${invoice.subtotal.toFixed(2)}</span>
      </div>
      ${invoice.gstAmount ? `
      <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
        <span style="color: #64748B;">GST (${invoice.gstPercentage}%)</span>
        <span style="color: #1F2937; font-weight: 600;">₹${invoice.gstAmount.toFixed(2)}</span>
      </div>
      ` : ''}
      ${invoice.shippingFee ? `
      <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
        <span style="color: #64748B;">Shipping</span>
        <span style="color: #1F2937; font-weight: 600;">₹${invoice.shippingFee.toFixed(2)}</span>
      </div>
      ` : ''}
      ${invoice.deliveryCharge ? `
      <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
        <span style="color: #64748B;">Delivery Charge</span>
        <span style="color: #1F2937; font-weight: 600;">₹${invoice.deliveryCharge.toFixed(2)}</span>
      </div>
      ` : ''}
      ${invoice.discount ? `
      <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
        <span style="color: #10B981;">Discount</span>
        <span style="color: #10B981; font-weight: 600;">-₹${invoice.discount.toFixed(2)}</span>
      </div>
      ` : ''}
      
      <div style="border-top: 2px solid #0EA5FF; padding-top: 16px; margin-top: 16px;">
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #1F2937; font-size: 18px; font-weight: bold;">Invoice Total</span>
          <span style="color: #0EA5FF; font-size: 20px; font-weight: bold;">₹${invoice.total.toFixed(2)}</span>
        </div>
      </div>
    </div>

    <div style="text-align: center; margin-top: 30px;">
      <p style="color: #64748B; font-size: 14px; margin: 0 0 8px 0;">You can view and download your Tax Invoice from your Orders page.</p>
      <a href="https://theskytechnology.in/orders" style="display: inline-block; background: linear-gradient(135deg, #0EA5FF 0%, #2563EB 100%); color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">View Your Orders</a>
    </div>
  `;

  const templateData: SkyTechEmailData = {
    subject: `Order Confirmed - Invoice #${invoice.invoiceNumber}`,
    recipientName: invoice.customerName,
    recipientEmail: invoice.userEmail,
    content,
    heroTitle: 'Order Confirmed',
    heroSubtitle: `Invoice #${invoice.invoiceNumber}`,
    heroDescription: `Your order ${invoice.orderNumber} has been confirmed. Your Tax Invoice is now available.`,
    ctaButton: {
      text: 'View Your Orders',
      url: 'https://theskytechnology.in/orders',
    },
  };

  return generateSkyTechEmailTemplate(templateData);
}
