'use client';

import { motion, useInView } from 'framer-motion';
import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore';
import { BadgePercent, Package, Sparkles } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import EmptyState from '@/components/EmptyState';
import ProductCard from '@/components/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { db } from '@/lib/firebase';
import { mapProduct } from '@/lib/firestore-mappers';
import type { Product } from '@/lib/types';

export default function DiscountDeals() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.15 });

  useEffect(() => {
    const productsQuery = query(collection(db, 'products'), orderBy('name'), limit(24));
    const unsubscribe = onSnapshot(
      productsQuery,
      (snapshot) => {
        const discountedProducts = snapshot.docs
          .map((document) => mapProduct(document.id, document.data()))
          .filter(
            (product) =>
              product.status === 'active' &&
              product.discountPrice !== null &&
              product.discountPrice > 0 &&
              product.discountPrice < product.price,
          )
          .slice(0, 4);

        setProducts(discountedProducts);
        setLoading(false);
      },
      (error) => {
        console.error('Error loading deals:', error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  return (
    <section ref={ref} className="relative py-20 md:py-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-[#06122d] to-[#020617]" />
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00bfff] rounded-full blur-[200px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65 }}
          className="mb-12 flex items-center gap-4"
        >
          <div className="rounded-xl border border-[#00bfff]/30 bg-[#00bfff]/10 p-4">
            <BadgePercent className="h-7 w-7 text-[#00bfff]" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00bfff]/10 border border-[#00bfff]/20 mb-2">
              <Sparkles className="w-3 h-3 text-[#00bfff]" />
              <span className="text-xs font-medium text-[#00e5ff]">Limited Time</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white">Hot Deals</h2>
            <p className="text-[#d6e4ff]/70">Discounted products update live</p>
          </div>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.65, delay: 0.2 }}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </motion.div>
        ) : (
          <EmptyState
            icon={Package}
            title="No deals right now"
            description="Add a discount price to an active product and it will appear here."
          />
        )}
      </div>
    </section>
  );
}
