'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Star, Send, ArrowLeft, Upload, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { addDoc, collection, serverTimestamp, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'react-hot-toast';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { Order, OrderItem } from '@/lib/types';

const DESIGNATIONS = [
  'Student',
  'Software Developer',
  'Business Owner',
  'Entrepreneur',
  'Freelancer',
  'Electronics Engineer',
  'Consultant',
  'Manager',
  'Startup Founder',
  'Other',
  'Custom Designation'
];

function WriteReviewContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [fullName, setFullName] = useState('');
  const [designation, setDesignation] = useState('');
  const [customDesignation, setCustomDesignation] = useState('');
  const [content, setContent] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [purchasedProducts, setPurchasedProducts] = useState<Array<{id: string; name: string}>>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [reviewType, setReviewType] = useState<'general' | 'product'>('product');
  const [verifiedOrder, setVerifiedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  if (!user) {
    router.push('/login');
    return null;
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        // If orderId is provided, load verified purchase data
        if (orderId) {
          const orderRef = doc(db, 'orders', orderId);
          const orderSnap = await getDoc(orderRef);

          if (orderSnap.exists()) {
            const orderData = { id: orderSnap.id, ...orderSnap.data() } as Order;
            if (orderData.userId === user.uid) {
              setVerifiedOrder(orderData);
              setOrderItems(orderData.items || []);
              setReviewType('product');
              
              // Pre-select first product if available
              if (orderData.items && orderData.items.length > 0) {
                setSelectedProductId(orderData.items[0].productId);
              }
            }
          }
        } else {
          // Load all purchased products for general review
          const ordersQuery = query(
            collection(db, 'orders'),
            where('userId', '==', user.uid),
            where('status', '==', 'completed')
          );
          const ordersSnapshot = await getDocs(ordersQuery);
          
          const productMap = new Map<string, string>();
          ordersSnapshot.docs.forEach((doc) => {
            const order = doc.data();
            if (order.items && Array.isArray(order.items)) {
              order.items.forEach((item: any) => {
                if (item.productId) {
                  productMap.set(item.productId, item.name);
                }
              });
            }
          });

          setPurchasedProducts(Array.from(productMap).map(([id, name]) => ({ id, name })));
          setReviewType('product');
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.uid) {
      loadData();
    }
  }, [user?.uid, orderId]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setProfileImage(null);
    setProfileImagePreview('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.error('Please enter your full name');
      return;
    }

    if (!designation) {
      toast.error('Please select your designation');
      return;
    }

    if (designation === 'Custom Designation') {
      if (!customDesignation.trim()) {
        toast.error('Please enter your custom designation');
        return;
      }
      if (customDesignation.trim().length < 2) {
        toast.error('Custom designation must be at least 2 characters');
        return;
      }
      if (customDesignation.trim().length > 50) {
        toast.error('Custom designation must be less than 50 characters');
        return;
      }
    }

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (!content.trim()) {
      toast.error('Please write your review');
      return;
    }

    // Validate product selection only for product reviews
    if (reviewType === 'product' && !selectedProductId) {
      toast.error('Please select a product to review');
      return;
    }

    setIsSubmitting(true);

    try {
      let profileImageUrl = '';

      if (profileImage) {
        const storageRef = ref(storage, `review-profiles/${user.uid}-${Date.now()}`);
        await uploadBytes(storageRef, profileImage);
        profileImageUrl = await getDownloadURL(storageRef);
      }

      let productId = '';
      let productName = '';
      let orderNumber = '';

      if (reviewType === 'product') {
        productId = selectedProductId;
        
        if (verifiedOrder) {
          // From verified purchase
          const item = verifiedOrder.items.find(i => i.productId === selectedProductId);
          if (item) {
            productName = item.name;
          }
          orderNumber = verifiedOrder.orderNumber;
        } else {
          // From general product selection
          const selectedProduct = purchasedProducts.find(p => p.id === selectedProductId);
          if (selectedProduct) {
            productName = selectedProduct.name;
          }
        }
      }

      await addDoc(collection(db, 'reviews'), {
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || 'Anonymous',
        name: fullName,
        designation: designation === 'Custom Designation' ? customDesignation.trim() : designation,
        profileImage: profileImageUrl,
        productId: productId || null,
        productName: productName || null,
        orderId: verifiedOrder?.id || null,
        orderNumber: orderNumber || null,
        rating,
        content: content.trim(),
        review: content.trim(),
        reviewType,
        verifiedPurchase: !!verifiedOrder,
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00bfff]"></div>
      </div>
    );
  }

  const availableProducts = reviewType === 'product' && verifiedOrder ? orderItems : purchasedProducts;
  const showNoProductsMessage = reviewType === 'product' && availableProducts.length === 0 && !verifiedOrder;

  return (
    <div className="min-h-screen bg-[#020617] py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href={orderId ? '/orders' : '/'}>
          <motion.button
            whileHover={{ x: -4 }}
            className="flex items-center gap-2 text-[#d6e4ff]/60 hover:text-[#00e5ff] transition-colors mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            {orderId ? 'Back to Orders' : 'Back to Home'}
          </motion.button>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            Share Your <span className="bg-gradient-to-r from-[#00bfff] to-[#00e5ff] bg-clip-text text-transparent">Experience</span>
          </h1>
          
          {verifiedOrder ? (
            <div className="flex items-center gap-2 mb-8">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/40 text-green-400 text-sm font-semibold">
                ✓ Verified Purchase
              </span>
              <p className="text-[#d6e4ff]/70">Order #{verifiedOrder.orderNumber}</p>
            </div>
          ) : (
            <p className="text-lg text-[#d6e4ff]/70 mb-8">
              Help other innovators discover the quality of Sky Tech
            </p>
          )}

          {showNoProductsMessage ? (
            <div className="p-8 rounded-2xl bg-[#06122d]/40 backdrop-blur-xl border border-[#d6a600]/20 text-center">
              <p className="text-[#d6e4ff]/70 mb-6">
                You haven't purchased any products yet. Browse our catalog or submit a general review.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/products">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-[#00bfff] to-[#00e5ff] text-[#020617] hover:shadow-lg transition-all"
                  >
                    Browse Products
                  </motion.button>
                </Link>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setReviewType('general')}
                  className="px-6 py-3 rounded-xl font-semibold text-white border-2 border-[#00bfff]/40 hover:bg-[#00bfff]/10 transition-all"
                >
                  Write General Review
                </motion.button>
              </div>
            </div>
          ) : (
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {!verifiedOrder && (
                <>
                  {/* Review Type Selector */}
                  <div className="p-6 rounded-2xl bg-[#06122d]/40 backdrop-blur-xl border border-[#00bfff]/10">
                    <label className="block text-sm font-semibold text-white mb-4">
                      Review Type
                    </label>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => {
                          setReviewType('product');
                          setSelectedProductId('');
                        }}
                        className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                          reviewType === 'product'
                            ? 'bg-[#00bfff]/20 border-2 border-[#00bfff] text-[#00bfff]'
                            : 'bg-[#020617]/50 border-2 border-[#00bfff]/20 text-[#d6e4ff]/70 hover:border-[#00bfff]/40'
                        }`}
                      >
                        Product Review
                      </button>
                      <button
                        type="button"
                        onClick={() => setReviewType('general')}
                        className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                          reviewType === 'general'
                            ? 'bg-[#00bfff]/20 border-2 border-[#00bfff] text-[#00bfff]'
                            : 'bg-[#020617]/50 border-2 border-[#00bfff]/20 text-[#d6e4ff]/70 hover:border-[#00bfff]/40'
                        }`}
                      >
                        General Review
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Full Name */}
              <div className="p-6 rounded-2xl bg-[#06122d]/40 backdrop-blur-xl border border-[#00bfff]/10">
                <label htmlFor="fullName" className="block text-sm font-semibold text-white mb-3">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 rounded-xl bg-[#020617]/50 border border-[#00bfff]/20 focus:outline-none focus:border-[#00bfff]/40 transition-colors"
                />
              </div>

              {/* Designation */}
              <div className="p-6 rounded-2xl bg-[#06122d]/40 backdrop-blur-xl border border-[#00bfff]/10">
                <label htmlFor="designation" className="block text-sm font-semibold text-white mb-3">
                  Designation / Profession <span className="text-red-400">*</span>
                </label>
                <select
                  id="designation"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#020617]/50 border border-[#00bfff]/20 focus:outline-none focus:border-[#00bfff]/40 transition-colors appearance-none cursor-pointer"
                >
                  <option value="">Select your designation</option>
                  {DESIGNATIONS.map((d) => (
                    <option key={d} value={d} className="bg-[#020617]">
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Custom Designation Input */}
              {designation === 'Custom Designation' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-6 rounded-2xl bg-[#06122d]/40 backdrop-blur-xl border border-[#00bfff]/10"
                >
                  <label htmlFor="customDesignation" className="block text-sm font-semibold text-white mb-3">
                    Enter Your Designation <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="customDesignation"
                    type="text"
                    value={customDesignation}
                    onChange={(e) => setCustomDesignation(e.target.value)}
                    placeholder="e.g. AI Engineer, Content Creator, YouTuber, Investor, Teacher"
                    className="w-full px-4 py-3 rounded-xl bg-[#020617]/50 border border-[#00e5ff] focus:outline-none focus:border-[#00e5ff] focus:shadow-[0_0_15px_rgba(0,229,255,0.3)] transition-all placeholder-[#9ccbff] text-[#39ff14]"
                    minLength={2}
                    maxLength={50}
                  />
                  <p className="text-xs text-[#d6e4ff]/60 mt-2">
                    {customDesignation.length}/50 characters (minimum 2)
                  </p>
                </motion.div>
              )}

              {/* Product Selection - Only for product reviews */}
              {reviewType === 'product' && (
                <div className="p-6 rounded-2xl bg-[#06122d]/40 backdrop-blur-xl border border-[#00bfff]/10">
                  <label htmlFor="product" className="block text-sm font-semibold text-white mb-3">
                    Select Product <span className="text-red-400">*</span>
                  </label>
                  {verifiedOrder ? (
                    <div className="space-y-2">
                      {orderItems.map((item) => (
                        <button
                          key={item.productId}
                          type="button"
                          onClick={() => setSelectedProductId(item.productId)}
                          className={`w-full px-4 py-3 rounded-lg text-left font-medium transition-all ${
                            selectedProductId === item.productId
                              ? 'bg-[#00bfff]/20 border-2 border-[#00bfff] text-white'
                              : 'bg-[#020617]/50 border-2 border-[#00bfff]/20 text-[#d6e4ff]/70 hover:border-[#00bfff]/40'
                          }`}
                        >
                          {item.name}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <select
                      id="product"
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[#020617]/50 border border-[#00bfff]/20 focus:outline-none focus:border-[#00bfff]/40 transition-colors appearance-none cursor-pointer"
                    >
                      <option value="">Select a product you purchased</option>
                      {purchasedProducts.map((product) => (
                        <option key={product.id} value={product.id} className="bg-[#020617]">
                          {product.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {/* Rating */}
              <div className="p-6 rounded-2xl bg-[#06122d]/40 backdrop-blur-xl border border-[#00bfff]/10">
                <label className="block text-sm font-semibold text-white mb-4">
                  Rating <span className="text-red-400">*</span>
                </label>
                <div className="flex gap-3">
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
                        className={`w-10 h-10 ${
                          star <= (hoverRating || rating)
                            ? 'fill-[#00bfff] text-[#00bfff]'
                            : 'text-[#d6e4ff]/30'
                        } transition-colors`}
                      />
                    </motion.button>
                  ))}
                </div>
                <p className="text-sm text-[#d6e4ff]/60 mt-3">
                  {rating > 0 ? `You rated: ${rating} star${rating > 1 ? 's' : ''}` : 'Select a rating'}
                </p>
              </div>

              {/* Review Message */}
              <div className="p-6 rounded-2xl bg-[#06122d]/40 backdrop-blur-xl border border-[#00bfff]/10">
                <label htmlFor="content" className="block text-sm font-semibold text-white mb-4">
                  Your Review <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={reviewType === 'product' ? 'Share your detailed experience with this product...' : 'Share your general experience with Sky Tech...'}
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl bg-[#020617]/50 border border-[#00bfff]/20 focus:outline-none focus:border-[#00bfff]/40 transition-colors resize-none"
                  maxLength={1000}
                />
                <p className="text-xs text-[#d6e4ff]/60 mt-2 text-right">
                  {content.length}/1000
                </p>
              </div>

              {/* Profile Photo */}
              <div className="p-6 rounded-2xl bg-[#06122d]/40 backdrop-blur-xl border border-[#00bfff]/10">
                <label className="block text-sm font-semibold text-white mb-4">
                  Profile Photo <span className="text-xs text-[#d6e4ff]/60">(Optional)</span>
                </label>
                
                {!profileImagePreview ? (
                  <div className="border-2 border-dashed border-[#00bfff]/20 rounded-xl p-8 text-center hover:border-[#00bfff]/40 transition-colors">
                    <input
                      type="file"
                      id="profileImage"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <label htmlFor="profileImage" className="cursor-pointer flex flex-col items-center gap-3">
                      <Upload className="w-8 h-8 text-[#00bfff]/40" />
                      <div>
                        <p className="text-white font-medium">Upload a photo</p>
                        <p className="text-xs text-[#d6e4ff]/60">PNG, JPG up to 5MB</p>
                      </div>
                    </label>
                  </div>
                ) : (
                  <div className="relative inline-block">
                    <img
                      src={profileImagePreview}
                      alt="Preview"
                      className="w-32 h-32 rounded-xl object-cover border border-[#00bfff]/20"
                    />
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-3 -right-3 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  </div>
                )}
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
          )}

          {/* Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg"
          >
            <p className="text-sm text-blue-200">
              💡 <span className="font-semibold">All reviews</span> require admin approval before appearing publicly on our website.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default function WriteReviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00bfff]"></div>
      </div>
    }>
      <WriteReviewContent />
    </Suspense>
  );
}
