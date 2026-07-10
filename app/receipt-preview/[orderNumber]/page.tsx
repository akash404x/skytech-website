'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ReceiptViewer from '@/components/receipt/ReceiptViewer';
import type { Order } from '@/lib/types';

export default function ReceiptPreviewPage() {
  const params = useParams();
  const orderNumber = params.orderNumber as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReceipt() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/receipts/download?orderNumber=${encodeURIComponent(orderNumber)}`);

        if (!response.ok) {
          const contentType = response.headers.get('content-type');
          console.error('Response not OK:', response.status, contentType);
          const text = await response.text();
          console.error('Response body:', text);
          throw new Error(`Failed to fetch receipt: ${response.status}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error('Non-JSON response:', text);
          throw new Error('Invalid response format from server');
        }

        const data = await response.json();
        setOrder(data.order);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load receipt';
        setError(errorMessage);
        console.error('Error fetching receipt:', err);
      } finally {
        setLoading(false);
      }
    }

    if (orderNumber) {
      fetchReceipt();
    }
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#38BDF8] mb-4"></div>
          </div>
          <p className="text-white text-lg">Loading receipt...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#0F172A] p-4 flex items-center justify-center">
        <div className="bg-[#1E293B] border border-red-500 rounded-lg p-8 max-w-md">
          <h1 className="text-white text-2xl font-bold mb-4">Error</h1>
          <p className="text-red-400 mb-6">{error || 'Receipt not found'}</p>
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

        <ReceiptViewer order={order} showActions={true} />
      </div>
    </div>
  );
}
