'use client';

import { motion, useInView } from 'framer-motion';
import { Filter, Briefcase } from 'lucide-react';
import { useRef, useState } from 'react';
import EmptyState from '@/components/EmptyState';
import WorkCard from '@/components/WorkCard';
import { WORK_CATEGORIES } from '@/lib/works-content';
import { useWorks } from '@/hooks/useWorks';
import { Skeleton } from '@/components/ui/Skeleton';

export default function WorksCatalog() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.08 });
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const { works, loading } = useWorks({ activeOnly: true });

  const filteredWorks =
    selectedCategory === 'All'
      ? works
      : works.filter((work) => work.category === selectedCategory);

  const categories = ['All', ...WORK_CATEGORIES];

  return (
    <section ref={sectionRef} className="relative overflow-hidden py-20 md:py-28">
      <div className="works-catalog-bg pointer-events-none absolute inset-0" aria-hidden>
        <div className="works-catalog-grid absolute inset-0" />
      </div>

      <div className="tech-section-backdrop" aria-hidden />

      <div className="relative z-[1] mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12"
        >
          <div className="mb-8 flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="tech-heading-gradient text-2xl font-bold md:text-3xl">All Projects</h2>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-cyan-300" />
              <span className="text-sm text-slate-400">Filter by category</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                  selectedCategory === category
                    ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200 shadow-[0_0_16px_rgba(34,211,238,0.2)]'
                    : 'border-white/10 bg-white/5 text-slate-300 hover:border-cyan-300/50 hover:bg-cyan-500/10'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-96" />
            ))}
          </div>
        ) : filteredWorks.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No projects found"
            description={selectedCategory === 'All' ? 'No projects published yet. Check back soon!' : `No projects in ${selectedCategory} category.`}
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredWorks.map((work, index) => (
              <div key={work.id} className="h-full">
                <WorkCard work={work} index={index} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
