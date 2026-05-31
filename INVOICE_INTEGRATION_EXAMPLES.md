// Example Integration - Orders Page with Invoice Download
// Location: app/orders/page.tsx (existing file)

import InvoiceDownloadButton from '@/components/invoice/InvoiceDownloadButton';

// Replace the existing "Download Invoice" button in the orders list with:

{/* Around line 350 in the existing orders page */}
{order.invoiceNumber && (
  <InvoiceDownloadButton
    orderNumber={order.orderNumber}
    invoiceNumber={order.invoiceNumber}
    variant="secondary"
    size="sm"
    text="View Invoice"
  />
)}

// Or use the Link directly:
import Link from 'next/link';

<Link
  href={`/invoice-preview/${encodeURIComponent(order.orderNumber)}`}
  className="flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20"
>
  <Download className="h-4 w-4" />
  View Invoice
</Link>

// ============================================================================

// Example: Admin Orders Page Integration
// Location: app/admin/orders/page.tsx

'use client';

import { useState, useEffect } from 'react';
import InvoiceDownloadButton from '@/components/invoice/InvoiceDownloadButton';
import { adminDb } from '@/lib/firebase-admin';
import type { Order } from '@/lib/types';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true);
        // Fetch orders from your admin API
        const response = await fetch('/api/admin/orders');
        const data = await response.json();
        setOrders(data.orders);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="admin-container">
      <h1 className="text-3xl font-bold mb-6">Orders Management</h1>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-3 text-left">Order #</th>
              <th className="border p-3 text-left">Customer</th>
              <th className="border p-3 text-left">Amount</th>
              <th className="border p-3 text-left">Status</th>
              <th className="border p-3 text-center">Invoice</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="border p-3 font-medium">{order.orderNumber}</td>
                <td className="border p-3">{order.customerName}</td>
                <td className="border p-3 font-semibold">₹{order.total.toFixed(2)}</td>
                <td className="border p-3">
                  <span className={`px-3 py-1 rounded text-sm ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="border p-3 text-center">
                  <InvoiceDownloadButton
                    orderNumber={order.orderNumber}
                    variant="primary"
                    size="sm"
                    text="View"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================================

// Example: Standalone Invoice View Page
// Location: Custom page or modal

'use client';

import { useState, useEffect } from 'react';
import InvoiceViewer from '@/components/invoice/InvoiceViewer';
import type { Order } from '@/lib/types';

interface InvoicePageProps {
  orderNumber: string;
}

export default function InvoicePage({ orderNumber }: InvoicePageProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInvoice() {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/invoices/download?orderNumber=${encodeURIComponent(orderNumber)}`
        );

        if (!response.ok) {
          throw new Error('Failed to load invoice');
        }

        const data = await response.json();
        setOrder(data.order);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error loading invoice';
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    fetchInvoice();
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded p-6 max-w-md">
          <h2 className="text-red-800 font-bold text-lg mb-2">Error</h2>
          <p className="text-red-600">{error || 'Invoice not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <InvoiceViewer order={order} showActions={true} />
      </div>
    </div>
  );
}

// ============================================================================

// Example: Invoice in Email Template
// Location: lib/email-service.ts

export function getOrderConfirmationEmailHTML(order: Order): string {
  const invoiceLink = `${process.env.NEXT_PUBLIC_BASE_URL}/invoice-preview/${encodeURIComponent(order.orderNumber)}`;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; }
        .button { 
          display: inline-block;
          background-color: #38BDF8;
          color: #0F172A;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: bold;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Order Confirmation</h1>
        
        <p>Thank you for your order!</p>
        
        <h2>Order Details</h2>
        <p><strong>Order Number:</strong> ${order.orderNumber}</p>
        <p><strong>Total:</strong> ₹${order.total.toFixed(2)}</p>
        
        <p>
          <a href="${invoiceLink}" class="button">View & Download Invoice</a>
        </p>
        
        <p>Best regards,<br/>Sky Tech Team</p>
      </div>
    </body>
    </html>
  `;
}

// ============================================================================

// Example: Quick Action Menu Component
// Location: components/OrderQuickActions.tsx

'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Order } from '@/lib/types';

interface OrderQuickActionsProps {
  order: Order;
  onCancel?: () => void;
  onReturn?: () => void;
}

export default function OrderQuickActions({
  order,
  onCancel,
  onReturn,
}: OrderQuickActionsProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Actions ▼
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg z-10">
          {/* View Invoice */}
          <Link
            href={`/invoice-preview/${encodeURIComponent(order.orderNumber)}`}
            className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
            onClick={() => setShowMenu(false)}
          >
            📄 View Invoice
          </Link>

          {/* Cancel Order */}
          {(order.status === 'pending' || order.status === 'confirmed') && onCancel && (
            <button
              onClick={() => {
                onCancel();
                setShowMenu(false);
              }}
              className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
            >
              ✕ Cancel Order
            </button>
          )}

          {/* Return Order */}
          {order.status === 'delivered' && onReturn && (
            <button
              onClick={() => {
                onReturn();
                setShowMenu(false);
              }}
              className="w-full text-left px-4 py-2 text-blue-600 hover:bg-blue-50"
            >
              ↩ Return Order
            </button>
          )}

          {/* Track Order */}
          <Link
            href={`/orders/${order.id}`}
            className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
            onClick={() => setShowMenu(false)}
          >
            📍 Track Order
          </Link>
        </div>
      )}
    </div>
  );
}

// ============================================================================

// Example: Dashboard Widget showing recent invoices
// Location: components/RecentInvoices.tsx

'use client';

import { useEffect, useState } from 'react';
import InvoiceDownloadButton from '@/components/invoice/InvoiceDownloadButton';
import type { Order } from '@/lib/types';

export default function RecentInvoices() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecentOrders() {
      try {
        // Fetch from your API
        const response = await fetch('/api/user/orders?limit=5');
        const data = await response.json();
        setOrders(data.orders);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRecentOrders();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Recent Invoices</h2>

      <div className="space-y-3">
        {orders.map((order) => (
          <div
            key={order.id}
            className="flex items-center justify-between p-4 border border-gray-200 rounded hover:bg-gray-50"
          >
            <div>
              <p className="font-medium text-gray-900">{order.orderNumber}</p>
              <p className="text-sm text-gray-500">₹{order.total.toFixed(2)}</p>
            </div>
            <InvoiceDownloadButton
              orderNumber={order.orderNumber}
              variant="primary"
              size="sm"
              text="Invoice"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
