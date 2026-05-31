# Sky Tech Invoice System - Integration Guide

## Overview

A professional, production-ready invoice system for the Sky Tech e-commerce platform with:
- Modern dark blue theme matching Sky Tech branding
- Print-optimized A4 layout
- Client-side PDF generation using html2canvas + jsPDF
- Support for discount, GST, shipping charges
- Mobile responsive
- Reusable components

## Components

### 1. InvoiceTemplate
**File:** `components/invoice/InvoiceTemplate.tsx`

Base invoice template component that renders the invoice layout.

```typescript
import InvoiceTemplate from '@/components/invoice/InvoiceTemplate';
import type { Order } from '@/lib/types';

// Usage
<InvoiceTemplate order={orderData} />
```

**Props:**
- `order: Order` - Order data from Firestore

## 2. InvoiceViewer
**File:** `components/invoice/InvoiceViewer.tsx`

Complete invoice viewer with download and print buttons.

```typescript
import InvoiceViewer from '@/components/invoice/InvoiceViewer';
import type { Order } from '@/lib/types';

export default function MyPage() {
  return (
    <InvoiceViewer 
      order={orderData} 
      showActions={true}
      className="my-custom-class"
    />
  );
}
```

**Props:**
- `order: Order` - Order data
- `showActions?: boolean` - Show download/print buttons (default: true)
- `className?: string` - Custom CSS classes

**Features:**
- Download PDF button with loading state
- Print button
- Error handling with user-friendly messages

### 3. InvoiceDownloadButton
**File:** `components/invoice/InvoiceDownloadButton.tsx`

Standalone button component to link to invoice preview.

```typescript
import InvoiceDownloadButton from '@/components/invoice/InvoiceDownloadButton';

// Basic usage
<InvoiceDownloadButton orderNumber="SKY-ORD-20260101-1234" />

// Custom styling
<InvoiceDownloadButton
  orderNumber="SKY-ORD-20260101-1234"
  variant="primary"
  size="lg"
  text="Download Invoice"
  showIcon={true}
/>
```

**Props:**
- `orderNumber: string` (required) - Order number to fetch
- `invoiceNumber?: string` - Invoice number (for reference)
- `orderId?: string` - Order ID (for reference)
- `variant?: 'primary' | 'secondary' | 'text'` - Button style (default: 'secondary')
- `size?: 'sm' | 'md' | 'lg'` - Button size (default: 'md')
- `showIcon?: boolean` - Show icon (default: true)
- `text?: string` - Button text (default: 'View Invoice')

## 4. Invoice Preview Page
**File:** `app/invoice-preview/[orderNumber]/page.tsx`

Standalone page for viewing invoices with full functionality.

**Route:** `/invoice-preview/[orderNumber]`

**Access:** 
- Customer Orders Page: Link from order details
- Admin Panel: Link from order details
- Direct URL: `/invoice-preview/SKY-ORD-20260101-1234`

## 5. API Route
**File:** `app/api/invoices/download/route.ts`

Fetches order data and generates invoice numbers.

**Endpoint:** `GET /api/invoices/download`

**Query Parameters:**
- `orderNumber` (preferred) - Order number (e.g., "SKY-ORD-20260101-1234")
- `orderId` - Document ID (fallback)

**Response:**
```json
{
  "success": true,
  "order": {
    "id": "doc-id",
    "orderNumber": "SKY-ORD-20260101-1234",
    "invoiceNumber": "SKY-INV-20260101-5678",
    "customerName": "John Doe",
    "items": [...],
    "total": 15999.50,
    ...
  }
}
```

## Utility Functions

### PDF Generation
**File:** `lib/pdf-utils.ts`

#### downloadPDFFromHTML
```typescript
import { downloadPDFFromHTML } from '@/lib/pdf-utils';

const handleDownloadPDF = async () => {
  try {
    await downloadPDFFromHTML('invoice-template', {
      filename: `Invoice-${order.orderNumber}`,
      invoiceNumber: order.invoiceNumber || 'Draft',
      scale: 2,
      quality: 0.95,
    });
  } catch (error) {
    console.error('Download failed:', error);
  }
};
```

#### printHTML
```typescript
import { printHTML } from '@/lib/pdf-utils';

const handlePrint = () => {
  try {
    printHTML('invoice-template');
  } catch (error) {
    console.error('Print failed:', error);
  }
};
```

## Integration Examples

### 1. In Orders Page (Customer)
**File:** `app/orders/page.tsx`

```typescript
import InvoiceDownloadButton from '@/components/invoice/InvoiceDownloadButton';

export default function OrdersPage() {
  return (
    <div>
      {orders.map((order) => (
        <div key={order.id} className="order-card">
          <h3>{order.orderNumber}</h3>
          <p>Total: ₹{order.total.toFixed(2)}</p>
          
          {/* Add invoice button */}
          <InvoiceDownloadButton
            orderNumber={order.orderNumber}
            variant="secondary"
            text="View Invoice"
          />
        </div>
      ))}
    </div>
  );
}
```

### 2. In Admin Orders Table
**File:** `app/admin/orders/page.tsx`

