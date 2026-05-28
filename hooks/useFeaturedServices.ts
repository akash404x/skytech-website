'use client';

import { collection, limit, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { mapService } from '@/lib/firestore-mappers';
import type { Service } from '@/lib/types';

export function useFeaturedServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Query for featured services, sort and filter in JavaScript
    const featuredQuery = query(
      collection(db, 'services'),
      where('featured', '==', true),
      limit(12),
    );

    const unsubscribe = onSnapshot(
      featuredQuery,
      (snapshot) => {
        const mappedServices = snapshot.docs
          .map((document) => mapService(document.id, document.data()))
          .filter((s) => s.status === 'active')
          .sort((a, b) => a.title.localeCompare(b.title))
          .slice(0, 4);
        setServices(mappedServices);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error loading featured services:', err);
        // Fallback: get latest 8 services, filter in JavaScript
        const fallbackQuery = query(
          collection(db, 'services'),
          orderBy('createdAt', 'desc'),
          limit(8),
        );

        const fallbackUnsubscribe = onSnapshot(
          fallbackQuery,
          (snapshot) => {
            const mappedServices = snapshot.docs
              .map((document) => mapService(document.id, document.data()))
              .filter((s) => s.status === 'active')
              .slice(0, 4);
            setServices(mappedServices);
            setLoading(false);
            setError(null);
          },
          (fallbackErr) => {
            console.error('Error loading fallback services:', fallbackErr);
            setError('Failed to load services');
            setLoading(false);
          },
        );

        return fallbackUnsubscribe;
      },
    );

    return () => unsubscribe();
  }, []);

  return { services, loading, error };
}
