'use client';

import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore';
import { Package } from 'lucide-react';
import { useEffect, useState } from 'react';
import EmptyState from '@/components/EmptyState';
import ProductCard from '@/components/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { db } from '@/lib/firebase';
import { mapProduct } from '@/lib/firestore-mappers';
import type { Product } from '@/lib/types';

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const productsQuery = query(collection(db, 'products'), orderBy('name'), limit(12));
    const unsubscribe = onSnapshot(
      productsQuery,
      (snapshot) => {
        const productsData = snapshot.docs
          .map((document) => mapProduct(document.id, document.data()))
          .filter((product) => product.status === 'active')
          .sort((a, b) => Number(b.featured) - Number(a.featured))
          .slice(0, 8);

        setProducts(productsData);
        setLoading(false);
      },
      (error) => {
        console.error('Error loading products:', error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  return (
    <section className="bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
          <p className="mt-1 text-sm text-gray-600">Live inventory from Firestore</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} priority={index < 2} />
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
