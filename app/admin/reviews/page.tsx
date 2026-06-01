'use client';

import { collection, doc, onSnapshot, query, updateDoc, where, orderBy } from 'firebase/firestore';
import { Check, X, Star, Clock, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { toast } from 'react-hot-toast';
import type { Review } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/Skeleton';
import { toDate } from '@/lib/format';

export default function AdminReviewsPage() {
  const { profile } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

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
    } catch (error) {
      console.error('Error rejecting review:', error);
      toast.error('Failed to reject review');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs">
            <Check className="w-3 h-3" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            <X className="w-3 h-3" />
            Rejected
          </span>
        );
      default:
        return null;
    }
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
          <p className="text-[#d6e4ff]/70">Manage customer reviews and approve them for display</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                filter === status
                  ? 'bg-[#00bfff] text-[#020617]'
                  : 'bg-[#06122d]/40 text-[#d6e4ff]/70 hover:bg-[#06122d]/60'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12">
            <Star className="w-16 h-16 text-[#d6e4ff]/30 mx-auto mb-4" />
            <p className="text-[#d6e4ff]/70">No reviews found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="p-6 rounded-2xl bg-[#06122d]/40 backdrop-blur-xl border border-[#00bfff]/10"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* User Info */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00bfff]/20 to-[#00e5ff]/20 flex items-center justify-center border border-[#00bfff]/20">
                        <span className="text-sm font-semibold text-[#00e5ff]">
                          {review.userName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{review.userName}</h3>
                        <p className="text-xs text-[#d6e4ff]/60">{review.userEmail}</p>
                      </div>
                      {getStatusBadge(review.status)}
                    </div>

                    {/* Rating */}
                    <div className="flex gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? 'fill-[#00bfff] text-[#00bfff]'
                              : 'text-[#d6e4ff]/30'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Content */}
                    <p className="text-[#d6e4ff]/80 mb-3">{review.content}</p>

                    {/* Order Info */}
                    {review.orderNumber && (
                      <p className="text-xs text-[#d6e4ff]/50">
                        Order: {review.orderNumber}
                      </p>
                    )}

                    {/* Date */}
                    <p className="text-xs text-[#d6e4ff]/50 mt-2">
                      {review.createdAt ? toDate(review.createdAt)?.toLocaleDateString() : 'N/A'}
                    </p>
                  </div>

                  {/* Actions */}
                  {review.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(review.id)}
                        className="p-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 transition-colors"
                        title="Approve"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleReject(review.id)}
                        className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
                        title="Reject"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
