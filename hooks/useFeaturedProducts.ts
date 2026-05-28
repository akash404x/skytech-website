'use client';

import { collection, limit, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { mapProduct } from '@/lib/firestore-mappers';
import type { Product } from '@/lib/types';

export function useFeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Query for featured products, sort and filter in JavaScript
    const featuredQuery = query(
      collection(db, 'products'),
      where('featured', '==', true),
      limit(12),
    );

    const unsubscribe = onSnapshot(
      featuredQuery,
      (snapshot) => {
        const mappedProducts = snapshot.docs
          .map((document) => mapProduct(document.id, document.data()))
          .filter((p) => p.status === 'active')
          .sort((a, b) => a.name.localeCompare(b.name))
          .slice(0, 4);
        setProducts(mappedProducts);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error loading featured products:', err);
        // Fallback: get latest 4 products, filter in JavaScript
        const fallbackQuery = query(
          collection(db, 'products'),
          orderBy('createdAt', 'desc'),
          limit(8),
        );

        const fallbackUnsubscribe = onSnapshot(
          fallbackQuery,
          (snapshot) => {
            const mappedProducts = snapshot.docs
              .map((document) => mapProduct(document.id, document.data()))
              .filter((p) => p.status === 'active')
              .slice(0, 4);
            setProducts(mappedProducts);
            setLoading(false);
            setError(null);
          },
          (fallbackErr) => {
            console.error('Error loading fallback products:', fallbackErr);
            setError('Failed to load products');
            setLoading(false);
          },
        );

        return fallbackUnsubscribe;
      },
    );

    return () => unsubscribe();
  }, []);

  return { products, loading, error };
}
