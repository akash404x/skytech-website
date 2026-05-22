'use client';

import { doc, onSnapshot } from 'firebase/firestore';
import { ArrowLeft, PackageCheck, ReceiptText, Truck, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import EmptyState from '@/components/EmptyState';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import SupportChat from '@/components/SupportChat';
import { db } from '@/lib/firebase';
import { mapOrder } from '@/lib/firestore-mappers';
import { formatCurrency, formatDate, orderStatusLabel, statusBadgeClass, toDate } from '@/lib/format';
import { useAuth } from '@/contexts/AuthContext';
import type { Order } from '@/lib/types';

export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, router, user]);

  useEffect(() => {
    if (!params?.id || !user) return undefined;
    setLoadingOrder(true);
    const orderRef = doc(db, 'orders', params.id as string);
    const unsubscribe = onSnapshot(
      orderRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setOrder(null);
          setLoadingOrder(false);
          return;
        }
        const mapped = mapOrder(snapshot.id, snapshot.data());
        if (mapped.userId !== user.uid) {
          setOrder(null);
        } else {
          setOrder(mapped);
        }
        setLoadingOrder(false);
      },
      (error) => {
        console.error('Error loading order details:', error);
        setOrder(null);
        setLoadingOrder(false);
      },
    );

    return unsubscribe;
  }, [params?.id, user]);

  if (authLoading || !user) {
    return (
      <div className="tech-loading-screen">
        <div className="tech-spinner" />
      </div>
    );
  }

  if (loadingOrder) {
    return (
      <div className="tech-page flex min-h-screen flex-col">
        <Navbar />
        <main className="tech-main">
          <div className="space-y-4">
            <div className="h-12 w-40 animate-pulse rounded-2xl bg-slate-800" />
            <div className="h-96 animate-pulse rounded-3xl bg-slate-900" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="tech-page flex min-h-screen flex-col">
      <Navbar />
      <main className="tech-main">
        <div className="mb-6 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <Link href="/orders" className="inline-flex items-center gap-2 text-sm text-cyan-300 hover:text-cyan-200">
              <ArrowLeft className="h-4 w-4" /> Back to orders
            </Link>
            <h1 className="tech-heading-gradient mt-3 text-3xl font-bold">Order details</h1>
            <p className="mt-2 text-slate-400">Everything you need for this purchase, plus support chat.</p>
          </div>
          {order ? (
            <div className="rounded-3xl border border-white/10 bg-slate-950/80 px-5 py-4 text-sm text-slate-300">
              <p className="text-sm text-slate-400">Order status</p>
              <p className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(order.status)}`}>
                {orderStatusLabel(order.status)}
              </p>
            </div>
          ) : null}
        </div>

        {!order ? (
          <EmptyState
            icon={XCircle}
            title="Order not found"
            description="This order does not exist or you are not authorized to view it."
          />
        ) : (
          <div className="grid gap-6 xl:grid-cols-[1.4fr_0.95fr]">
            <section className="space-y-6">
              <div className="tech-glass-card p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Order</p>
                    <h2 className="mt-2 text-2xl font-bold text-white">{order.orderNumber}</h2>
                    <p className="mt-1 text-sm text-slate-400">Placed on {formatDate(order.createdAt)}</p>
                  </div>
                  <div className="space-y-2 text-right">
                    <p className="text-sm text-slate-400">Total paid</p>
                    <p className="text-2xl font-bold text-white">{formatCurrency(order.total, order.currency)}</p>
                  </div>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl bg-slate-900/80 p-4 text-sm text-slate-300">
                    <p className="font-semibold text-white">Shipping</p>
                    <p className="mt-3">{order.shippingAddress.fullName}</p>
                    <p>{order.shippingAddress.line1}</p>
                    {order.shippingAddress.line2 ? <p>{order.shippingAddress.line2}</p> : null}
                    <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                    <p>{order.shippingAddress.country}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-900/80 p-4 text-sm text-slate-300">
                    <p className="font-semibold text-white">Payment</p>
                    <p className="mt-3 text-sm">{order.payment.razorpayPaymentId}</p>
                    <p className="mt-2 text-sm text-slate-400">Status: {order.payment.status}</p>
                  </div>
                </div>
              </div>

              <div className="tech-glass-card p-6">
                <div className="mb-5 flex items-center gap-3">
                  <PackageCheck className="h-5 w-5 text-cyan-300" />
                  <div>
                    <p className="text-sm text-slate-400">Items in this order</p>
                    <p className="text-base font-semibold text-white">{order.items.length} products</p>
                  </div>
                </div>
                <div className="grid gap-4">
                  {order.items.map((item) => (
                    <div key={item.productId} className="rounded-3xl border border-white/10 bg-slate-900/80 p-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-semibold text-white">{item.name}</p>
                          <p className="text-sm text-slate-400">{item.quantity} × {formatCurrency(item.unitPrice, order.currency)}</p>
                        </div>
                        <p className="text-sm font-semibold text-white">{formatCurrency(item.lineTotal, order.currency)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <aside className="space-y-6">
              <SupportChat
                orderId={order.id}
                orderNumber={order.orderNumber}
                userName={user.displayName || user.email || 'Customer'}
                userEmail={user.email || ''}
              />
            </aside>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
