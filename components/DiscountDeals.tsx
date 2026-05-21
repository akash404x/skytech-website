'use client';

import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore';
import { BadgePercent, Package } from 'lucide-react';
import { useEffect, useState } from 'react';
import EmptyState from '@/components/EmptyState';
import ProductCard from '@/components/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { db } from '@/lib/firebase';
import { mapProduct } from '@/lib/firestore-mappers';
import type { Product } from '@/lib/types';

export default function DiscountDeals() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

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
    <section className="bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="rounded-lg bg-rose-100 p-3 text-rose-600">
            <BadgePercent className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Hot Deals</h2>
            <p className="text-sm text-gray-600">Discounted products update live</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
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
