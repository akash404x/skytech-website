'use client';

import { collection, limit, onSnapshot, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { mapWork } from '@/lib/firestore-mappers';
import type { Work } from '@/lib/types';

export function useFeaturedWorks() {
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Query for featured works, sort and filter in JavaScript
    const featuredQuery = query(
      collection(db, 'works'),
      where('featured', '==', true),
      limit(12),
    );

    const unsubscribe = onSnapshot(
      featuredQuery,
      (snapshot) => {
        const mappedWorks = snapshot.docs
          .map((document) => mapWork(document.id, document.data()))
          .filter((w) => w.status === 'active')
          .sort((a, b) => a.title.localeCompare(b.title))
          .slice(0, 4);
        setWorks(mappedWorks);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error loading featured works:', err);
        // Fallback: get latest works, filter in JavaScript
        const fallbackQuery = query(
          collection(db, 'works'),
          limit(8),
        );

        const fallbackUnsubscribe = onSnapshot(
          fallbackQuery,
          (snapshot) => {
            const mappedWorks = snapshot.docs
              .map((document) => mapWork(document.id, document.data()))
              .filter((w) => w.status === 'active')
              .slice(0, 4);
            setWorks(mappedWorks);
            setLoading(false);
            setError(null);
          },
          (fallbackErr) => {
            console.error('Error loading fallback works:', fallbackErr);
            setError('Failed to load works');
            setLoading(false);
          },
        );

        return fallbackUnsubscribe;
      },
    );

    return () => unsubscribe();
  }, []);

  return { works, loading, error };
}
