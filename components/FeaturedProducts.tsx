'use client';

import Link from 'next/link';
import { collection, limit, onSnapshot, query, where } from 'firebase/firestore';
import { ArrowRight, Package } from 'lucide-react';
import { useEffect, useState } from 'react';
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

  return (
    <section className="tech-section">
      <div className="tech-section-backdrop" aria-hidden />
      <div className="tech-section-inner mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h2 className="tech-heading-gradient text-2xl font-bold">Featured Products</h2>
            <p className="mt-1 text-sm tech-muted">Live inventory from Firestore</p>
          </div>
          <Link
            href="/products"
            className="flex shrink-0 items-center gap-1 text-sm font-semibold text-blue-300 transition hover:text-cyan-300"
          >
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product, index) => (
              <div key={product.id} className="h-full">
                <ProductCard product={product} priority={index < 2} />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Package}
            title="No active products yet"
            description="Products added from the admin panel will appear here automatically."
          />
        )}
      </div>
    </section>
  );
}
