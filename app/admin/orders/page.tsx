'use client';

import { arrayUnion, collection, doc, onSnapshot, query, serverTimestamp, updateDoc } from 'firebase/firestore';
import { PackageCheck, Search, ShoppingCart } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import EmptyState from '@/components/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { db } from '@/lib/firebase';
import { mapOrder } from '@/lib/firestore-mappers';
import { formatCurrency, formatDate, orderStatusLabel, statusBadgeClass, toDate } from '@/lib/format';
import type { Order, OrderStatus } from '@/lib/types';

const ORDER_STATUSES: OrderStatus[] = ['paid', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

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
      await updateDoc(doc(db, 'orders', order.id), {
        status,
        updatedAt: serverTimestamp(),
        timeline: arrayUnion({
          status,
          label: orderStatusLabel(status),
          description: `Order status updated to ${orderStatusLabel(status)}.`,
          createdAt: new Date(),
        }),
      });
      toast.success('Order status updated');
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order');
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
          <p className="mt-2 text-gray-600">Update order statuses live from Firestore</p>
        </div>
        <div className="tech-glass-panel rounded-lg p-4">
          <p className="text-sm text-gray-500">Revenue</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(revenue)}</p>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="search"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as 'all' | OrderStatus)}
          className="rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <article key={order.id} className="tech-glass-panel rounded-lg p-6">
              <div className="flex flex-col gap-4 border-b border-gray-200 pb-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-bold text-gray-900">{order.orderNumber}</h2>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(order.status)}`}>
                      {orderStatusLabel(order.status)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                  <p className="mt-1 text-sm text-gray-600">
                    {order.customerName} - {order.userEmail}
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(order.total, order.currency)}</p>
                  <select
                    value={order.status}
                    disabled={updatingOrderId === order.id}
                    onChange={(event) => updateOrderStatus(order, event.target.value as OrderStatus)}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {ORDER_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {orderStatusLabel(status)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_280px]">
                <div>
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <PackageCheck className="h-4 w-4 text-blue-600" />
                    Items
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {order.items.map((item) => (
                      <div key={item.productId} className="rounded-lg bg-gray-50 p-3">
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          {item.quantity} x {formatCurrency(item.unitPrice, order.currency)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="font-semibold text-gray-900">Shipping</p>
                  <p className="mt-2 text-sm text-gray-600">{order.shippingAddress.line1}</p>
                  {order.shippingAddress.line2 && <p className="text-sm text-gray-600">{order.shippingAddress.line2}</p>}
                  <p className="text-sm text-gray-600">
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                  </p>
                  <p className="text-sm text-gray-600">{order.shippingAddress.country}</p>
                  <p className="mt-3 text-sm font-medium text-gray-900">{order.shippingAddress.phone}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
