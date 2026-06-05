'use client';

import { Bot, Cable, Cpu, Home, Monitor, Package, Radio, Wifi, Wrench, Zap, type LucideIcon } from 'lucide-react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
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
  'Arduino Boards': 'from-blue-500/20 to-cyan-500/20 text-blue-400 border-blue-500/30',
  Sensors: 'from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30',
  Robotics: 'from-pink-500/20 to-rose-500/20 text-pink-400 border-pink-500/30',
  'Raspberry Pi': 'from-green-500/20 to-emerald-500/20 text-green-400 border-green-500/30',
  Displays: 'from-orange-500/20 to-amber-500/20 text-orange-400 border-orange-500/30',
  'Motors & Drivers': 'from-red-500/20 to-rose-500/20 text-red-400 border-red-500/30',
  'DIY Kits': 'from-yellow-500/20 to-orange-500/20 text-yellow-400 border-yellow-500/30',
  'IoT Modules': 'from-indigo-500/20 to-violet-500/20 text-indigo-400 border-indigo-500/30',
  'Smart Home': 'from-teal-500/20 to-cyan-500/20 text-teal-400 border-teal-500/30',
  'Power Supplies': 'from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30',
  'Cables & Connectors': 'from-rose-500/20 to-pink-500/20 text-rose-400 border-rose-500/30',
  Components: 'from-amber-500/20 to-yellow-500/20 text-amber-400 border-amber-500/30',
};

export default function ProductCategories() {
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const productsQuery = query(collection(db, 'products'));
    const unsubscribe = onSnapshot(
      productsQuery,
      (snapshot) => {
        const products = snapshot.docs
          .map((document) => mapProduct(document.id, document.data()))
          .filter((product) => product.status === 'active');

        const nextCategories = Array.from(
          new Set(products.map((product) => product.category).filter(Boolean)),
        ).sort((a, b) => a.localeCompare(b));

        // Count products per category
        const counts: Record<string, number> = {};
        products.forEach((product) => {
          if (product.category) {
            counts[product.category] = (counts[product.category] || 0) + 1;
          }
        });

        setCategories(nextCategories);
        setCategoryCounts(counts);
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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2,
      },
    },
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  } as const;

  return (
    <section className="tech-section relative overflow-hidden py-16 sm:py-20 lg:py-24">
      {/* Ambient glow effects */}
      <div className="absolute left-0 top-1/4 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" aria-hidden />
      <div className="absolute right-0 top-1/3 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" aria-hidden />
      
      {/* Subtle grid texture */}
      <div 
        className="absolute inset-0 opacity-30" 
        style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
        aria-hidden
      />
      
      <div className="tech-section-backdrop" aria-hidden />
      <div className="tech-section-inner relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
          className="mb-12 text-center sm:mb-16"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 backdrop-blur-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
            </span>
            <span className="text-sm font-semibold text-cyan-300 tracking-wide uppercase">Categories</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl"
          >
            Explore Product Categories
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mb-8 max-w-2xl text-base text-slate-400 sm:text-lg"
          >
            Discover premium Arduino boards, sensors, modules and electronics components for your next innovation.
          </motion.p>

          {/* Glowing Divider */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="mx-auto h-px w-24 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
          />
        </motion.div>

        {/* Category Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
        >
          {loading
            ? Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-40 rounded-xl" />
              ))
            : visibleCategories.map((category) => {
                const Icon = categoryIcons[category] ?? Package;
                const color = categoryColors[category] ?? 'from-gray-500/20 to-slate-500/20 text-gray-400 border-gray-500/30';
                const count = categoryCounts[category] || 0;
                
                return (
                  <motion.div
                    key={category}
                    variants={itemVariants}
                    whileHover={{ 
                      y: -8,
                      scale: 1.02,
                      transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const }
                    }}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl transition-all duration-300 hover:border-cyan-500/30 hover:shadow-[0_0_40px_rgba(34,211,238,0.15)]"
                  >
                    {/* Hover glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 via-transparent to-purple-500/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    
                    <div className="relative flex flex-col items-center p-5 text-center">
                      {/* Icon container with gradient background */}
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ duration: 0.3 }}
                        className={`mb-4 rounded-2xl border bg-gradient-to-br p-4 ${color}`}
                      >
                        <Icon className="h-7 w-7" />
                      </motion.div>
                      
                      {/* Category name */}
                      <span className="mb-1 text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
                        {category}
                      </span>
                      
                      {/* Product count */}
                      <span className="text-xs font-medium text-slate-500 group-hover:text-cyan-400 transition-colors">
                        {count} {count === 1 ? 'Product' : 'Products'}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
        </motion.div>
      </div>
    </section>
  );
}
