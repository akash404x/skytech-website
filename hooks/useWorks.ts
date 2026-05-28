'use client';

import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import { db } from '@/lib/firebase';
import { mapWork } from '@/lib/firestore-mappers';
import type { Work } from '@/lib/types';

interface UseWorksOptions {
  activeOnly?: boolean;
}

export function useWorks({ activeOnly = true }: UseWorksOptions = {}) {
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const worksQuery = query(collection(db, 'works'), orderBy('title'));
    const unsubscribe = onSnapshot(
      worksQuery,
      (snapshot) => {
        setWorks(snapshot.docs.map((document) => mapWork(document.id, document.data())));
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error loading works:', err);
        setError('Failed to load works');
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const visibleWorks = useMemo(
    () => (activeOnly ? works.filter((work) => work.status === 'active') : works),
    [activeOnly, works],
  );

  return { works: visibleWorks, allWorks: works, loading, error };
}
