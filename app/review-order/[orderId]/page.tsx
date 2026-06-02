'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { collection, doc, getDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import type { Order, OrderItem } from '@/lib/types';
import { FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ReviewOrderPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleDownloadInvoice = () => {
    if (!order) {
      toast.error('Invoice not available yet.');
      return;
    }

    // Open invoice preview page in new tab
    window.open(`/invoice-preview/${order.orderNumber}`, '_blank');
  };

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

        {/* Action Buttons */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link href={`/write-review?orderId=${orderId}`} className="flex-1">
            <button className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-600 hover:to-cyan-500 text-[#020617] font-bold rounded-lg transition-all">
              Write Review Now
            </button>
          </Link>
          <button
            onClick={handleDownloadInvoice}
            className="flex-1 px-6 py-3 font-bold rounded-lg transition-all flex items-center justify-center gap-2 border border-[#00E5FF] text-white hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:scale-105"
            style={{
              background: 'rgba(0,191,255,0.15)',
            }}
          >
            <FileText className="w-5 h-5" />
            Download Invoice
          </button>
          <Link href="/orders" className="flex-1">
            <button className="w-full px-6 py-3 border-2 border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 font-bold rounded-lg transition-all">
              Skip for Later
            </button>
          </Link>
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
