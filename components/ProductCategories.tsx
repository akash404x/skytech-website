'use client';

import { Bot, Cable, Cpu, Home, Monitor, Package, Radio, Wifi, Wrench, Zap, type LucideIcon } from 'lucide-react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import { db } from '@/lib/firebase';
import { mapProduct } from '@/lib/firestore-mappers';
import { Skeleton } from './ui/Skeleton';

const categoryIcons: Record<string, LucideIcon> = {
  'Arduino Boards': Cpu,
  Sensors: Radio,
  Robotics: Bot,
  'Raspberry Pi': Cpu,
  Displays: Monitor,
  'Motors & Drivers': Zap,
  'DIY Kits': Wrench,
  'IoT Modules': Wifi,
  'Smart Home': Home,
  'Power Supplies': Package,
  'Cables & Connectors': Cable,
  Components: Cpu,
};

const categoryColors: Record<string, string> = {
  'Arduino Boards': 'bg-blue-100 text-blue-600',
  Sensors: 'bg-purple-100 text-purple-600',
  Robotics: 'bg-pink-100 text-pink-600',
  'Raspberry Pi': 'bg-green-100 text-green-600',
  Displays: 'bg-orange-100 text-orange-600',
  'Motors & Drivers': 'bg-red-100 text-red-600',
  'DIY Kits': 'bg-yellow-100 text-yellow-700',
  'IoT Modules': 'bg-indigo-100 text-indigo-600',
  'Smart Home': 'bg-teal-100 text-teal-600',
  'Power Supplies': 'bg-cyan-100 text-cyan-600',
  'Cables & Connectors': 'bg-rose-100 text-rose-600',
  Components: 'bg-amber-100 text-amber-700',
};

export default function ProductCategories() {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const productsQuery = query(collection(db, 'products'));
    const unsubscribe = onSnapshot(
      productsQuery,
      (snapshot) => {
        const nextCategories = Array.from(
          new Set(
            snapshot.docs
              .map((document) => mapProduct(document.id, document.data()))
              .filter((product) => product.status === 'active')
              .map((product) => product.category)
              .filter(Boolean),
          ),
        ).sort((a, b) => a.localeCompare(b));

        setCategories(nextCategories);
        setLoading(false);
      },
      (error) => {
        console.error('Error loading categories:', error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const visibleCategories = useMemo(() => categories.slice(0, 12), [categories]);

  return (
    <section className="bg-white py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Shop by Category</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {loading
            ? Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-32" />)
            : visibleCategories.map((category) => {
                const Icon = categoryIcons[category] ?? Package;
                const color = categoryColors[category] ?? 'bg-gray-100 text-gray-600';
                return (
                  <div
                    key={category}
                    className="flex flex-col items-center rounded-lg bg-gray-50 p-4 text-center transition hover:-translate-y-1 hover:bg-white hover:shadow-md"
                  >
                    <div className={`mb-3 rounded-full p-4 ${color}`}>
                      <Icon className="h-8 w-8" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{category}</span>
                  </div>
                );
              })}
        </div>
      </div>
    </section>
  );
}
