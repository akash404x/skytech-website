import jsPDF from 'jspdf';
import { toDate } from '@/lib/format';
import type { PaymentReceipt, Order, OrderItem } from '@/lib/types';

export function generatePaymentReceiptPDF(receipt: PaymentReceipt, order: Order): jsPDF {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  let yPosition = margin;

  // Helper function to add text
  const addText = (text: string, x: number, y: number, fontSize: number = 10, isBold: boolean = false, color: string = '#000000') => {
    pdf.setFontSize(fontSize);
    pdf.setFont(isBold ? 'helvetica' : 'helvetica', isBold ? 'bold' : 'normal');
    pdf.setTextColor(color);
    pdf.text(text, x, y);
  };

  // Helper function to add right-aligned text
  const addRightText = (text: string, x: number, y: number, fontSize: number = 10, isBold: boolean = false, color: string = '#000000') => {
    pdf.setFontSize(fontSize);
    pdf.setFont(isBold ? 'helvetica' : 'helvetica', isBold ? 'bold' : 'normal');
    pdf.setTextColor(color);
    const textWidth = pdf.getTextWidth(text);
    pdf.text(text, x - textWidth, y);
  };

  // Helper function to add line
  const addLine = (y: number) => {
    pdf.setDrawColor('#E5E7EB');
    pdf.setLineWidth(0.3);
    pdf.line(margin, y, pageWidth - margin, y);
  };

  // Header - Sky Tech Logo and Title
  pdf.setFillColor('#0EA5FF');
  pdf.rect(margin, yPosition, pageWidth - 2 * margin, 30, 'F');
  
  yPosition += 10;
  addText('Sky Tech', margin + 10, yPosition, 18, true, '#FFFFFF');
  yPosition += 8;
  addText('Payment Receipt', margin + 10, yPosition, 12, true, '#FFFFFF');
  yPosition += 8;
  addText('Building The Future Through Technology', margin + 10, yPosition, 8, false, '#FFFFFF');
  
  yPosition += 15;

  // Receipt Number and Date
  addText(`Receipt Number: ${receipt.receiptNumber}`, margin, yPosition, 10, true);
  addText(`Date: ${toDate(receipt.paymentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, pageWidth - margin - 60, yPosition, 10);
  yPosition += 8;
  addText(`Order Number: ${receipt.orderNumber}`, margin, yPosition, 10);
  yPosition += 8;
  addText(`Transaction ID: ${receipt.transactionId}`, margin, yPosition, 10);
  yPosition += 8;
  addText(`Payment ID: ${receipt.paymentId}`, margin, yPosition, 10);
  
  yPosition += 10;
  addLine(yPosition);
  yPosition += 10;

  // Customer Information
  addText('Customer Information', margin, yPosition, 12, true, '#0EA5FF');
  yPosition += 8;
  addText(`Name: ${receipt.customerName}`, margin, yPosition, 10);
  yPosition += 6;
  addText(`Email: ${receipt.userEmail}`, margin, yPosition, 10);
  yPosition += 6;
  addText(`Phone: ${receipt.customerPhone || 'N/A'}`, margin, yPosition, 10);
  
  yPosition += 10;

  // Billing Address
  addText('Billing Address', margin, yPosition, 10, true);
  yPosition += 6;
  addText(receipt.billingAddress.fullName, margin, yPosition, 9);
  yPosition += 5;
  addText(receipt.billingAddress.line1, margin, yPosition, 9);
  if (receipt.billingAddress.line2) {
    yPosition += 5;
    addText(receipt.billingAddress.line2, margin, yPosition, 9);
  }
  yPosition += 5;
  addText(`${receipt.billingAddress.city}, ${receipt.billingAddress.state} - ${receipt.billingAddress.postalCode}`, margin, yPosition, 9);
  yPosition += 5;
  addText(receipt.billingAddress.country, margin, yPosition, 9);
  
  yPosition += 10;

  // Shipping Address
  addText('Shipping Address', margin, yPosition, 10, true);
  yPosition += 6;
  addText(receipt.shippingAddress.fullName, margin, yPosition, 9);
  yPosition += 5;
  addText(receipt.shippingAddress.line1, margin, yPosition, 9);
  if (receipt.shippingAddress.line2) {
    yPosition += 5;
    addText(receipt.shippingAddress.line2, margin, yPosition, 9);
  }
  yPosition += 5;
  addText(`${receipt.shippingAddress.city}, ${receipt.shippingAddress.state} - ${receipt.shippingAddress.postalCode}`, margin, yPosition, 9);
  yPosition += 5;
  addText(receipt.shippingAddress.country, margin, yPosition, 9);
  
  yPosition += 10;
  addLine(yPosition);
  yPosition += 10;

  // Payment Details
  addText('Payment Details', margin, yPosition, 12, true, '#0EA5FF');
  yPosition += 8;
  addText(`Payment Method: ${receipt.paymentMethod}`, margin, yPosition, 10);
  yPosition += 6;
  addText(`Payment Date & Time: ${toDate(receipt.paymentDate).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`, margin, yPosition, 10);
  yPosition += 6;
  addText(`Payment Status: ${(receipt.status || 'paid').toUpperCase()}`, margin, yPosition, 10, true, '#10B981');
  
  yPosition += 10;
  addLine(yPosition);
  yPosition += 10;

  // Order Items
  addText('Order Items', margin, yPosition, 12, true, '#0EA5FF');
  yPosition += 8;

  // Table Header
  pdf.setFillColor('#F3F4F6');
  pdf.rect(margin, yPosition, pageWidth - 2 * margin, 8, 'F');
  addText('Item', margin + 2, yPosition + 6, 9, true);
  addText('Qty', margin + 80, yPosition + 6, 9, true);
  addText('Price', margin + 100, yPosition + 6, 9, true);
  addRightText('Total', pageWidth - margin, yPosition + 6, 9, true);
  yPosition += 12;

  // Table Rows
  order.items.forEach((item) => {
    addText(item.name, margin + 2, yPosition, 9);
    addText(item.quantity.toString(), margin + 80, yPosition, 9);
    addText(`₹${item.unitPrice.toFixed(2)}`, margin + 100, yPosition, 9);
    addRightText(`₹${item.lineTotal.toFixed(2)}`, pageWidth - margin, yPosition, 9);
    yPosition += 7;
  });

  yPosition += 5;
  addLine(yPosition);
  yPosition += 10;

  // Amount Summary
  addText('Amount Summary', margin, yPosition, 12, true, '#0EA5FF');
  yPosition += 8;
  addRightText(`Subtotal: ₹${order.subtotal.toFixed(2)}`, pageWidth - margin, yPosition, 10);
  yPosition += 6;
  if (order.gstAmount) {
    addRightText(`GST (${order.gstPercentage}%): ₹${order.gstAmount.toFixed(2)}`, pageWidth - margin, yPosition, 10);
    yPosition += 6;
  }
  if (order.shippingFee) {
    addRightText(`Shipping: ₹${order.shippingFee.toFixed(2)}`, pageWidth - margin, yPosition, 10);
    yPosition += 6;
  }
  if (order.deliveryCharge) {
    addRightText(`Delivery Charge: ₹${order.deliveryCharge.toFixed(2)}`, pageWidth - margin, yPosition, 10);
    yPosition += 6;
  }
  if (order.discount) {
    addRightText(`Discount: -₹${order.discount.toFixed(2)}`, pageWidth - margin, yPosition, 10, false, '#10B981');
    yPosition += 6;
  }
  if (order.walletUsed) {
    addRightText(`Wallet Used: -₹${order.walletUsed.toFixed(2)}`, pageWidth - margin, yPosition, 10, false, '#10B981');
    yPosition += 6;
  }
  
  yPosition += 5;
  addLine(yPosition);
  yPosition += 8;
  addRightText(`Grand Total: ₹${receipt.grandTotal.toFixed(2)}`, pageWidth - margin, yPosition, 14, true, '#0EA5FF');
  
  yPosition += 15;
  addLine(yPosition);
  yPosition += 10;

  // Disclaimer
  pdf.setFillColor('#FEF3C7');
  pdf.rect(margin, yPosition, pageWidth - 2 * margin, 20, 'F');
  yPosition += 8;
  addText('⚠️ This is a Payment Receipt, not a Tax Invoice.', margin + 5, yPosition, 10, true, '#92400E');
  yPosition += 5;
  addText('This document confirms that payment has been received.', margin + 5, yPosition, 9, false, '#92400E');
  yPosition += 5;
  addText('Your Tax Invoice will be generated after your order is confirmed by our team.', margin + 5, yPosition, 9, false, '#92400E');
  
  yPosition += 15;

  // Authorized Signature
  addText('Authorized Signature', pageWidth - margin - 50, yPosition, 10, true);
  yPosition += 15;
  pdf.line(pageWidth - margin - 50, yPosition, pageWidth - margin, yPosition);
  
  yPosition += 15;
  addLine(yPosition);
  yPosition += 10;

  // Footer
  addText('Thank you for your payment!', margin, yPosition, 12, true, '#0EA5FF');
  yPosition += 8;
  addText('For any queries, contact us at:', margin, yPosition, 10);
  yPosition += 6;
  addText('Email: contact@theskytechnology.in', margin, yPosition, 10, false, '#0EA5FF');
  yPosition += 6;
  addText('Phone: +91 8429372020', margin, yPosition, 10, false, '#0EA5FF');
  yPosition += 6;
  addText('Website: theskytechnology.in', margin, yPosition, 10, false, '#0EA5FF');
  
  yPosition += 15;
  addText(`Generated on: ${new Date().toLocaleString('en-IN')}`, margin, yPosition, 8, false, '#9CA3AF');

  return pdf;
}

export function downloadPaymentReceiptPDF(receipt: PaymentReceipt, order: Order): void {
  const pdf = generatePaymentReceiptPDF(receipt, order);
  pdf.save(`Payment_Receipt_${receipt.receiptNumber}.pdf`);
}
