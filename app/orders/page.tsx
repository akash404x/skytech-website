'use client';

import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { CreditCard, PackageCheck, ReceiptText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import EmptyState from '@/components/EmptyState';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { mapOrder, mapPayment } from '@/lib/firestore-mappers';
import { formatCurrency, formatDate, orderStatusLabel, statusBadgeClass, toDate } from '@/lib/format';
import type { Order, OrderStatus, PaymentTransaction } from '@/lib/types';

const timelineStatuses: OrderStatus[] = ['paid', 'processing', 'shipped', 'delivered'];

function OrderTimeline({ order }: { order: Order }) {
  if (order.status === 'cancelled') {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-sm font-medium text-red-700">
        This order was cancelled.
      </div>
    );
  }

  const currentIndex = timelineStatuses.indexOf(order.status);

  return (
    <div className="grid gap-3 sm:grid-cols-4">
      {timelineStatuses.map((status, index) => {
        const event = order.timeline.find((item) => item.status === status);
        const done = index <= currentIndex;
        return (
          <div key={status} className="flex gap-3 sm:block">
            <div className={`h-4 w-4 shrink-0 rounded-full ${done ? 'bg-blue-600' : 'bg-gray-300'} sm:mb-2`} />
            <div>
              <p className={`text-sm font-semibold ${done ? 'text-gray-900' : 'text-gray-500'}`}>
                {orderStatusLabel(status)}
              </p>
              {event && <p className="mt-1 text-xs text-gray-500">{formatDate(event.createdAt)}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function OrdersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingPayments, setLoadingPayments] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, router, user]);

  useEffect(() => {
    if (!user) return undefined;

    const ordersQuery = query(collection(db, 'orders'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(
      ordersQuery,
      (snapshot) => {
        const ordersData = snapshot.docs
          .map((document) => mapOrder(document.id, document.data()))
          .sort((a, b) => (toDate(b.createdAt)?.getTime() ?? 0) - (toDate(a.createdAt)?.getTime() ?? 0));
        setOrders(ordersData);
        setLoadingOrders(false);
      },
      (error) => {
        console.error('Error loading orders:', error);
        setLoadingOrders(false);
      },
    );

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) return undefined;

    const paymentsQuery = query(collection(db, 'payments'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(
      paymentsQuery,
      (snapshot) => {
        const paymentsData = snapshot.docs
          .map((document) => mapPayment(document.id, document.data()))
          .sort((a, b) => (toDate(b.createdAt)?.getTime() ?? 0) - (toDate(a.createdAt)?.getTime() ?? 0));
        setPayments(paymentsData);
        setLoadingPayments(false);
      },
      (error) => {
        console.error('Error loading payments:', error);
        setLoadingPayments(false);
      },
    );

    return () => unsubscribe();
  }, [user]);

  const isLoading = authLoading || loadingOrders;
  const totalPaid = useMemo(() => payments.reduce((total, payment) => total + payment.amount, 0), [payments]);

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
            <p className="mt-2 text-gray-600">Live order tracking and payment history</p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Total Paid</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalPaid)}</p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-56" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            icon={PackageCheck}
            title="No orders yet"
            description="Completed Razorpay payments will create orders here after signature verification."
          />
        ) : (
          <div className="space-y-5">
            {orders.map((order) => (
              <article key={order.id} className="rounded-lg bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 border-b border-gray-200 pb-5 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-xl font-bold text-gray-900">{order.orderNumber}</h2>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(order.status)}`}>
                        {orderStatusLabel(order.status)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                    <p className="mt-1 text-sm text-gray-600">
                      {order.items.length} item{order.items.length === 1 ? '' : 's'} shipped to {order.shippingAddress.city}
                    </p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-sm text-gray-500">Order Total</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(order.total, order.currency)}</p>
                  </div>
                </div>

                <div className="mt-5">
                  <OrderTimeline order={order} />
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {order.items.map((item) => (
                    <div key={item.productId} className="rounded-lg bg-gray-50 p-3">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        {item.quantity} x {formatCurrency(item.unitPrice, order.currency)}
                      </p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}

        <section className="mt-10 rounded-lg bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-3 text-blue-600">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Payment History</h2>
              <p className="text-sm text-gray-600">Verified Razorpay transactions saved in Firestore</p>
            </div>
          </div>

          {loadingPayments ? (
            <Skeleton className="h-32" />
          ) : payments.length === 0 ? (
            <EmptyState icon={ReceiptText} title="No payments recorded" description="Payment records appear after successful verification." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left">
                <thead>
                  <tr className="border-b border-gray-200 text-sm text-gray-600">
                    <th className="py-3 pr-4 font-semibold">Payment ID</th>
                    <th className="py-3 pr-4 font-semibold">Order</th>
                    <th className="py-3 pr-4 font-semibold">Amount</th>
                    <th className="py-3 pr-4 font-semibold">Status</th>
                    <th className="py-3 pr-4 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id} className="border-b border-gray-100 text-sm">
                      <td className="py-3 pr-4 font-medium text-gray-900">{payment.razorpayPaymentId}</td>
                      <td className="py-3 pr-4 text-gray-600">{payment.orderId}</td>
                      <td className="py-3 pr-4 font-semibold text-gray-900">{formatCurrency(payment.amount, payment.currency)}</td>
                      <td className="py-3 pr-4">
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                          {payment.status}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-gray-600">{formatDate(payment.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
