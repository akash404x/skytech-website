'use client';

import Link from 'next/link';
import { collection, limit, onSnapshot, query, where } from 'firebase/firestore';
import { ArrowRight, Package } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import EmptyState from '@/components/EmptyState';
import ProductCard from '@/components/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { db } from '@/lib/firebase';
import { mapProduct } from '@/lib/firestore-mappers';
import type { Product } from '@/lib/types';

function toTimestamp(dateValue: Product['updatedAt']): number {
  if (!dateValue) return 0;
  if (typeof dateValue === 'number') return dateValue;
  if (dateValue instanceof Date) return dateValue.getTime();
  if (typeof dateValue === 'string') return new Date(dateValue).getTime();
  if (typeof dateValue === 'object' && 'toDate' in dateValue) return dateValue.toDate().getTime();
  if (typeof dateValue === 'object' && 'seconds' in dateValue) return dateValue.seconds * 1000;
  return 0;
}

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const featuredQuery = query(
      collection(db, 'products'),
      where('featured', '==', true),
      limit(12)
    );

    const unsubscribeFeatured = onSnapshot(
      featuredQuery,
      (snapshot) => {
        const featuredProducts = snapshot.docs
          .map((document) => mapProduct(document.id, document.data()))
          .filter((product) => product.status === 'active')
          .sort((a, b) => a.name.localeCompare(b.name))
          .slice(0, 4);
        
        if (featuredProducts.length > 0) {
          setProducts(featuredProducts);
          setLoading(false);
        } else {
          const fallbackQuery = query(
            collection(db, 'products'),
            where('status', '==', 'active'),
            limit(12)
          );

          const unsubscribeFallback = onSnapshot(
            fallbackQuery,
            (fallbackSnapshot) => {
              const fallbackProducts = fallbackSnapshot.docs
                .map((document) => mapProduct(document.id, document.data()))
                .sort((a, b) => toTimestamp(b.updatedAt) - toTimestamp(a.updatedAt))
                .slice(0, 4);
              setProducts(fallbackProducts);
              setLoading(false);
            },
            (error) => {
              console.error('Error loading fallback products:', error);
              setLoading(false);
            }
          );

          return () => unsubscribeFallback();
        }
      },
      (error) => {
        console.error('Error loading featured products:', error);
        setLoading(false);
      }
    );

    return () => unsubscribeFeatured();
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  } as const;

  return (
    <section className="tech-section relative overflow-hidden py-16 sm:py-20 lg:py-24">
      {/* Ambient glow effects */}
      <div className="absolute left-0 top-1/3 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" aria-hidden />
      <div className="absolute right-0 top-1/4 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" aria-hidden />
      
      {/* Subtle grid texture */}
      <div 
        className="absolute inset-0 opacity-30" 
        style={{
          backgroundImage: `
            linear-gradient(rgba(168, 85, 247, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(168, 85, 247, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
        aria-hidden
      />
      
      <div className="tech-section-backdrop" aria-hidden />
      <div className="tech-section-inner relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
          className="mb-12 flex flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:gap-4 sm:text-left lg:mb-16"
        >
          <div className="flex-1">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 backdrop-blur-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-purple-400" />
              </span>
              <span className="text-sm font-semibold text-purple-300 tracking-wide uppercase">Featured Collection</span>
            </motion.div>

            {/* Main Heading */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mb-3 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl"
            >
              Trending Products
            </motion.h2>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base text-slate-400 sm:text-lg"
            >
              Handpicked electronics components loved by makers and developers.
            </motion.p>
          </div>

          {/* View All Button */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            <Link
              href="/products"
              className="group inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-6 py-3 text-sm font-semibold text-cyan-300 backdrop-blur-sm transition-all duration-300 hover:border-cyan-500/50 hover:bg-cyan-500/20 hover:shadow-[0_0_30px_rgba(34,211,238,0.2)]"
            >
              View All
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </motion.div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                variants={itemVariants}
                className="h-full"
              >
                <ProductCard product={product} priority={index < 2} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <EmptyState
              icon={Package}
              title="No active products yet"
              description="Products added from the admin panel will appear here automatically."
            />
          </motion.div>
        )}
      </div>
    </section>
  );
}
