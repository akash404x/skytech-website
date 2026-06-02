'use client';

import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { CreditCard, PackageCheck, ReceiptText, X, RotateCcw, RefreshCw, Download, Eye, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import EmptyState from '@/components/EmptyState';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { mapOrder, mapPayment } from '@/lib/firestore-mappers';
import { formatCurrency, formatDate, orderStatusLabel, statusBadgeClass, toDate } from '@/lib/format';
import type { Order, OrderStatus, PaymentTransaction } from '@/lib/types';

const timelineStatuses: OrderStatus[] = ['pending', 'confirmed', 'packed', 'shipped', 'delivered'];

function CancelOrderModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { getIdToken } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error('Please provide a reason for cancellation');
      return;
    }

    setSubmitting(true);
    try {
      const token = await getIdToken();
      const response = await fetch('/api/orders/cancel', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId: order.id, reason }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to cancel order');
      toast.success('Cancellation request submitted');
      onClose();
    } catch (error) {
      console.error('Cancel order error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to cancel order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="tech-glass-card w-full max-w-md p-6">
        <h3 className="mb-4 text-xl font-bold text-white">Cancel Order</h3>
        <p className="mb-4 text-sm tech-text">Order: {order.orderNumber}</p>
        <form onSubmit={handleSubmit}>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for cancellation..."
            className="tech-input mb-4 h-32 w-full rounded-lg border border-cyan-500/20 bg-slate-900/80 p-3 text-white"
            required
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-cyan-500/20 bg-slate-900/80 px-4 py-2 text-white transition hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ReturnReplacementModal({ order, type, onClose }: { order: Order; type: 'return' | 'replacement'; onClose: () => void }) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { getIdToken } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error('Please provide a reason');
      return;
    }

    setSubmitting(true);
    try {
      const token = await getIdToken();
      const endpoint = type === 'return' ? '/api/orders/return' : '/api/orders/replacement';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId: order.id, reason }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `Failed to submit ${type} request`);
      toast.success(`${type === 'return' ? 'Return' : 'Replacement'} request submitted`);
      onClose();
    } catch (error) {
      console.error(`${type} error:`, error);
      toast.error(error instanceof Error ? error.message : `Failed to submit ${type} request`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="tech-glass-card w-full max-w-md p-6">
        <h3 className="mb-4 text-xl font-bold text-white">
          {type === 'return' ? 'Request Return' : 'Request Replacement'}
        </h3>
        <p className="mb-4 text-sm tech-text">Order: {order.orderNumber}</p>
        <form onSubmit={handleSubmit}>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={`Reason for ${type}...`}
            className="tech-input mb-4 h-32 w-full rounded-lg border border-cyan-500/20 bg-slate-900/80 p-3 text-white"
            required
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-cyan-500/20 bg-slate-900/80 px-4 py-2 text-white transition hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function OrderTimeline({ order }: { order: Order }) {
  if (order.status === 'cancelled') {
    return (
      <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm font-medium text-red-300">
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
            <div className={`h-4 w-4 shrink-0 rounded-full ${done ? 'bg-blue-500' : 'bg-slate-600'} sm:mb-2`} />
            <div>
              <p className={`text-sm font-semibold ${done ? 'text-white' : 'tech-muted'}`}>
                {orderStatusLabel(status)}
              </p>
              {event && <p className="mt-1 text-xs tech-muted">{formatDate(event.createdAt)}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function OrdersPage() {
  const router = useRouter();
  const { user, loading: authLoading, getIdToken } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalType, setModalType] = useState<'cancel' | 'return' | 'replacement' | null>(null);

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

  const handleDownloadInvoice = (invoiceUrl: string) => {
    window.open(invoiceUrl, '_blank');
  };

  const handleViewInvoice = (invoiceUrl: string) => {
    window.open(invoiceUrl, '_blank');
  };

  if (authLoading || !user) {
    return (
      <div className="tech-loading-screen">
        <div className="tech-spinner" />
      </div>
    );
  }

  return (
    <div className="tech-page flex min-h-screen flex-col">
      <Navbar />
      <main className="tech-main">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="tech-heading-gradient text-3xl font-bold">My Orders</h1>
            <p className="mt-2 tech-text">Live order tracking and payment history</p>
          </div>
          <div className="tech-glass-card p-4">
            <p className="text-sm tech-muted">Total Paid</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(totalPaid)}</p>
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
              <article key={order.id} className="tech-glass-card p-6">
                <div className="flex flex-col gap-4 border-b border-white/10 pb-5 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-xl font-bold text-white">{order.orderNumber}</h2>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(order.status)}`}>
                        {orderStatusLabel(order.status)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm tech-text">{formatDate(order.createdAt)}</p>
                    <p className="mt-1 text-sm tech-text">
                      {order.items.length} item{order.items.length === 1 ? '' : 's'} shipped to {order.shippingAddress.city}
                    </p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-sm tech-muted">Order Total</p>
                    <p className="text-2xl font-bold text-white">{formatCurrency(order.total, order.currency)}</p>
                  </div>
                </div>

                <div className="mt-5">
                  <OrderTimeline order={order} />
                </div>

                {/* Invoice Section */}
                <div className="mt-5 rounded-2xl border border-cyan-500/10 bg-slate-900/80 p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-cyan-200">
                    <ReceiptText className="h-4 w-4 text-cyan-300" />
                    Invoice
                  </div>
                  {order.invoiceUrl ? (
                    <div className="space-y-3">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-medium text-white">{order.invoiceNumber || 'SKY-INV-XXXXXX'}</p>
                          <p className="text-xs tech-muted">Generated: {formatDate(order.createdAt)}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewInvoice(order.invoiceUrl!)}
                            className="flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </button>
                          <button
                            onClick={() => handleDownloadInvoice(order.invoiceUrl!)}
                            className="flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20"
                          >
                            <Download className="h-4 w-4" />
                            Download
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm tech-muted">No invoice generated yet</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  {/* Write Review Button - Only for delivered orders */}
                  {order.status === 'delivered' && (
                    <Link href={`/write-review?orderId=${order.id}`} className="inline-flex">
                      <button className="flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20">
                        <Star className="h-4 w-4" />
                        Write Review
                      </button>
                    </Link>
                  )}

                  {/* Cancel Order Button - Only before shipment */}
                  {order.status === 'pending' || order.status === 'confirmed' ? (
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setModalType('cancel');
                      }}
                      className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/20"
                    >
                      <X className="h-4 w-4" />
                      Cancel Order
                    </button>
                  ) : null}

                  {/* Return Button - Only for delivered orders < ₹500 */}
                  {order.status === 'delivered' && !order.returnRequest && !order.replacementRequest && order.total < 500 ? (
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setModalType('return');
                      }}
                      className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-300 transition hover:bg-blue-500/20"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Return Order
                    </button>
                  ) : null}

                  {/* Replacement Button - Only for delivered orders >= ₹500 */}
                  {order.status === 'delivered' && !order.returnRequest && !order.replacementRequest && order.total >= 500 ? (
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setModalType('replacement');
                      }}
                      className="flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Request Replacement
                    </button>
                  ) : null}

                  {/* Show request status if pending */}
                  {order.cancellationRequest && order.cancellationRequest.status === 'requested' && (
                    <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-semibold text-yellow-300">
                      Cancellation Requested
                    </span>
                  )}
                  {order.returnRequest && order.returnRequest.status === 'requested' && (
                    <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-300">
                      Return Requested
                    </span>
                  )}
                  {order.replacementRequest && order.replacementRequest.status === 'requested' && (
                    <span className="rounded-full bg-cyan-500/20 px-3 py-1 text-xs font-semibold text-cyan-300">
                      Replacement Requested
                    </span>
                  )}
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {order.items.map((item) => (
                    <div key={item.productId} className="tech-inner-row">
                      <p className="font-medium text-white">{item.name}</p>
                      <p className="text-sm tech-text">
                        {item.quantity} x {formatCurrency(item.unitPrice, order.currency)}
                      </p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}

        <section className="tech-glass-card mt-10 p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-lg bg-blue-600/30 p-3 text-blue-300">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Payment History</h2>
              <p className="text-sm tech-muted">Verified Razorpay transactions saved in Firestore</p>
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
                  <tr className="tech-table-head">
                    <th className="py-3 pr-4 font-semibold">Payment ID</th>
                    <th className="py-3 pr-4 font-semibold">Order</th>
                    <th className="py-3 pr-4 font-semibold">Amount</th>
                    <th className="py-3 pr-4 font-semibold">Status</th>
                    <th className="py-3 pr-4 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id} className="tech-table-row">
                      <td className="pr-4 font-medium text-white">{payment.razorpayPaymentId}</td>
                      <td className="pr-4 tech-text">{payment.orderId}</td>
                      <td className="pr-4 font-semibold text-white">{formatCurrency(payment.amount, payment.currency)}</td>
                      <td className="pr-4">
                        <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-semibold text-green-300">
                          {payment.status}
                        </span>
                      </td>
                      <td className="pr-4 tech-text">{formatDate(payment.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
      <Footer />

      {/* Modals */}
      {selectedOrder && modalType === 'cancel' && (
        <CancelOrderModal order={selectedOrder} onClose={() => { setSelectedOrder(null); setModalType(null); }} />
      )}
      {selectedOrder && modalType === 'return' && (
        <ReturnReplacementModal order={selectedOrder} type="return" onClose={() => { setSelectedOrder(null); setModalType(null); }} />
      )}
      {selectedOrder && modalType === 'replacement' && (
        <ReturnReplacementModal order={selectedOrder} type="replacement" onClose={() => { setSelectedOrder(null); setModalType(null); }} />
      )}
    </div>
  );
}
