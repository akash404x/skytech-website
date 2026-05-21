'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, Minus, Package, Plus, ShoppingCart, Star } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import PremiumProductCard from '@/components/products/PremiumProductCard';
import ProductGallery from '@/components/products/ProductGallery';
import EmptyState from '@/components/EmptyState';
import AnimatedButton from '@/components/ui/AnimatedButton';
import { Skeleton } from '@/components/ui/Skeleton';
import { useCart } from '@/contexts/CartContext';
import { useProducts } from '@/hooks/useProducts';
import { db } from '@/lib/firebase';
import { formatCurrency } from '@/lib/format';
import { getProductPrice } from '@/lib/cart';
import { mapProduct } from '@/lib/firestore-mappers';
import type { Product } from '@/lib/types';

export default function ProductDetailView() {
  const params = useParams();
  const router = useRouter();
  const productId = typeof params.id === 'string' ? params.id : '';
  const { addItem } = useCart();
  const { products: allProducts, loading: catalogLoading } = useProducts({ activeOnly: true });

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

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
      </div>
    </div>
  );
}
