'use client';

import Link from 'next/link';
import { ArrowRight, Wrench } from 'lucide-react';
import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import EmptyState from '@/components/EmptyState';
import ServiceCard from '@/components/ServiceCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { db } from '@/lib/firebase';
import { mapService } from '@/lib/firestore-mappers';
import type { Service } from '@/lib/types';

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const servicesQuery = query(collection(db, 'services'), orderBy('title'), limit(6));
    const unsubscribe = onSnapshot(
      servicesQuery,
      (snapshot) => {
        const servicesData = snapshot.docs
          .map((document) => mapService(document.id, document.data()))
          .filter((service) => service.status === 'active')
          .sort((a, b) => Number(b.featured) - Number(a.featured));

        setServices(servicesData);
        setLoading(false);
      },
      (error) => {
        console.error('Error loading services:', error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  return (
    <section className="bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Our Services</h2>
            <p className="mt-1 text-gray-600">Professional tech solutions for your projects</p>
          </div>
          <Link
            href="/services"
            className="flex items-center gap-1 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
          >
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-56" />
            ))}
          </div>
        ) : services.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} compact />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Wrench}
            title="No active services yet"
            description="Services added from the admin panel will appear here automatically."
          />
        )}
      </div>
    </section>
  );
}
