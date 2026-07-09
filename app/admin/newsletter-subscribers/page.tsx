'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Trash2, Download, Loader2, Mail, Calendar, MapPin, Globe } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Subscriber {
  id: string;
  email: string;
  subscribedAt?: any;
  createdAt?: any;
  status?: string;
  source?: string;
  ip?: string;
  userAgent?: string;
}

export default function NewsletterSubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [deleting, setDeleting] = useState<Set<string>>(new Set());

  useEffect(() => {
    console.log('Reading from collection: newsletter_subscribers');
    const subscribersQuery = query(
      collection(db, 'newsletter_subscribers'),
      orderBy('subscribedAt', 'desc')
    );
    const unsubscribe = onSnapshot(
      subscribersQuery,
      (snapshot) => {
        console.log('Number of documents returned:', snapshot.size);
        const subscribersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Subscriber[];
        console.log('Subscribers data:', subscribersData);
        setSubscribers(subscribersData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching subscribers:', error);
        toast.error('Failed to load subscribers');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const filteredSubscribers = subscribers.filter(sub => 
    sub.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeSubscribers = subscribers.filter(sub => sub.status === 'active' || !sub.status);
  const totalPages = Math.ceil(filteredSubscribers.length / itemsPerPage);
  const paginatedSubscribers = filteredSubscribers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subscriber?')) {
      return;
    }

    setDeleting(prev => new Set(prev).add(id));
    try {
      await deleteDoc(doc(db, 'newsletter_subscribers', id));
      toast.success('Subscriber deleted successfully');
    } catch (error) {
      console.error('Error deleting subscriber:', error);
      toast.error('Failed to delete subscriber');
    } finally {
      setDeleting(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleExportCSV = () => {
    const headers = ['Email', 'Subscribed At', 'Status', 'Source', 'IP', 'User Agent'];
    const rows = filteredSubscribers.map(sub => [
      sub.email,
      (sub.subscribedAt || sub.createdAt) ? new Date((sub.subscribedAt || sub.createdAt).seconds * 1000).toLocaleDateString() : 'N/A',
      sub.status || 'active',
      sub.source || 'N/A',
      sub.ip || 'N/A',
      sub.userAgent || 'N/A',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('CSV exported successfully');
  };

  return (
    <div className="min-h-screen bg-[#020617]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Newsletter Subscribers</h1>
          <p className="text-gray-400">Manage your newsletter subscribers</p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          <div className="bg-slate-800/50 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                <Users className="h-6 w-6 text-cyan-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{subscribers.length}</p>
                <p className="text-sm text-gray-400">Total Subscribers</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800/50 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                <Mail className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{activeSubscribers.length}</p>
                <p className="text-sm text-gray-400">Active Subscribers</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800/50 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {subscribers.length > 0 
                    ? new Date(subscribers[0].subscribedAt?.seconds * 1000).toLocaleDateString()
                    : 'N/A'
                  }
                </p>
                <p className="text-sm text-gray-400">Latest Subscription</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800/50 border border-white/10 rounded-xl p-6 mb-6"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search by email..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-900/50 border border-white/10 text-white placeholder-gray-500 focus:border-cyan-500/30 focus:outline-none"
              />
            </div>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-400 text-black font-semibold hover:opacity-90 transition-opacity"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          </div>
        </motion.div>

        {/* Subscribers Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-800/50 border border-white/10 rounded-xl overflow-hidden"
        >
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
            </div>
          ) : filteredSubscribers.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              No subscribers found
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-900/50 border-b border-white/10">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Subscribed At
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Source
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        IP
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {paginatedSubscribers.map((subscriber) => (
                      <tr key={subscriber.id} className="hover:bg-slate-900/30 transition">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-white">{subscriber.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-400">
                            {(subscriber.subscribedAt || subscriber.createdAt)
                              ? new Date((subscriber.subscribedAt || subscriber.createdAt).seconds * 1000).toLocaleDateString()
                              : 'N/A'
                            }
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            subscriber.status === 'active' || !subscriber.status
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {subscriber.status || 'active'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-400 capitalize">{subscriber.source}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-400">{subscriber.ip || 'N/A'}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => handleDelete(subscriber.id)}
                            disabled={deleting.has(subscriber.id)}
                            className="text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
                          >
                            {deleting.has(subscriber.id) ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
                  <p className="text-sm text-gray-400">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                    {Math.min(currentPage * itemsPerPage, filteredSubscribers.length)} of{' '}
                    {filteredSubscribers.length} subscribers
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 rounded-lg bg-slate-900/50 border border-white/10 text-white text-sm hover:bg-slate-900/70 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1 text-sm text-gray-400">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 rounded-lg bg-slate-900/50 border border-white/10 text-white text-sm hover:bg-slate-900/70 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
