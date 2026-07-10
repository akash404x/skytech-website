'use client';

import { arrayUnion, collection, doc, onSnapshot, query, serverTimestamp, updateDoc } from 'firebase/firestore';
import { PackageCheck, Search, ShoppingCart, Check, X, Receipt, FileText, Eye } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import EmptyState from '@/components/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { mapOrder } from '@/lib/firestore-mappers';
import { formatCurrency, formatDate, orderStatusLabel, statusBadgeClass, toDate } from '@/lib/format';
import type { Order, OrderStatus } from '@/lib/types';

const ORDER_STATUSES: OrderStatus[] = ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'cancellation_requested', 'cancellation_rejected'];

export default function AdminOrders() {
  const { getIdToken } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [approvingType, setApprovingType] = useState<'cancellation' | 'return' | 'replacement' | null>(null);

  useEffect(() => {
    const ordersQuery = query(collection(db, 'orders'));
    const unsubscribe = onSnapshot(
      ordersQuery,
      (snapshot) => {
        const ordersData = snapshot.docs
          .map((document) => mapOrder(document.id, document.data()))
          .sort((a, b) => (toDate(b.createdAt)?.getTime() ?? 0) - (toDate(a.createdAt)?.getTime() ?? 0));
        setOrders(ordersData);
        setLoading(false);
      },
      (error) => {
        console.error('Error loading orders:', error);
        toast.error('Failed to load orders');
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const filteredOrders = useMemo(() => {
    const search = searchQuery.toLowerCase();
    return orders.filter((order) => {
      const matchesSearch =
        order.orderNumber.toLowerCase().includes(search) ||
        order.customerName.toLowerCase().includes(search) ||
        order.userEmail.toLowerCase().includes(search);
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  const updateOrderStatus = async (order: Order, status: OrderStatus) => {
    if (order.status === status) return;

    setUpdatingOrderId(order.id);
    try {
      const token = await getIdToken();
      const response = await fetch('/api/admin/orders/update-status', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId: order.id, status }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update order status');
      
      // Show success message with email status
      if (data.emailSent) {
        toast.success(`Order status updated and email sent to ${order.userEmail}`);
      } else {
        toast.success('Order status updated (email notification may be delayed)');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update order');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleCancellationApproval = async (order: Order, approved: boolean) => {
    setUpdatingOrderId(order.id);
    try {
      const token = await getIdToken();
      if (!token) {
        throw new Error('Unable to get authentication token');
      }
      const response = await fetch('/api/admin/orders/cancel-approve', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId: order.id, approved }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to process cancellation');
      toast.success(data.message);
    } catch (error) {
      console.error('Cancellation approval error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process cancellation');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleReturnApproval = async (order: Order, approved: boolean) => {
    setUpdatingOrderId(order.id);
    try {
      const token = await getIdToken();
      if (!token) {
        throw new Error('Unable to get authentication token');
      }
      const response = await fetch('/api/admin/orders/return-approve', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId: order.id, approved }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to process return');
      toast.success(data.message);
    } catch (error) {
      console.error('Return approval error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process return');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleReplacementApproval = async (order: Order, approved: boolean) => {
    setUpdatingOrderId(order.id);
    try {
      const token = await getIdToken();
      if (!token) {
        throw new Error('Unable to get authentication token');
      }
      const response = await fetch('/api/admin/orders/replacement-approve', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId: order.id, approved }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to process replacement');
      toast.success(data.message);
    } catch (error) {
      console.error('Replacement approval error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process replacement');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const revenue = orders.filter((order) => order.status !== 'cancelled').reduce((total, order) => total + order.total, 0);

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="tech-heading-gradient text-3xl font-bold">Orders</h1>
          <p className="mt-2 text-slate-300">Update order statuses live from Firestore</p>
        </div>
        <div className="tech-glass-panel rounded-3xl p-4 border-cyan-500/10 bg-slate-950/90 shadow-[0_24px_60px_rgba(0,0,0,0.22)]">
          <p className="text-sm text-cyan-200">Revenue</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(revenue)}</p>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-cyan-300" />
          <input
            type="search"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="tech-input w-full rounded-3xl border border-cyan-500/20 bg-slate-900/80 py-2 pl-10 pr-4 text-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as 'all' | OrderStatus)}
          className="tech-input w-full max-w-xs rounded-3xl border border-cyan-500/20 bg-slate-900/80 px-4 py-2 text-white"
        >
          <option value="all">All statuses</option>
          {ORDER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {orderStatusLabel(status)}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-48" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="No orders found"
          description="Orders are created only after successful Razorpay payment verification."
        />
      ) : (
        <div className="space-y-5">
          {filteredOrders.map((order) => (
            <article key={order.id} className="tech-glass-panel rounded-3xl p-6 border border-cyan-500/10 bg-slate-950/90 shadow-[0_24px_60px_rgba(0,0,0,0.22)]">
              <div className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-bold text-white">{order.orderNumber}</h2>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(order.status)}`}>
                      {orderStatusLabel(order.status)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-400">{formatDate(order.createdAt)}</p>
                  <p className="mt-1 text-sm text-slate-400">
                    {order.customerName} - {order.userEmail}
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <p className="text-2xl font-bold text-white">{formatCurrency(order.total, order.currency)}</p>
                  <div className="flex gap-2">
                    {order.payment && (
                      <button
                        onClick={() => window.open(`/receipt-preview/${order.orderNumber}`, '_blank')}
                        className="flex items-center gap-1 rounded-lg border border-emerald-500 bg-emerald-500/20 px-3 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/30"
                        title="View Receipt"
                      >
                        <Eye className="h-3 w-3" />
                        Receipt
                      </button>
                    )}
                    {order.status !== 'pending' && (
                      <button
                        onClick={() => window.open(`/invoice-preview/${order.orderNumber}`, '_blank')}
                        className="flex items-center gap-1 rounded-lg border border-cyan-500 bg-cyan-500/20 px-3 py-2 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-500/30"
                        title="View Invoice"
                      >
                        <Eye className="h-3 w-3" />
                        Invoice
                      </button>
                    )}
                  </div>
                  <select
                    value={order.status}
                    disabled={updatingOrderId === order.id}
                    onChange={(event) => updateOrderStatus(order, event.target.value as OrderStatus)}
                    className="tech-input rounded-3xl border border-cyan-500/20 bg-slate-900/80 px-3 py-2 text-sm text-white disabled:opacity-50"
                  >
                    {ORDER_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {orderStatusLabel(status)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Cancellation Approval Actions */}
                {order.cancellationRequest && order.cancellationRequest.status === 'requested' && (
                  <div className="mt-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
                    <p className="mb-2 text-sm font-semibold text-yellow-300">Cancellation Request</p>
                    <p className="mb-3 text-sm text-slate-300">Reason: {order.cancellationRequest.reason}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCancellationApproval(order, true)}
                        disabled={updatingOrderId === order.id}
                        className="flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Check className="h-4 w-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleCancellationApproval(order, false)}
                        disabled={updatingOrderId === order.id}
                        className="flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <X className="h-4 w-4" />
                        Reject
                      </button>
                    </div>
                  </div>
                )}

                {/* Return Approval Actions */}
                {order.returnRequest && order.returnRequest.status === 'requested' && (
                  <div className="mt-4 rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
                    <p className="mb-2 text-sm font-semibold text-blue-300">Return Request</p>
                    <p className="mb-3 text-sm text-slate-300">Reason: {order.returnRequest.reason}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReturnApproval(order, true)}
                        disabled={updatingOrderId === order.id}
                        className="flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Check className="h-4 w-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReturnApproval(order, false)}
                        disabled={updatingOrderId === order.id}
                        className="flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <X className="h-4 w-4" />
                        Reject
                      </button>
                    </div>
                  </div>
                )}

                {/* Replacement Approval Actions */}
                {order.replacementRequest && order.replacementRequest.status === 'requested' && (
                  <div className="mt-4 rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-4">
                    <p className="mb-2 text-sm font-semibold text-cyan-300">Replacement Request</p>
                    <p className="mb-3 text-sm text-slate-300">Reason: {order.replacementRequest.reason}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReplacementApproval(order, true)}
                        disabled={updatingOrderId === order.id}
                        className="flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Check className="h-4 w-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReplacementApproval(order, false)}
                        disabled={updatingOrderId === order.id}
                        className="flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <X className="h-4 w-4" />
                        Reject
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_280px]">
                <div>
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-cyan-200">
                    <PackageCheck className="h-4 w-4 text-cyan-300" />
                    Items
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {order.items.map((item) => (
                      <div key={item.productId} className="rounded-2xl bg-slate-900/80 p-4 text-slate-300">
                        <p className="font-medium text-white">{item.name}</p>
                        <p className="text-sm text-slate-400">
                          {item.quantity} x {formatCurrency(item.unitPrice, order.currency)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-cyan-500/10 bg-slate-900/80 p-4">
                  <p className="font-semibold text-white">Shipping</p>
                  <p className="mt-2 text-sm text-slate-300">{order.shippingAddress.line1}</p>
                  {order.shippingAddress.line2 && <p className="text-sm text-slate-300">{order.shippingAddress.line2}</p>}
                  <p className="text-sm text-slate-300">
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                  </p>
                  <p className="text-sm text-slate-300">{order.shippingAddress.country}</p>
                  <p className="mt-3 text-sm font-medium text-white">{order.shippingAddress.phone}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
