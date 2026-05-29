'use client';

import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { Mail, MailCheck, MailX, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { formatDate } from '@/lib/format';
import type { EmailLog } from '@/lib/types';

export default function EmailLogsPage() {
  const { user, loading: authLoading } = useAuth();
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = '/admin/access-denied';
      return;
    }

    if (!user) return;

    const logsQuery = query(collection(db, 'emailLogs'), orderBy('createdAt', 'desc'), limit(100));
    const unsubscribe = onSnapshot(
      logsQuery,
      (snapshot) => {
        const logsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as EmailLog));
        setEmailLogs(logsData);
        setLoading(false);
      },
      (error) => {
        console.error('Error loading email logs:', error);
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
            <h1 className="tech-heading-gradient text-3xl font-bold">Email Logs</h1>
            <p className="mt-2 tech-text">View all email notifications sent to customers</p>
          </div>
        </div>

        <div className="tech-glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead>
                <tr className="tech-table-head">
                  <th className="py-3 pr-4 font-semibold">Date</th>
                  <th className="py-3 pr-4 font-semibold">Recipient</th>
                  <th className="py-3 pr-4 font-semibold">Subject</th>
                  <th className="py-3 pr-4 font-semibold">Template</th>
                  <th className="py-3 pr-4 font-semibold">Order</th>
                  <th className="py-3 pr-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {emailLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center tech-text">
                      No email logs found
                    </td>
                  </tr>
                ) : (
                  emailLogs.map((log) => (
                    <tr key={log.id} className="tech-table-row">
                      <td className="pr-4 tech-text">{formatDate(log.createdAt)}</td>
                      <td className="pr-4 font-medium text-white">{log.userEmail}</td>
                      <td className="pr-4 tech-text">{log.subject}</td>
                      <td className="pr-4 tech-text">{log.template}</td>
                      <td className="pr-4 tech-text">{log.orderNumber || '-'}</td>
                      <td className="pr-4">
                        {log.status === 'sent' ? (
                          <span className="flex items-center gap-2 rounded-full bg-green-500/20 px-3 py-1 text-xs font-semibold text-green-300">
                            <MailCheck className="h-3 w-3" />
                            Sent
                          </span>
                        ) : (
                          <span className="flex items-center gap-2 rounded-full bg-red-500/20 px-3 py-1 text-xs font-semibold text-red-300">
                            <MailX className="h-3 w-3" />
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
