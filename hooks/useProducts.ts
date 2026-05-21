'use client';

import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import { db } from '@/lib/firebase';
import { mapProduct } from '@/lib/firestore-mappers';
import type { Product } from '@/lib/types';

interface UseProductsOptions {
  activeOnly?: boolean;
}

export function useProducts({ activeOnly = true }: UseProductsOptions = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const productsQuery = query(collection(db, 'products'), orderBy('name'));
    const unsubscribe = onSnapshot(
      productsQuery,
      (snapshot) => {
        setProducts(snapshot.docs.map((document) => mapProduct(document.id, document.data())));
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error loading products:', err);
        setError('Failed to load products');
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const visibleProducts = useMemo(
    () => (activeOnly ? products.filter((product) => product.status === 'active') : products),
    [activeOnly, products],
  );

  return { products: visibleProducts, allProducts: products, loading, error };
}
