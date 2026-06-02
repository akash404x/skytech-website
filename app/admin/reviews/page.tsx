'use client';

import { collection, doc, onSnapshot, query, updateDoc, where, orderBy, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { Check, X, Star, Clock, AlertCircle, Trash2, Eye, Search, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { toast } from 'react-hot-toast';
import type { Review } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { toDate } from '@/lib/format';
import Image from 'next/image';

const ITEMS_PER_PAGE = 10;

export default function AdminReviewsPage() {
  const { isAdmin, isEditor, loading: authLoading } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setReviews(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Review)));
        setLoading(false);
      },
      (error) => {
        console.error('Error loading reviews:', error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const handleApprove = async (reviewId: string) => {
    try {
      await updateDoc(doc(db, 'reviews', reviewId), {
        status: 'approved',
        updatedAt: serverTimestamp(),
      });
      toast.success('Review approved');
    } catch (error) {
      console.error('Error approving review:', error);
      toast.error('Failed to approve review');
    }
  };

  const handleReject = async (reviewId: string) => {
    try {
      await updateDoc(doc(db, 'reviews', reviewId), {
        status: 'rejected',
        updatedAt: serverTimestamp(),
      });
      toast.success('Review rejected');
      setSelectedReview(null);
    } catch (error) {
      console.error('Error rejecting review:', error);
      toast.error('Failed to reject review');
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      await deleteDoc(doc(db, 'reviews', reviewId));
      toast.success('Review deleted');
      setSelectedReview(null);
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-medium">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium">
            <Check className="w-3 h-3" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
            <X className="w-3 h-3" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < rating
                ? 'fill-[#00bfff] text-[#00bfff]'
                : 'text-[#d6e4ff]/30'
            }`}
          />
        ))}
      </div>
    );
  };

  // Filter and search reviews
  const filteredReviews = useMemo(() => {
    let filtered = reviews;

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter((review) => review.status === filter);
    }

    // Apply search
    if (searchQuery.trim()) {
      const search = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (review) =>
          review.name?.toLowerCase().includes(search) ||
          review.designation?.toLowerCase().includes(search) ||
          review.productName?.toLowerCase().includes(search),
      );
    }

    return filtered;
  }, [reviews, filter, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredReviews.length / ITEMS_PER_PAGE);
  const paginatedReviews = filteredReviews.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // Reset to page 1 when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchQuery]);

  // Dashboard stats
  const stats = useMemo(() => ({
    total: reviews.length,
    pending: reviews.filter((r) => r.status === 'pending').length,
    approved: reviews.filter((r) => r.status === 'approved').length,
    rejected: reviews.filter((r) => r.status === 'rejected').length,
  }), [reviews]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!isEditor) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-slate-400">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="tech-heading-gradient text-3xl font-bold">Reviews</h1>
        <p className="mt-2 text-slate-300">Moderate customer reviews and testimonials</p>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="tech-glass-panel rounded-2xl p-6 border border-cyan-500/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Total Reviews</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.total}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-cyan-400" />
            </div>
          </div>
        </div>

        <div className="tech-glass-panel rounded-2xl p-6 border border-yellow-500/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Pending</p>
              <p className="text-3xl font-bold text-yellow-400 mt-1">{stats.pending}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="tech-glass-panel rounded-2xl p-6 border border-green-500/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Approved</p>
              <p className="text-3xl font-bold text-green-400 mt-1">{stats.approved}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
              <Check className="h-6 w-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="tech-glass-panel rounded-2xl p-6 border border-red-500/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Rejected</p>
              <p className="text-3xl font-bold text-red-400 mt-1">{stats.rejected}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center">
              <X className="h-6 w-6 text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-cyan-300" />
          <input
            type="search"
            placeholder="Search by name, designation, or product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="tech-input w-full rounded-3xl border border-cyan-500/20 bg-slate-900/80 pl-10 pr-4"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-xl font-medium text-sm transition-colors ${
                filter === status
                  ? 'bg-cyan-500/15 text-white ring-1 ring-cyan-400/20'
                  : 'text-slate-300 hover:bg-slate-900'
              }`}
            >
              {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews Table */}
      {loading ? (
        <div className="tech-glass-panel rounded-2xl p-8">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-900/50 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      ) : paginatedReviews.length === 0 ? (
        <div className="tech-glass-panel rounded-2xl p-12 text-center">
          <MessageSquare className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No reviews found</p>
        </div>
      ) : (
        <>
          <div className="tech-glass-panel overflow-hidden rounded-2xl">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead>
                  <tr className="border-b border-white/10 bg-slate-950/90 text-sm text-slate-300">
                    <th className="px-6 py-4 font-semibold text-white">Reviewer</th>
                    <th className="px-6 py-4 font-semibold text-white">Designation</th>
                    <th className="px-6 py-4 font-semibold text-white">Rating</th>
                    <th className="px-6 py-4 font-semibold text-white">Review</th>
                    <th className="px-6 py-4 font-semibold text-white">Type</th>
                    <th className="px-6 py-4 font-semibold text-white">Product</th>
                    <th className="px-6 py-4 font-semibold text-white">Date</th>
                    <th className="px-6 py-4 font-semibold text-white">Status</th>
                    <th className="px-6 py-4 font-semibold text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedReviews.map((review) => (
                    <tr key={review.id} className="border-b border-white/10 text-sm hover:bg-slate-900/80">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {review.profileImage ? (
                            <Image
                              src={review.profileImage}
                              alt={review.name}
                              width={32}
                              height={32}
                              className="w-8 h-8 rounded-full object-cover border border-cyan-500/20"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-cyan-500/20">
                              <span className="text-xs font-semibold text-cyan-300">
                                {review.name?.charAt(0).toUpperCase() || '?'}
                              </span>
                            </div>
                          )}
                          <p className="font-medium text-white">{review.name}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-300">{review.designation || '-'}</td>
                      <td className="px-6 py-4">{renderStars(review.rating)}</td>
                      <td className="px-6 py-4">
                        <p className="text-slate-300 line-clamp-2 max-w-xs">{review.content}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                          {review.reviewType === 'product' ? 'Product' : 'General'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-300">{review.productName || '-'}</td>
                      <td className="px-6 py-4 text-slate-400">
                        {review.createdAt ? toDate(review.createdAt)?.toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(review.status)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {review.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(review.id)}
                                className="rounded-xl p-2 text-green-400 hover:bg-slate-900/70"
                                title="Approve"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleReject(review.id)}
                                className="rounded-xl p-2 text-red-400 hover:bg-slate-900/70"
                                title="Reject"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => setSelectedReview(review)}
                            className="rounded-xl p-2 text-cyan-300 hover:bg-slate-900/70"
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(review.id)}
                            className="rounded-xl p-2 text-rose-400 hover:bg-slate-900/70"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-slate-400">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredReviews.length)} of {filteredReviews.length} reviews
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`rounded-lg px-3 py-1 text-sm font-medium ${
                      currentPage === i + 1
                        ? 'bg-cyan-500/15 text-white ring-1 ring-cyan-400/20'
                        : 'text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Review Detail Modal */}
      {selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="tech-glass-panel max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl">
            <div className="flex items-center justify-between border-b border-cyan-500/20 px-8 py-6">
              <h2 className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-2xl font-bold text-transparent">Review Details</h2>
              <button
                onClick={() => setSelectedReview(null)}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-slate-700 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              {/* User Profile */}
              <div className="flex items-center gap-4">
                {selectedReview.profileImage ? (
                  <Image
                    src={selectedReview.profileImage}
                    alt={selectedReview.name}
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-full object-cover border border-cyan-500/20"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center border border-cyan-500/20">
                    <span className="text-xl font-bold text-white">
                      {selectedReview.name?.charAt(0).toUpperCase() || '?'}
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-white">{selectedReview.name}</h3>
                  <p className="text-sm text-slate-400">{selectedReview.designation}</p>
                  <p className="text-xs text-slate-500 mt-1">{selectedReview.userEmail}</p>
                </div>
              </div>

              {/* Review Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-400 mb-2">Review Type</p>
                  <span className="text-sm font-medium px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                    {selectedReview.reviewType === 'product' ? 'Product Review' : 'General Review'}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-2">Rating</p>
                  <div>{renderStars(selectedReview.rating)}</div>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-2">Product</p>
                  <p className="font-medium text-white">{selectedReview.productName || 'General Review'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-2">Status</p>
                  {getStatusBadge(selectedReview.status)}
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-2">Submitted</p>
                  <p className="text-white">
                    {selectedReview.createdAt ? toDate(selectedReview.createdAt)?.toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                {selectedReview.verifiedPurchase && (
                  <div>
                    <p className="text-sm text-slate-400 mb-2">Purchase</p>
                    <span className="text-sm font-medium px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-300">
                      ✓ Verified
                    </span>
                  </div>
                )}
              </div>

              {/* Review Content */}
              <div className="border-t border-cyan-500/20 pt-6">
                <p className="text-sm text-slate-400 mb-3">Review Message</p>
                <p className="text-slate-300 leading-relaxed">{selectedReview.content}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 border-t border-cyan-500/20 pt-6">
                {selectedReview.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleApprove(selectedReview.id)}
                      className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-green-500/10 px-4 py-2.5 font-semibold text-green-300 border border-green-500/20 hover:bg-green-500/20 transition-colors"
                    >
                      <Check className="h-4 w-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(selectedReview.id)}
                      className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-red-500/10 px-4 py-2.5 font-semibold text-red-300 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                    >
                      <X className="h-4 w-4" />
                      Reject
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleDelete(selectedReview.id)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-red-500/10 px-4 py-2.5 font-semibold text-red-300 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
                <button
                  onClick={() => setSelectedReview(null)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-slate-700/50 px-4 py-2.5 font-semibold text-slate-300 border border-cyan-500/20 hover:bg-slate-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
