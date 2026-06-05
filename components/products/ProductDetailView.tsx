'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, Minus, Package, Plus, ShoppingCart, Star } from 'lucide-react';
import { doc, onSnapshot, collection, query, where, orderBy } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import PremiumProductCard from '@/components/products/PremiumProductCard';
import ProductGallery from '@/components/products/ProductGallery';
import EmptyState from '@/components/EmptyState';
import AnimatedButton from '@/components/ui/AnimatedButton';
import { Skeleton } from '@/components/ui/Skeleton';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProducts } from '@/hooks/useProducts';
import { db } from '@/lib/firebase';
import { formatCurrency } from '@/lib/format';
import { getProductPrice } from '@/lib/cart';
import { mapProduct } from '@/lib/firestore-mappers';
import type { Product, Review } from '@/lib/types';

export default function ProductDetailView() {
  const params = useParams();
  const router = useRouter();
  const productId = typeof params.id === 'string' ? params.id : '';
  const { addItem } = useCart();
  const { user } = useAuth();
  const { products: allProducts, loading: catalogLoading } = useProducts({ activeOnly: true });

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      return undefined;
    }

    const unsubscribe = onSnapshot(
      doc(db, 'products', productId),
      (snapshot) => {
        if (!snapshot.exists()) {
          setProduct(null);
          setLoading(false);
          return;
        }
        const mapped = mapProduct(snapshot.id, snapshot.data());
        if (mapped.status !== 'active') {
          setProduct(null);
        } else {
          setProduct(mapped);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error loading product:', error);
        setProduct(null);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [productId]);

  useEffect(() => {
    if (!productId) {
      setLoadingReviews(false);
      return undefined;
    }

    const reviewsQuery = query(
      collection(db, 'reviews'),
      where('productId', '==', productId),
      where('status', '==', 'approved')
    );

    const unsubscribe = onSnapshot(
      reviewsQuery,
      (snapshot) => {
        const reviewsData = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() } as Review))
          .sort((a, b) => {
            const toTimestamp = (dateValue: Review['createdAt']): number => {
              if (!dateValue) return 0;
              if (typeof dateValue === 'number') return dateValue;
              if (dateValue instanceof Date) return dateValue.getTime();
              if (typeof dateValue === 'string') return new Date(dateValue).getTime();
              if (typeof dateValue === 'object' && 'toDate' in dateValue) return dateValue.toDate().getTime();
              if (typeof dateValue === 'object' && 'seconds' in dateValue) return dateValue.seconds * 1000;
              return 0;
            };
            return toTimestamp(b.createdAt) - toTimestamp(a.createdAt);
          });
        setReviews(reviewsData);
        setLoadingReviews(false);
      },
      (error) => {
        console.error('Error loading reviews:', error);
        setLoadingReviews(false);
      },
    );

    return () => unsubscribe();
  }, [productId]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return allProducts
      .filter((p) => p.id !== product.id && p.category === product.category)
      .slice(0, 4);
  }, [allProducts, product]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Skeleton className="mb-8 h-10 w-48" />
        <div className="grid gap-10 lg:grid-cols-2">
          <Skeleton className="aspect-square w-full" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <EmptyState
          icon={Package}
          title="Product not found"
          description="This product may be unavailable or was removed."
        />
        <div className="mt-8 text-center">
          <Link href="/products" className="tech-link">
            Back to products
          </Link>
        </div>
      </div>
    );
  }

  const salePrice = getProductPrice(product);
  const hasDiscount = salePrice < product.price;
  const discount = hasDiscount ? Math.round(((product.price - salePrice) / product.price) * 100) : 0;

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast.success(`Added ${quantity} to cart`);
    router.push('/cart');
  };

  return (
    <div className="relative">
      <div className="tech-section-backdrop pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative z-[1] mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
          <Link
            href="/products"
            className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-blue-300 transition hover:text-cyan-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Link>
        </motion.div>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            <ProductGallery images={product.images} alt={product.name} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="tech-glass-card flex flex-col p-6 md:p-8"
          >
            <span className="text-sm font-medium uppercase tracking-wide text-cyan-300/90">{product.category}</span>
            <h1 className="tech-heading-gradient mt-2 text-3xl font-bold md:text-4xl">{product.name}</h1>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="flex items-center rounded-lg bg-green-600/90 px-3 py-1 text-sm font-semibold text-white">
                <Star className="mr-1 h-4 w-4 fill-current" />
                {product.rating.toFixed(1)}
              </div>
              {hasDiscount && (
                <span className="rounded-full bg-blue-600/30 px-3 py-1 text-sm font-bold text-cyan-200">
                  {discount}% OFF
                </span>
              )}
              <span className={`text-sm font-medium ${product.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </span>
            </div>

            <div className="mt-6 flex flex-wrap items-baseline gap-3">
              <span className="text-3xl font-bold text-white">{formatCurrency(salePrice)}</span>
              {hasDiscount && <span className="text-lg tech-muted line-through">{formatCurrency(product.price)}</span>}
            </div>

            <p className="mt-6 leading-relaxed tech-text">{product.description}</p>

            <ul className="mt-6 space-y-2">
              {['Quality tested components', 'Fast shipping across India', 'Expert SkyTech support'].map((item) => (
                <li key={item} className="flex items-center text-sm tech-text">
                  <CheckCircle className="mr-2 h-4 w-4 shrink-0 text-green-400" />
                  {item}
                </li>
              ))}
            </ul>

            {product.stock > 0 && (
              <div className="mt-8 flex items-center gap-4">
                <span className="text-sm font-medium text-slate-300">Quantity</span>
                <div className="flex items-center rounded-lg border border-white/15">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-2.5 text-slate-300 hover:bg-white/5"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="min-w-10 text-center font-semibold text-white">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="p-2.5 text-slate-300 hover:bg-white/5"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <AnimatedButton
                type="button"
                disabled={product.stock <= 0}
                onClick={handleAddToCart}
                className="hero-cta-btn flex flex-1 items-center justify-center gap-2 px-6 py-3.5 disabled:opacity-50"
              >
                <ShoppingCart className="h-5 w-5" />
                Add to Cart
              </AnimatedButton>
              <AnimatedButton
                type="button"
                onClick={() => router.push('/cart')}
                className="flex flex-1 items-center justify-center rounded-full border border-purple-400/40 bg-purple-600/20 px-6 py-3.5 font-semibold text-white hover:border-purple-300/50 hover:bg-purple-600/30"
              >
                View Cart
              </AnimatedButton>
            </div>
          </motion.div>
        </div>

        {(relatedProducts.length > 0 || catalogLoading) && (
          <section className="mt-20 border-t border-white/10 pt-16">
            <h2 className="tech-heading-gradient mb-8 text-2xl font-bold md:text-3xl">Related Products</h2>
            {catalogLoading ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-72" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {relatedProducts.map((related, index) => (
                  <PremiumProductCard key={related.id} product={related} index={index} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Product Reviews Section */}
        <section className="mt-20 border-t border-white/10 pt-16">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="tech-heading-gradient text-2xl font-bold md:text-3xl">Customer Reviews</h2>
            {user && (
              <Link href="/write-review">
                <button className="flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20">
                  <Star className="h-4 w-4" />
                  Write a Review
                </button>
              </Link>
            )}
          </div>

          {loadingReviews ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12">
              <Star className="w-16 h-16 text-[#d6e4ff]/30 mx-auto mb-4" />
              <p className="text-[#d6e4ff]/70">No reviews yet for this product.</p>
              <p className="text-[#d6e4ff]/50 text-sm mt-2">Be the first to share your experience!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="tech-glass-card p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      {review.profileImage ? (
                        <img
                          src={review.profileImage}
                          alt={review.name}
                          className="w-12 h-12 rounded-full object-cover border border-[#00bfff]/20"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00bfff] to-[#00e5ff] flex items-center justify-center">
                          <span className="text-lg font-bold text-[#020617]">
                            {review.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <h4 className="font-semibold text-white">{review.name}</h4>
                        <p className="text-sm text-[#d6e4ff]/60">{review.designation || 'Customer'}</p>
                        {review.verifiedPurchase && (
                          <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-green-500/20 border border-green-500/40 text-green-400 text-xs font-semibold">
                            ✓ Verified Purchase
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
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
                  </div>
                  <p className="text-[#d6e4ff]/80 leading-relaxed">{review.content}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
