'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import InvoiceViewer from '@/components/invoice/InvoiceViewer';
import type { Order } from '@/lib/types';

export default function InvoicePreviewPage() {
  const params = useParams();
  const orderNumber = params.orderNumber as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInvoice() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/invoices/download?orderNumber=${encodeURIComponent(orderNumber)}`);

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to fetch invoice');
        }

        const data = await response.json();
        setOrder(data.order);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load invoice';
        setError(errorMessage);
        console.error('Error fetching invoice:', err);
      } finally {
        setLoading(false);
      }
    }

    if (orderNumber) {
      fetchInvoice();
    }
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#38BDF8] mb-4"></div>
          </div>
          <p className="text-white text-lg">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#0F172A] p-4 flex items-center justify-center">
        <div className="bg-[#1E293B] border border-red-500 rounded-lg p-8 max-w-md">
          <h1 className="text-white text-2xl font-bold mb-4">Error</h1>
          <p className="text-red-400 mb-6">{error || 'Invoice not found'}</p>
          <a
            href="/orders"
            className="inline-block px-6 py-2 bg-[#38BDF8] text-[#0F172A] rounded font-semibold hover:bg-[#0EA5E9] transition-colors"
          >
            Back to Orders
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] p-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <a
            href="/orders"
            className="inline-block px-4 py-2 bg-[#1E293B] text-white rounded hover:bg-[#334155] transition-colors text-sm font-medium"
          >
            ← Back to Orders
          </a>
        </div>

        <InvoiceViewer order={order} showActions={true} />
      </div>
    </div>
  );
}
