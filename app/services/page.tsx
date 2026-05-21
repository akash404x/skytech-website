'use client';

import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { MessageSquare, Wrench } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import EmptyState from '@/components/EmptyState';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import ServiceCard from '@/components/ServiceCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { db } from '@/lib/firebase';
import { mapService } from '@/lib/firestore-mappers';
import type { Service } from '@/lib/types';

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const servicesQuery = query(collection(db, 'services'), orderBy('title'));
    const unsubscribe = onSnapshot(
      servicesQuery,
      (snapshot) => {
        setServices(
          snapshot.docs
            .map((document) => mapService(document.id, document.data()))
            .filter((service) => service.status === 'active'),
        );
        setLoading(false);
      },
      (error) => {
        console.error('Error loading services:', error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const featuredServices = useMemo(() => services.filter((service) => service.featured), [services]);
  const regularServices = useMemo(() => services.filter((service) => !service.featured), [services]);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />

      <section className="bg-gradient-to-r from-blue-600 to-cyan-600 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold md:text-5xl">Professional Tech Services</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-50 md:text-xl">
            Expert solutions for Arduino, IoT, robotics, electronics, and custom technology projects.
          </p>
          <a
            href="mailto:akashsingh404x@gmail.com"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-blue-700 transition hover:bg-yellow-300 hover:text-blue-900"
          >
            <MessageSquare className="h-5 w-5" />
            Start a Project
          </a>
        </div>
      </section>

      <main className="flex-1">
        <section className="bg-white py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-bold text-gray-900">Featured Services</h2>
              <p className="mt-2 text-gray-600">Highlighted services from Firestore</p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-72" />
                ))}
              </div>
            ) : featuredServices.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {featuredServices.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Wrench}
                title="No featured services"
                description="Mark a service as featured in the admin panel to highlight it here."
              />
            )}
          </div>
        </section>

        <section className="bg-gray-50 py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-bold text-gray-900">All Services</h2>
              <p className="mt-2 text-gray-600">Services update live as admins change them</p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <Skeleton key={index} className="h-56" />
                ))}
              </div>
            ) : regularServices.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {regularServices.map((service) => (
                  <ServiceCard key={service.id} service={service} compact />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Wrench}
                title="No services available"
                description="Active services added in Firestore will appear here."
              />
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
