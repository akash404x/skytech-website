'use client';

import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Briefcase } from 'lucide-react';
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
    <section ref={sectionRef} className="tech-section">
      <div className="tech-section-backdrop" aria-hidden />
      <div className="tech-section-inner mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 flex items-center justify-between gap-4"
        >
          <div>
            <h2 className="tech-heading-gradient text-2xl font-bold">Featured Works</h2>
            <p className="mt-1 text-sm tech-muted">Our best projects and achievements</p>
          </div>
          <Link
            href="/works"
            className="flex shrink-0 items-center gap-1 text-sm font-semibold text-blue-300 transition hover:text-cyan-300"
          >
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-96" />
            ))}
          </div>
        ) : works.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
      </div>
    </section>
  );
}
