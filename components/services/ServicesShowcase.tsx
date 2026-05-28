'use client';

import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Mail, Rocket, Sparkles, Wrench } from 'lucide-react';
import { useRef } from 'react';
import EmptyState from '@/components/EmptyState';
import AnimatedButton from '@/components/ui/AnimatedButton';
import { Skeleton } from '@/components/ui/Skeleton';
import PremiumServiceCard from '@/components/services/PremiumServiceCard';
import AnimatedCounter from '@/components/services/AnimatedCounter';
import { useServices } from '@/hooks/useServices';
import {
  CONTACT_EMAIL,
  SERVICE_STATS,
  WHY_CHOOSE_SKYTECH,
} from '@/lib/services-content';

interface ServicesShowcaseProps {
  variant?: 'home' | 'full';
}

const headerVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function ServicesShowcase({ variant = 'home' }: ServicesShowcaseProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.08 });
  const isFull = variant === 'full';
  const { services, loading, error } = useServices({ activeOnly: true, featuredOnly: !isFull, limitCount: !isFull ? 4 : undefined, fallbackToLatest: !isFull });

  return (
    <section ref={sectionRef} className="services-showcase relative overflow-hidden py-20 md:py-28">
      <div className="services-showcase-bg pointer-events-none absolute inset-0" aria-hidden>
        <div className="services-showcase-grid absolute inset-0" />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 48, repeat: Infinity, ease: 'linear' }}
          className="services-showcase-glow-a absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-blue-600/15 blur-3xl"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 56, repeat: Infinity, ease: 'linear' }}
          className="services-showcase-glow-b absolute -right-24 bottom-1/4 h-80 w-80 rounded-full bg-purple-600/12 blur-3xl"
        />
        {Array.from({ length: isFull ? 18 : 12 }).map((_, i) => (
          <span
            key={i}
            className="services-showcase-particle absolute rounded-full bg-cyan-400/25"
            style={{
              left: `${(i * 17) % 94}%`,
              top: `${(i * 23) % 88}%`,
              width: 2 + (i % 2),
              height: 2 + (i % 2),
              animationDelay: `${i * 0.35}s`,
              animationDuration: `${6 + (i % 5)}s`,
            }}
          />
        ))}
      </div>

      <div className="tech-section-backdrop" aria-hidden />

      <div className="relative z-[1] mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={headerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className={`mb-12 text-center ${isFull ? 'md:mb-16' : ''}`}
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.1 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-sm font-semibold text-cyan-300 backdrop-blur-sm"
          >
            <Sparkles className="h-4 w-4" />
            What We Offer
          </motion.span>
          <h2 className={`tech-heading-gradient font-bold ${isFull ? 'text-4xl md:text-5xl' : 'text-3xl md:text-4xl'}`}>
            Our Services
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base tech-text md:text-lg">
            Live services from SkyTech — add or update anytime in the admin dashboard and they appear here instantly.
          </p>
          {!isFull && (
            <Link
              href="/services"
              className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-blue-300 transition hover:text-cyan-300"
            >
              View full services page
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="h-64" />
            ))}
          </div>
        ) : error ? (
          <EmptyState icon={Wrench} title="Unable to load services" description={error} />
        ) : services.length === 0 ? (
          <EmptyState
            icon={Wrench}
            title="No services published yet"
            description="Add active services in Admin → Services and they will appear here in real time."
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {services.map((service, index) => (
              <PremiumServiceCard key={service.id} service={service} index={index} />
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.65 }}
          className="mt-20 md:mt-24"
        >
          <div className="mb-10 text-center">
            <h3 className="tech-heading-gradient text-2xl font-bold md:text-3xl">Why Choose SkyTech?</h3>
            <p className="mt-2 tech-muted">Trusted expertise with a modern, innovation-first mindset</p>
          </div>

          <div className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {WHY_CHOOSE_SKYTECH.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.5 }}
                whileHover={{ y: -6 }}
                className="tech-glass-card group relative overflow-hidden p-5 text-center"
              >
                <div
                  className={`mx-auto mb-3 h-1 w-12 rounded-full bg-gradient-to-r ${item.gradient} opacity-80 transition-all group-hover:w-16`}
                />
                <h4 className="text-sm font-bold text-white md:text-base">{item.title}</h4>
                <p className="mt-2 text-xs leading-relaxed tech-muted md:text-sm">{item.description}</p>
              </motion.div>
            ))}
          </div>

          <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {SERVICE_STATS.map((stat) => (
              <AnimatedCounter key={stat.label} value={stat.value} suffix={stat.suffix} label={stat.label} />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <AnimatedButton
              type="button"
              onClick={() => {
                window.location.href = `mailto:${CONTACT_EMAIL}?subject=SkyTech%20Inquiry`;
              }}
              className="hero-cta-btn inline-flex min-w-[200px] items-center justify-center gap-2 px-8 py-3.5"
            >
              <Mail className="h-5 w-5" />
              Contact Us
            </AnimatedButton>
            <AnimatedButton
              type="button"
              onClick={() => {
                window.location.href = `mailto:${CONTACT_EMAIL}?subject=Start%20My%20SkyTech%20Project`;
              }}
              className="inline-flex min-w-[200px] items-center justify-center gap-2 rounded-full border border-purple-400/40 bg-purple-600/20 px-8 py-3.5 font-semibold text-white shadow-[0_0_24px_rgba(147,51,234,0.15)] transition hover:border-purple-300/50 hover:bg-purple-600/30 hover:shadow-[0_0_32px_rgba(147,51,234,0.25)]"
            >
              <Rocket className="h-5 w-5" />
              Start Your Project
            </AnimatedButton>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
