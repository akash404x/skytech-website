'use client';

import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { FileText, Download, RefreshCw, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { formatDate, formatCurrency } from '@/lib/format';
import type { Order } from '@/lib/types';

export default function InvoiceManagementPage() {
  const { user, loading: authLoading, getIdToken } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState<string | null>(null);
  const [resending, setResending] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = '/admin/access-denied';
      return;
    }

    if (!user) return;

    const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(50));
    const unsubscribe = onSnapshot(
      ordersQuery,
      (snapshot) => {
        const ordersData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Order));
        setOrders(ordersData);
        setLoading(false);
      },
      (error) => {
        console.error('Error loading orders:', error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user, authLoading]);

  const handleRegenerateInvoice = async (orderId: string) => {
    setRegenerating(orderId);
    try {
      const token = await getIdToken();
      const response = await fetch('/api/admin/invoices/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to regenerate invoice');
      toast.success('Invoice regenerated successfully');
    } catch (error) {
      console.error('Regenerate invoice error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to regenerate invoice');
    } finally {
      setRegenerating(null);
    }
  };

  const handleDownloadInvoice = async (orderId: string, invoiceUrl: string) => {
    try {
      window.open(invoiceUrl, '_blank');
    } catch (error) {
      console.error('Download invoice error:', error);
      toast.error('Failed to download invoice');
    }
  };

  const handleResendInvoice = async (orderId: string, userEmail: string) => {
    setResending(orderId);
    try {
      const token = await getIdToken();
      const response = await fetch('/api/admin/invoices/resend', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId, userEmail }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to resend invoice');
      toast.success('Invoice email sent successfully');
    } catch (error) {
      console.error('Resend invoice error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to resend invoice');
    } finally {
      setResending(null);
    }
  };

  if (authLoading || loading) {
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
            <h1 className="tech-heading-gradient text-3xl font-bold">Invoice Management</h1>
            <p className="mt-2 tech-text">Generate, download, and resend invoices for orders</p>
          </div>
        </div>

        <div className="tech-glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left">
              <thead>
                <tr className="tech-table-head">
                  <th className="py-3 pr-4 font-semibold">Date</th>
                  <th className="py-3 pr-4 font-semibold">Order</th>
                  <th className="py-3 pr-4 font-semibold">Customer</th>
                  <th className="py-3 pr-4 font-semibold">Invoice #</th>
                  <th className="py-3 pr-4 font-semibold">Amount</th>
                  <th className="py-3 pr-4 font-semibold">Status</th>
                  <th className="py-3 pr-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center tech-text">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="tech-table-row">
                      <td className="pr-4 tech-text">{formatDate(order.createdAt)}</td>
                      <td className="pr-4 font-medium text-white">{order.orderNumber}</td>
                      <td className="pr-4 tech-text">{order.customerName}</td>
                      <td className="pr-4 tech-text">{order.invoiceNumber || 'Not generated'}</td>
                      <td className="pr-4 font-semibold text-white">{formatCurrency(order.total, order.currency)}</td>
                      <td className="pr-4">
                        {order.invoiceUrl ? (
                          <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-semibold text-green-300">
                            Generated
                          </span>
                        ) : (
                          <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-semibold text-yellow-300">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="pr-4">
                        <div className="flex gap-2">
                          {order.invoiceUrl ? (
                            <>
                              <button
                                onClick={() => handleDownloadInvoice(order.id, order.invoiceUrl!)}
                                className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-2 text-cyan-300 transition hover:bg-cyan-500/20"
                                title="Download Invoice"
                              >
                                <Download className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleResendInvoice(order.id, order.userEmail)}
                                disabled={resending === order.id}
                                className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-2 text-blue-300 transition hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                                title="Resend Invoice Email"
                              >
                                <Send className="h-4 w-4" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleRegenerateInvoice(order.id)}
                              disabled={regenerating === order.id}
                              className="rounded-lg border border-green-500/30 bg-green-500/10 p-2 text-green-300 transition hover:bg-green-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                              title="Generate Invoice"
                            >
                              <FileText className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
