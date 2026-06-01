'use client';

import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Briefcase, Sparkles } from 'lucide-react';
import { useRef } from 'react';
import EmptyState from '@/components/EmptyState';
import WorkCard from '@/components/WorkCard';
import { useFeaturedWorks } from '@/hooks/useFeaturedWorks';
import { Skeleton } from '@/components/ui/Skeleton';

export default function FeaturedWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 });
  const { works, loading } = useFeaturedWorks();

  return (
    <section ref={sectionRef} className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-[#06122d] to-[#020617]" />
      <div className="absolute inset-0 opacity-20">
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#00bfff] rounded-full blur-[150px]" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#00e5ff] rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65 }}
          className="mb-16 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00bfff]/10 border border-[#00bfff]/20 backdrop-blur-sm mb-6">
            <Sparkles className="w-4 h-4 text-[#00bfff]" />
            <span className="text-sm font-medium text-[#00e5ff]">Portfolio</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Featured <span className="bg-gradient-to-r from-[#00bfff] to-[#00e5ff] bg-clip-text text-transparent">Works</span>
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-[#d6e4ff]/80">
            Explore our case studies showcasing innovative solutions and successful project deliveries
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-96" />
            ))}
          </div>
        ) : works.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {works.map((work, index) => (
              <div key={work.id} className="h-full">
                <WorkCard work={work} index={index} priority={index < 2} />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Briefcase}
            title="No featured works yet"
            description="Featured projects added from the admin panel will appear here automatically."
          />
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <Link
            href="/works"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white border border-[#00bfff]/30 bg-[#00bfff]/5 backdrop-blur-sm hover:bg-[#00bfff]/10 hover:border-[#00bfff]/50 transition-all duration-300"
          >
            View All Projects
            <ArrowRight className="h-5 w-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