```typescript
import InvoiceDownloadButton from '@/components/invoice/InvoiceDownloadButton';

export default function AdminOrdersPage() {
  return (
    <table>
      <tbody>
        {orders.map((order) => (
          <tr key={order.id}>
            <td>{order.orderNumber}</td>
            <td>{order.customerName}</td>
            <td>{order.total}</td>
            <td>
              <InvoiceDownloadButton
                orderNumber={order.orderNumber}
                variant="primary"
                size="sm"
                text="Invoice"
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### 3. Invoice Preview in Modal
**File:** `components/OrderDetailsModal.tsx`

```typescript
'use client';

import { useState } from 'react';
import InvoiceViewer from '@/components/invoice/InvoiceViewer';
import type { Order } from '@/lib/types';

interface OrderDetailsModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderDetailsModal({
  order,
  isOpen,
  onClose,
}: OrderDetailsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-gray-100 p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Invoice - {order.orderNumber}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-4">
          <InvoiceViewer
            order={order}
            showActions={true}
          />
        </div>
      </div>
    </div>
  );
}
```

### 4. Email Invoice Link
**File:** `lib/email-service.ts`

```typescript
// When sending order confirmation email
const invoiceLink = `${process.env.NEXT_PUBLIC_BASE_URL}/invoice-preview/${order.orderNumber}`;

const emailBody = `
  <p>Thank you for your order!</p>
  <p>Order Number: ${order.orderNumber}</p>
  <p>
    <a href="${invoiceLink}">
      Download Your Invoice
    </a>
  </p>
`;
```

## Design Features

### Color Scheme
- **Background:** White (#FFFFFF)
- **Text:** Dark Navy (#0F172A)
- **Accents:** Sky Blue (#38BDF8)
- **Secondary Accent:** Light Navy (#1E293B)
- **Borders:** Light Gray (#E5E7EB)
- **Secondary Text:** Gray (#6B7280)

### Layout
- **Paper Size:** A4 (210mm × 297mm)
- **Margins:** 10mm on all sides
- **Font:** System default (suitable for all platforms)
- **Print Optimized:** Works perfectly with browser print dialog

### Sections
1. **Header** - Company logo, invoice title, invoice/order numbers
2. **Bill To & Ship To** - Customer details in two columns
3. **Order Summary** - 4-card grid with key information
4. **Items Table** - Product details with pricing
5. **Pricing Summary** - Subtotal, taxes, discounts, grand total
6. **Notes** - Thank you message
7. **Footer** - Payment status and authorization

## Database Integration

### Order Structure
Ensure your Order document includes:

```typescript
{
  orderNumber: "SKY-ORD-20260101-1234",
  invoiceNumber?: "SKY-INV-20260101-5678", // Generated on first access
  invoiceGeneratedAt?: Timestamp,
  customerName: "John Doe",
  userEmail: "john@example.com",
  customerPhone?: "+91-9876543210",
  items: [
    {
      name: "Product Name",
      quantity: 1,
      unitPrice: 5000,
      lineTotal: 5000,
      ...
    }
  ],
  subtotal: 10000,
  gstAmount?: 1800,
  shippingFee?: 299,
  deliveryCharge?: 0,
  discount?: 0,
  walletUsed?: 0,
  total: 12099,
  shippingAddress: {
    fullName: "John Doe",
    phone: "+91-9876543210",
    line1: "123 Main Street",
    line2?: "Apt 4B",
    city: "Mumbai",
    state: "MH",
    postalCode: "400001",
    country: "India",
  },
  payment: {
    razorpayOrderId: "order_123abc",
    razorpayPaymentId: "pay_123abc",
    amount: 12099,
    currency: "INR",
    status: "captured",
  },
  status: "delivered",
  createdAt: Timestamp,
  updatedAt: Timestamp,
}
```

## Features

✅ Modern professional design  
✅ Dark blue theme matching Sky Tech branding  
✅ Client-side PDF generation (no server overhead)  
✅ High-quality PDF output (scale 2x, 95% JPEG quality)  
✅ Perfect A4 print layout  
✅ Mobile responsive  
✅ Print optimization  
✅ Download PDF functionality  
✅ Print to paper/PDF  
✅ Error handling with user-friendly messages  
✅ Loading states  
✅ Reusable components  
✅ Type-safe with TypeScript  
✅ No backend PDF generation needed  

## Dependencies

- `html2canvas` - Convert HTML to canvas (already in jsPDF deps)
- `jspdf` - Generate PDF from canvas (^4.2.1)
- `next` - React framework (16.2.6)
- `react` - UI library (19.2.4)

## Troubleshooting

### PDF not downloading
- Check if `html2canvas` is properly installed
- Ensure element ID matches (`invoice-template`)
- Check browser console for errors

### Print dialog not opening
- Allow popups in browser settings
- Check if `window.print()` is blocked

### Images not showing in PDF
- Verify image URLs are absolute or use CORS
- Check image loading in InvoiceTemplate

### Styling not appearing in PDF
- Ensure CSS is inline or Tailwind is processed
- The component uses Tailwind, which should work fine
- Test in different browsers

## Future Enhancements

- [ ] Email invoice directly from app
- [ ] Invoice templates customization
- [ ] Multi-currency support
- [ ] QR code for order tracking
- [ ] Digital signature
- [ ] Batch invoice generation
- [ ] Invoice archive/history
- [ ] Custom branding per merchant
- [ ] Translated invoices
- [ ] Payment receipt separate from invoice

## Support

For issues or questions about the invoice system, check:
1. Firestore order structure matches requirements
2. API route returns correct data
3. HTML element IDs are correct
4. Browser console for JavaScript errors
