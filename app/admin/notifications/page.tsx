'use client';

import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { Bell, BellCheck, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { formatDate } from '@/lib/format';
import type { NotificationLog } from '@/lib/types';

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = '/admin/access-denied';
      return;
    }

    if (!user) return;

    const notificationsQuery = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'), limit(100));
    const unsubscribe = onSnapshot(
      notificationsQuery,
      (snapshot) => {
        const notificationsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as NotificationLog));
        setNotifications(notificationsData);
        setLoading(false);
      },
      (error) => {
        console.error('Error loading notifications:', error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user, authLoading]);

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
            <h1 className="tech-heading-gradient text-3xl font-bold">Notification Logs</h1>
            <p className="mt-2 tech-text">View all system notifications sent to customers</p>
          </div>
        </div>

        <div className="tech-glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead>
                <tr className="tech-table-head">
                  <th className="py-3 pr-4 font-semibold">Date</th>
                  <th className="py-3 pr-4 font-semibold">Recipient</th>
                  <th className="py-3 pr-4 font-semibold">Type</th>
                  <th className="py-3 pr-4 font-semibold">Order</th>
                  <th className="py-3 pr-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {notifications.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center tech-text">
                      No notifications found
                    </td>
                  </tr>
                ) : (
                  notifications.map((notification) => (
                    <tr key={notification.id} className="tech-table-row">
                      <td className="pr-4 tech-text">{formatDate(notification.createdAt)}</td>
                      <td className="pr-4 font-medium text-white">{notification.userEmail}</td>
                      <td className="pr-4 tech-text">
                        {notification.type.replace(/_/g, ' ').toUpperCase()}
                      </td>
                      <td className="pr-4 tech-text">{notification.orderNumber || '-'}</td>
                      <td className="pr-4">
                        {notification.status === 'sent' ? (
                          <span className="flex items-center gap-2 rounded-full bg-green-500/20 px-3 py-1 text-xs font-semibold text-green-300">
                            <BellCheck className="h-3 w-3" />
                            Sent
                          </span>
                        ) : (
                          <span className="flex items-center gap-2 rounded-full bg-red-500/20 px-3 py-1 text-xs font-semibold text-red-300">
                            <X className="h-3 w-3" />
                            Failed
                          </span>
                        )}
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
