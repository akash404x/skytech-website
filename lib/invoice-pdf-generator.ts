import jsPDF from 'jspdf';
import type { Invoice, Order } from '@/lib/types';

export function generateInvoicePDF(invoice: Invoice, order: Order): jsPDF {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  let yPosition = margin;

  // Helper function to convert DateValue to Date
  const toDate = (dateValue: any): Date => {
    if (!dateValue) return new Date();
    if (dateValue instanceof Date) return dateValue;
    if (typeof dateValue === 'string' || typeof dateValue === 'number') return new Date(dateValue);
    if (dateValue.toDate) return dateValue.toDate();
    if (dateValue.seconds) return new Date(dateValue.seconds * 1000);
    return new Date();
  };

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
  addText('Tax Invoice', margin + 10, yPosition, 12, true, '#FFFFFF');
  yPosition += 8;
  addText('Building The Future Through Technology', margin + 10, yPosition, 8, false, '#FFFFFF');
  
  yPosition += 15;

  // Invoice Number and Date
  addText(`Invoice Number: ${invoice.invoiceNumber}`, margin, yPosition, 10, true);
  addText(`Invoice Date: ${toDate(invoice.invoiceDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, pageWidth - margin - 60, yPosition, 10);
  yPosition += 8;
  addText(`Order Number: ${invoice.orderNumber}`, margin, yPosition, 10);
  if (invoice.dueDate) {
    addText(`Due Date: ${toDate(invoice.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, pageWidth - margin - 60, yPosition, 10);
  }
  
  yPosition += 10;
  addLine(yPosition);
  yPosition += 10;

  // Customer Information
  addText('Bill To', margin, yPosition, 12, true, '#0EA5FF');
  yPosition += 8;
  addText(`Name: ${invoice.customerName}`, margin, yPosition, 10);
  yPosition += 6;
  addText(`Email: ${invoice.userEmail}`, margin, yPosition, 10);
  yPosition += 6;
  addText(`Phone: ${invoice.customerPhone || 'N/A'}`, margin, yPosition, 10);
  
  yPosition += 10;

  // Billing Address
  addText('Billing Address', margin, yPosition, 10, true);
  yPosition += 6;
  addText(invoice.billingAddress.fullName, margin, yPosition, 9);
  yPosition += 5;
  addText(invoice.billingAddress.line1, margin, yPosition, 9);
  if (invoice.billingAddress.line2) {
    yPosition += 5;
    addText(invoice.billingAddress.line2, margin, yPosition, 9);
  }
  yPosition += 5;
  addText(`${invoice.billingAddress.city}, ${invoice.billingAddress.state} - ${invoice.billingAddress.postalCode}`, margin, yPosition, 9);
  yPosition += 5;
  addText(invoice.billingAddress.country, margin, yPosition, 9);
  
  yPosition += 10;

  // Shipping Address
  addText('Ship To', margin, yPosition, 10, true);
  yPosition += 6;
  addText(invoice.shippingAddress.fullName, margin, yPosition, 9);
  yPosition += 5;
  addText(invoice.shippingAddress.line1, margin, yPosition, 9);
  if (invoice.shippingAddress.line2) {
    yPosition += 5;
    addText(invoice.shippingAddress.line2, margin, yPosition, 9);
  }
  yPosition += 5;
  addText(`${invoice.shippingAddress.city}, ${invoice.shippingAddress.state} - ${invoice.shippingAddress.postalCode}`, margin, yPosition, 9);
  yPosition += 5;
  addText(invoice.shippingAddress.country, margin, yPosition, 9);
  
  yPosition += 10;
  addLine(yPosition);
  yPosition += 10;

  // Order Items
  addText('Invoice Items', margin, yPosition, 12, true, '#0EA5FF');
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
  invoice.items.forEach((item) => {
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
  addText('Invoice Summary', margin, yPosition, 12, true, '#0EA5FF');
  yPosition += 8;
  addRightText(`Subtotal: ₹${invoice.subtotal.toFixed(2)}`, pageWidth - margin, yPosition, 10);
  yPosition += 6;
  if (invoice.gstAmount) {
    addRightText(`GST (${invoice.gstPercentage}%): ₹${invoice.gstAmount.toFixed(2)}`, pageWidth - margin, yPosition, 10);
    yPosition += 6;
  }
  if (invoice.shippingFee) {
    addRightText(`Shipping: ₹${invoice.shippingFee.toFixed(2)}`, pageWidth - margin, yPosition, 10);
    yPosition += 6;
  }
  if (invoice.deliveryCharge) {
    addRightText(`Delivery Charge: ₹${invoice.deliveryCharge.toFixed(2)}`, pageWidth - margin, yPosition, 10);
    yPosition += 6;
  }
  if (invoice.discount) {
    addRightText(`Discount: -₹${invoice.discount.toFixed(2)}`, pageWidth - margin, yPosition, 10, false, '#10B981');
    yPosition += 6;
  }
  
  yPosition += 5;
  addLine(yPosition);
  yPosition += 8;
  addRightText(`Invoice Total: ₹${invoice.total.toFixed(2)}`, pageWidth - margin, yPosition, 14, true, '#0EA5FF');
  
  yPosition += 15;
  addLine(yPosition);
  yPosition += 10;

  // GST Information
  if (invoice.gstAmount) {
    addText('GST Information', margin, yPosition, 12, true, '#0EA5FF');
    yPosition += 8;
    addText(`GSTIN: Not Available (Small Business)`, margin, yPosition, 10);
    addRightText(`GST Rate: ${invoice.gstPercentage}%`, pageWidth - margin, yPosition, 10);
    yPosition += 6;
    addRightText(`GST Amount: ₹${invoice.gstAmount.toFixed(2)}`, pageWidth - margin, yPosition, 10);
    
    yPosition += 15;
    addLine(yPosition);
    yPosition += 10;
  }

  // Authorized Signature
  addText('Authorized Signature', pageWidth - margin - 50, yPosition, 10, true);
  yPosition += 15;
  pdf.line(pageWidth - margin - 50, yPosition, pageWidth - margin, yPosition);
  
  yPosition += 15;
  addLine(yPosition);
  yPosition += 10;

  // Footer
  addText('Thank you for your business!', margin, yPosition, 12, true, '#0EA5FF');
  yPosition += 8;
  addText('For any queries, contact us at:', margin, yPosition, 10);
  yPosition += 6;
  addText('Email: contact@theskytechnology.in', margin, yPosition, 10, false, '#0EA5FF');
  yPosition += 6;
  addText('Phone: +91 5334357055', margin, yPosition, 10, false, '#0EA5FF');
  yPosition += 6;
  addText('Website: theskytechnology.in', margin, yPosition, 10, false, '#0EA5FF');
  
  yPosition += 15;
  addText(`Generated on: ${new Date().toLocaleString('en-IN')}`, margin, yPosition, 8, false, '#9CA3AF');

  return pdf;
}

export function downloadInvoicePDF(invoice: Invoice, order: Order): void {
  const pdf = generateInvoicePDF(invoice, order);
  pdf.save(`Invoice_${invoice.invoiceNumber}.pdf`);
}
