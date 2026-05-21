'use client';

import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import { db } from '@/lib/firebase';
import { mapService } from '@/lib/firestore-mappers';
import type { Service } from '@/lib/types';

interface UseServicesOptions {
  activeOnly?: boolean;
}

export function useServices({ activeOnly = false }: UseServicesOptions = {}) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const servicesQuery = query(collection(db, 'services'), orderBy('title'));
    const unsubscribe = onSnapshot(
      servicesQuery,
      (snapshot) => {
        setServices(snapshot.docs.map((document) => mapService(document.id, document.data())));
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error loading services:', err);
        setError('Failed to load services');
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const visibleServices = useMemo(
    () => (activeOnly ? services.filter((service) => service.status === 'active') : services),
    [activeOnly, services],
  );

  return { services: visibleServices, allServices: services, loading, error };
}
