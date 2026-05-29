'use client';

import { collection, onSnapshot, query } from 'firebase/firestore';
import { RefreshCw, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import EmptyState from '@/components/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { db } from '@/lib/firebase';
import { mapOrder } from '@/lib/firestore-mappers';
import { formatCurrency, formatDate, toDate } from '@/lib/format';
import type { Order } from '@/lib/types';

export default function AdminReplacements() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const ordersQuery = query(collection(db, 'orders'));
    const unsubscribe = onSnapshot(
      ordersQuery,
      (snapshot) => {
        const ordersData = snapshot.docs
          .map((document) => mapOrder(document.id, document.data()))
          .filter((order) => order.replacementRequest !== undefined)
          .sort((a, b) => (toDate(b.replacementRequest?.createdAt)?.getTime() ?? 0) - (toDate(a.replacementRequest?.createdAt)?.getTime() ?? 0));
        setOrders(ordersData);
        setLoading(false);
      },
      (error) => {
        console.error('Error loading replacement requests:', error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const filteredOrders = useMemo(() => {
    const search = searchQuery.toLowerCase();
    return orders.filter((order) => {
      return (
        order.orderNumber.toLowerCase().includes(search) ||
        order.customerName.toLowerCase().includes(search) ||
        order.userEmail.toLowerCase().includes(search) ||
        (order.replacementRequest?.reason.toLowerCase().includes(search) ?? false)
      );
    });
  }, [orders, searchQuery]);

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="tech-heading-gradient text-3xl font-bold">Replacement Requests</h1>
          <p className="mt-2 text-slate-300">Manage replacement requests from customers</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-cyan-300" />
          <input
            type="search"
            placeholder="Search replacement requests..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="tech-input w-full rounded-3xl border border-cyan-500/20 bg-slate-900/80 py-2 pl-10 pr-4 text-white"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-48" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <EmptyState icon={RefreshCw} title="No replacement requests" description="Replacement requests will appear here when customers submit them." />
      ) : (
        <div className="space-y-5">
          {filteredOrders.map((order) => (
            <article key={order.id} className="tech-glass-panel rounded-3xl p-6 border border-cyan-500/10 bg-slate-950/90 shadow-[0_24px_60px_rgba(0,0,0,0.22)]">
              <div className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-bold text-white">{order.orderNumber}</h2>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        order.replacementRequest?.status === 'requested'
                          ? 'bg-cyan-500/20 text-cyan-300'
                          : order.replacementRequest?.status === 'approved'
                            ? 'bg-green-500/20 text-green-300'
                            : 'bg-red-500/20 text-red-300'
                      }`}
                    >
                      {order.replacementRequest?.status === 'requested'
                        ? 'Requested'
                        : order.replacementRequest?.status === 'approved'
                          ? 'Approved'
                          : 'Rejected'}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-400">{formatDate(order.replacementRequest?.createdAt)}</p>
                  <p className="mt-1 text-sm text-slate-400">
                    {order.customerName} - {order.userEmail}
                  </p>
                </div>
                <div className="text-left lg:text-right">
                  <p className="text-sm tech-muted">Order Amount</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(order.total, order.currency)}</p>
                </div>
              </div>

              <div className="mt-5">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-cyan-200">
                  <RefreshCw className="h-4 w-4 text-cyan-300" />
                  Replacement Reason
                </div>
                <p className="text-slate-300">{order.replacementRequest?.reason}</p>
                {order.replacementRequest?.adminNotes && (
                  <div className="mt-3">
                    <p className="text-sm font-semibold text-cyan-200">Admin Notes:</p>
                    <p className="text-slate-300">{order.replacementRequest.adminNotes}</p>
                  </div>
                )}
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {order.items.map((item) => (
                  <div key={item.productId} className="rounded-2xl bg-slate-900/80 p-4 text-slate-300">
                    <p className="font-medium text-white">{item.name}</p>
                    <p className="text-sm text-slate-400">
                      {item.quantity} x {formatCurrency(item.unitPrice, order.currency)}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
