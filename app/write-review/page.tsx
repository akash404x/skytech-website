'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Send, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'react-hot-toast';

export default function WriteReviewPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) {
    router.push('/login');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (!content.trim()) {
      toast.error('Please write your review');
      return;
    }

    setIsSubmitting(true);

    try {
      await addDoc(collection(db, 'reviews'), {
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || 'Anonymous',
        rating,
        content: content.trim(),
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast.success('Review submitted! It will be visible after admin approval.');
      router.push('/');
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] py-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <Link href="/">
          <motion.button
            whileHover={{ x: -4 }}
            className="flex items-center gap-2 text-[#d6e4ff]/60 hover:text-[#00e5ff] transition-colors mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </motion.button>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Write a <span className="bg-gradient-to-r from-[#00bfff] to-[#00e5ff] bg-clip-text text-transparent">Review</span>
          </h1>
          <p className="text-lg text-[#d6e4ff]/70 mb-8">
            Share your experience with Sky Tech
          </p>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Rating */}
            <div className="p-6 rounded-2xl bg-[#06122d]/40 backdrop-blur-xl border border-[#00bfff]/10">
              <label className="block text-sm font-semibold text-white mb-4">
                Rating
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    type="button"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="relative"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= (hoverRating || rating)
                          ? 'fill-[#00bfff] text-[#00bfff]'
                          : 'text-[#d6e4ff]/30'
                      } transition-colors`}
                    />
                  </motion.button>
                ))}
              </div>
              <p className="text-sm text-[#d6e4ff]/60 mt-2">
                {rating > 0 ? `${rating} star${rating > 1 ? 's' : ''}` : 'Select a rating'}
              </p>
            </div>

            {/* Review Content */}
            <div className="p-6 rounded-2xl bg-[#06122d]/40 backdrop-blur-xl border border-[#00bfff]/10">
              <label htmlFor="content" className="block text-sm font-semibold text-white mb-4">
                Your Review
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your experience with Sky Tech products and services..."
                rows={6}
                className="w-full px-4 py-3 rounded-xl bg-[#020617]/50 border border-[#00bfff]/20 text-white placeholder-[#d6e4ff]/40 focus:outline-none focus:border-[#00bfff]/40 transition-colors resize-none"
                maxLength={500}
              />
              <p className="text-xs text-[#d6e4ff]/60 mt-2 text-right">
                {content.length}/500
              </p>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-[#00bfff] to-[#00e5ff] text-[#020617] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? (
                'Submitting...'
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submit Review
                </>
              )}
            </motion.button>
          </motion.form>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-6 p-4 rounded-xl bg-[#00bfff]/5 border border-[#00bfff]/10"
          >
            <p className="text-sm text-[#d6e4ff]/70">
              Your review will be submitted for admin approval. Once approved, it will be visible on the website.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
