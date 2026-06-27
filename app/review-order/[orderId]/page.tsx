'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { collection, doc, getDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import type { Order, OrderItem } from '@/lib/types';
import { Receipt, FileText, Eye } from 'lucide-react';
import type { PaymentReceipt } from '@/lib/types';

export default function ReviewOrderPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [receipt, setReceipt] = useState<PaymentReceipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchOrder = async () => {
      try {
        const orderRef = doc(db, 'orders', orderId);
        const orderSnap = await getDoc(orderRef);

        if (!orderSnap.exists()) {
          setError('Order not found');
          setLoading(false);
          return;
        }

        const orderData = { id: orderSnap.id, ...orderSnap.data() } as Order;

        if (orderData.userId !== user.uid) {
          setError('You do not have access to this order');
          setLoading(false);
          return;
        }

        setOrder(orderData);
        setItems(orderData.items || []);

        // Fetch payment receipt (optional - don't fail if collection has permission issues)
        try {
          const receiptsQuery = query(collection(db, 'paymentReceipts'), where('orderId', '==', orderId));
          const receiptsSnap = await getDocs(receiptsQuery);
          if (!receiptsSnap.empty) {
            const receiptData = { id: receiptsSnap.docs[0].id, ...receiptsSnap.docs[0].data() } as PaymentReceipt;
            setReceipt(receiptData);
          }
        } catch (receiptError) {
          console.warn('Could not fetch payment receipt (may not exist or permission issue):', receiptError);
          // Don't fail the entire order load if receipt fetching fails
        }
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Failed to load order');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, user, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Error</h1>
          <p className="text-cyan-200 mb-6">{error || 'Could not load order'}</p>
          <Link href="/orders">
            <button className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-600 hover:to-cyan-500 text-[#020617] font-bold rounded-lg transition-all">
              Back to Orders
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="tech-heading-gradient text-4xl font-bold mb-3">Share Your Experience</h1>
          <p className="text-cyan-200 text-lg">
            Thank you for your purchase. Share your experience with Sky Tech.
          </p>
        </div>

        {/* Action Buttons - Moved to Top */}
        <div className="flex flex-col gap-4 sm:flex-row mb-8">
          <Link href={`/write-review?orderId=${orderId}`} className="flex-1">
            <button className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-600 hover:to-cyan-500 text-[#020617] font-bold rounded-lg transition-all">
              Write Review Now
            </button>
          </Link>
          <Link href="/orders" className="flex-1">
            <button className="w-full px-6 py-3 border-2 border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 font-bold rounded-lg transition-all">
              Skip for Later
            </button>
          </Link>
        </div>

        {/* Order Summary Card */}
        <div className="tech-glass-panel rounded-xl p-6 mb-8 border border-cyan-500/20">
          <h2 className="text-xl font-bold text-white mb-4">Order #{order.orderNumber}</h2>

          <div className="space-y-3 mb-6">
            {items.length > 0 ? (
              <>
                <p className="text-cyan-200">
                  <span className="font-semibold">Items:</span> {items.length} product{items.length > 1 ? 's' : ''}
                </p>
                <div className="flex flex-wrap gap-2">
                  {items.map((item) => (
                    <span
                      key={item.productId}
                      className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-sm text-cyan-300"
                    >
                      {item.name}
                    </span>
                  ))}
                </div>
              </>
            ) : null}
          </div>

          <p className="text-sm text-gray-400">
            You can review any of the products in this order, or provide general feedback about your experience.
          </p>
        </div>

        {/* Payment Receipt Card */}
        <div className="tech-glass-panel rounded-xl p-6 mb-8 border border-emerald-500/30" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 78, 59, 0.1) 100%)' }}>
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-emerald-500/20 p-3">
              <Receipt className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Payment Receipt</h3>
              <p className="text-sm text-emerald-300">Available Immediately</p>
            </div>
          </div>

          {receipt || order.receiptNumber ? (
            <button
              onClick={() => window.open(`/receipt-preview/${order.orderNumber}`, '_blank')}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-all"
            >
              <Eye className="h-5 w-5" />
              View Receipt
            </button>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-400">Generating payment receipt...</p>
            </div>
          )}
        </div>

        {/* Invoice Card */}
        <div className="tech-glass-panel rounded-xl p-6 mb-8 border border-blue-500/30" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(30, 58, 138, 0.1) 100%)' }}>
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/20 p-3">
              <FileText className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Invoice</h3>
              <p className="text-sm text-blue-300">
                {order.status === 'pending' 
                  ? 'Invoice will be generated after order confirmation' 
                  : order.invoiceNumber 
                  ? `Invoice #${order.invoiceNumber}` 
                  : 'Waiting for Order Confirmation'}
              </p>
            </div>
          </div>

          {order.status === 'pending' || !order.invoiceNumber ? (
            <div className="text-center py-4">
              <p className="text-sm text-gray-400 mb-3">Invoice will be available after order is confirmed by admin</p>
              <button
                disabled
                className="w-full px-4 py-3 bg-gray-700 text-gray-400 font-semibold rounded-lg cursor-not-allowed"
              >
                View Invoice
              </button>
            </div>
          ) : (
            <button
              onClick={() => window.open(`/invoice-preview/${order.orderNumber}`, '_blank')}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all"
            >
              <FileText className="h-5 w-5" />
              View Invoice
            </button>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-sm text-blue-200">
            💡 <span className="font-semibold">Tip:</span> Verified purchase reviews help other customers make informed decisions.
            Your review will appear on the site after admin approval.
          </p>
        </div>
      </div>
    </div>
  );
}
