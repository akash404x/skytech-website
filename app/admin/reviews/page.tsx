'use client';

import { collection, doc, onSnapshot, query, updateDoc, where, orderBy, deleteDoc } from 'firebase/firestore';
import { Check, X, Star, Clock, AlertCircle, Trash2, Eye } from 'lucide-react';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { toast } from 'react-hot-toast';
import type { Review } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { toDate } from '@/lib/format';
import Image from 'next/image';

export default function AdminReviewsPage() {
  const { profile } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  useEffect(() => {
    let q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
    
    if (filter !== 'all') {
      q = query(collection(db, 'reviews'), where('status', '==', filter), orderBy('createdAt', 'desc'));
    }

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
  }, [filter]);

  const handleApprove = async (reviewId: string) => {
    try {
      await updateDoc(doc(db, 'reviews', reviewId), {
        status: 'approved',
        updatedAt: new Date(),
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
        updatedAt: new Date(),
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

  if (!profile || (profile.role !== 'admin' && profile.role !== 'editor')) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#020617]">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-[#d6e4ff]/70">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Reviews Management</h1>
          <p className="text-[#d6e4ff]/70">Review and approve customer feedback</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {(['pending', 'approved', 'rejected', 'all'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                filter === status
                  ? 'bg-[#00bfff] text-[#020617]'
                  : 'bg-[#06122d]/40 text-[#d6e4ff]/70 hover:bg-[#06122d]/60'
              }`}
            >
              {status === 'all' ? 'All Reviews' : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-[#06122d]/40 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12">
            <Star className="w-16 h-16 text-[#d6e4ff]/30 mx-auto mb-4" />
            <p className="text-[#d6e4ff]/70">No reviews found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto rounded-2xl border border-[#00bfff]/10 bg-[#06122d]/20">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#00bfff]/10 bg-[#06122d]/40">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#00bfff]">User</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#00bfff]">Type</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#00bfff]">Product</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-[#00bfff]">Rating</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#00bfff]">Review</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#00bfff]">Date</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-[#00bfff]">Status</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-[#00bfff]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((review) => (
                    <tr key={review.id} className="border-b border-[#00bfff]/5 hover:bg-[#00bfff]/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {review.profileImage ? (
                            <Image
                              src={review.profileImage}
                              alt={review.name}
                              width={40}
                              height={40}
                              className="w-10 h-10 rounded-full object-cover border border-[#00bfff]/20"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00bfff]/20 to-[#00e5ff]/20 flex items-center justify-center border border-[#00bfff]/20">
                              <span className="text-xs font-semibold text-[#00e5ff]">
                                {review.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-white">{review.name}</p>
                            <p className="text-xs text-[#d6e4ff]/50">{review.userEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium px-2 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                            {review.reviewType === 'product' ? 'Product' : 'General'}
                          </span>
                          {review.verifiedPurchase && (
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-300">✓ Verified</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-[#d6e4ff]/80">{review.productName || 'General'}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {renderStars(review.rating)}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-[#d6e4ff]/70 line-clamp-2 max-w-xs">{review.content}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-[#d6e4ff]/60">
                          {review.createdAt ? toDate(review.createdAt)?.toLocaleDateString() : 'N/A'}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getStatusBadge(review.status)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => setSelectedReview(review)}
                          className="p-2 rounded-lg bg-[#00bfff]/10 border border-[#00bfff]/20 text-[#00bfff] hover:bg-[#00bfff]/20 transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="p-4 rounded-xl bg-[#06122d]/40 backdrop-blur-xl border border-[#00bfff]/10"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      {review.profileImage ? (
                        <Image
                          src={review.profileImage}
                          alt={review.name}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full object-cover border border-[#00bfff]/20"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00bfff]/20 to-[#00e5ff]/20 flex items-center justify-center border border-[#00bfff]/20">
                          <span className="text-xs font-semibold text-[#00e5ff]">
                            {review.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-white">{review.name}</p>
                        <p className="text-xs text-[#d6e4ff]/50">{review.designation}</p>
                      </div>
                    </div>
                    {getStatusBadge(review.status)}
                  </div>

                  <div className="space-y-2 mb-3">
                    <div>
                      <p className="text-xs text-[#d6e4ff]/50">Type & Status</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                          {review.reviewType === 'product' ? 'Product' : 'General'}
                        </span>
                        {review.verifiedPurchase && (
                          <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-300">✓ Verified</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-[#d6e4ff]/50">Product</p>
                      <p className="text-sm text-[#d6e4ff]/80">{review.productName || 'General'}</p>
                    </div>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs text-[#d6e4ff]/50">Rating</p>
                        <div className="mt-1">{renderStars(review.rating)}</div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-[#d6e4ff]/50">Date</p>
                        <p className="text-xs text-[#d6e4ff]/80">
                          {review.createdAt ? toDate(review.createdAt)?.toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-[#d6e4ff]/50 mb-1">Review</p>
                      <p className="text-sm text-[#d6e4ff]/70">{review.content}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedReview(review)}
                    className="w-full px-4 py-2 rounded-lg font-medium text-sm bg-[#00bfff]/10 border border-[#00bfff]/20 text-[#00bfff] hover:bg-[#00bfff]/20 transition-colors"
                  >
                    View & Manage
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Review Detail Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#06122d]/95 backdrop-blur-xl border border-[#00bfff]/20 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 p-6 border-b border-[#00bfff]/10 bg-[#06122d]/95 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Review Details</h2>
              <button
                onClick={() => setSelectedReview(null)}
                className="text-[#d6e4ff]/60 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* User Profile */}
              <div className="flex items-center gap-4">
                {selectedReview.profileImage ? (
                  <Image
                    src={selectedReview.profileImage}
                    alt={selectedReview.name}
                    width={60}
                    height={60}
                    className="w-16 h-16 rounded-full object-cover border border-[#00bfff]/20"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00bfff] to-[#00e5ff] flex items-center justify-center border border-[#00bfff]/20">
                    <span className="text-xl font-bold text-[#020617]">
                      {selectedReview.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-white">{selectedReview.name}</h3>
                  <p className="text-sm text-[#d6e4ff]/70">{selectedReview.designation}</p>
                  <p className="text-xs text-[#d6e4ff]/60 mt-1">{selectedReview.userEmail}</p>
                </div>
              </div>

              {/* Review Type & Verified Badge */}
              <div className="flex items-center gap-3 p-4 bg-[#00bfff]/5 rounded-lg border border-[#00bfff]/20">
                <div className="flex-1">
                  <p className="text-sm text-[#d6e4ff]/60 mb-2">Review Type</p>
                  <span className="text-sm font-medium px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300">
                    {selectedReview.reviewType === 'product' ? 'Product Review' : 'General Review'}
                  </span>
                </div>
                {selectedReview.verifiedPurchase && (
                  <div>
                    <p className="text-sm text-[#d6e4ff]/60 mb-2">Purchase Status</p>
                    <span className="text-sm font-medium px-3 py-1 rounded-full bg-green-500/20 border border-green-500/40 text-green-300 flex items-center gap-1">
                      ✓ Verified Purchase
                    </span>
                  </div>
                )}
              </div>

              {/* Product & Rating */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-[#d6e4ff]/60 mb-2">Product</p>
                  <p className="font-medium text-white">{selectedReview.productName || 'General Review'}</p>
                </div>
                <div>
                  <p className="text-sm text-[#d6e4ff]/60 mb-2">Rating</p>
                  <div>{renderStars(selectedReview.rating)}</div>
                </div>
              </div>

              {/* Date & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-[#d6e4ff]/60 mb-2">Submitted</p>
                  <p className="text-white">
                    {selectedReview.createdAt ? toDate(selectedReview.createdAt)?.toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#d6e4ff]/60 mb-2">Status</p>
                  {getStatusBadge(selectedReview.status)}
                </div>
              </div>

              {/* Review Content */}
              <div className="border-t border-[#00bfff]/10 pt-6">
                <p className="text-sm text-[#d6e4ff]/60 mb-3">Review Message</p>
                <p className="text-[#d6e4ff]/90 leading-relaxed">{selectedReview.content}</p>
              </div>

              {/* Actions */}
              <div className="border-t border-[#00bfff]/10 pt-6 flex gap-3">
                {selectedReview.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleApprove(selectedReview.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-white bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 transition-colors"
                    >
                      <Check className="w-5 h-5" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(selectedReview.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-white bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                    >
                      <X className="w-5 h-5" />
                      Reject
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleDelete(selectedReview.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-white bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                  Delete
                </button>
                <button
                  onClick={() => setSelectedReview(null)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-white bg-[#06122d]/40 border border-[#00bfff]/20 hover:bg-[#06122d]/60 transition-colors"
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
