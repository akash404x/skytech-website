'use client';

import { collection, limit, onSnapshot, orderBy, query, where, Unsubscribe } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import { db } from '@/lib/firebase';
import { mapService } from '@/lib/firestore-mappers';
import type { Service, DateValue } from '@/lib/types';

interface UseServicesOptions {
  activeOnly?: boolean;
  featuredOnly?: boolean;
  limitCount?: number;
  fallbackToLatest?: boolean;
}

function toTimestamp(dateValue: DateValue): number {
  if (!dateValue) return 0;
  if (typeof dateValue === 'number') return dateValue;
  if (dateValue instanceof Date) return dateValue.getTime();
  if (typeof dateValue === 'string') return new Date(dateValue).getTime();
  if (typeof dateValue === 'object' && 'toDate' in dateValue) return dateValue.toDate().getTime();
  if (typeof dateValue === 'object' && 'seconds' in dateValue) return dateValue.seconds * 1000;
  return 0;
}

export function useServices({ activeOnly = false, featuredOnly = false, limitCount, fallbackToLatest = false }: UseServicesOptions = {}) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let servicesQuery;
    let unsubscribe: Unsubscribe;

    if (featuredOnly) {
      servicesQuery = query(
        collection(db, 'services'),
        where('featured', '==', true),
        limit(limitCount ?? 12)
      );

      unsubscribe = onSnapshot(
        servicesQuery,
        (snapshot) => {
          const featuredServices = snapshot.docs
            .map((document) => mapService(document.id, document.data()))
            .filter((service) => service.status === 'active')
            .sort((a, b) => a.title.localeCompare(b.title))
            .slice(0, limitCount ?? 4);
          
          if (featuredServices.length > 0 || !fallbackToLatest) {
            setServices(featuredServices);
            setLoading(false);
          } else {
            const fallbackQuery = query(
              collection(db, 'services'),
              where('status', '==', 'active'),
              limit(limitCount ?? 12)
            );

            const unsubscribeFallback = onSnapshot(
              fallbackQuery,
              (fallbackSnapshot) => {
                const fallbackServices = fallbackSnapshot.docs
                  .map((document) => mapService(document.id, document.data()))
                  .sort((a, b) => toTimestamp(b.updatedAt) - toTimestamp(a.updatedAt))
                  .slice(0, limitCount ?? 4);
                setServices(fallbackServices);
                setLoading(false);
              },
              (err) => {
                console.error('Error loading fallback services:', err);
                setError('Failed to load services');
                setLoading(false);
              }
            );

            unsubscribe = unsubscribeFallback;
          }
        },
        (err) => {
          console.error('Error loading services:', err);
          setError('Failed to load services');
          setLoading(false);
        }
      );
    } else {
      servicesQuery = query(collection(db, 'services'), orderBy('title'));
      unsubscribe = onSnapshot(
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
        }
      );
    }

    return () => unsubscribe();
  }, [featuredOnly, limitCount, fallbackToLatest]);

  const visibleServices = useMemo(
    () => (activeOnly ? services.filter((service) => service.status === 'active') : services),
    [activeOnly, services],
  );

  return { services: visibleServices, allServices: services, loading, error };
}
