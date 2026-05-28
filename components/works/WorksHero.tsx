'use client';

import { motion, useInView } from 'framer-motion';
import { Briefcase, Code, Rocket, Sparkles } from 'lucide-react';
import { useRef } from 'react';

export default function WorksHero() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section ref={ref} className="relative overflow-hidden py-20 md:py-28">
      <div className="works-hero-bg pointer-events-none absolute inset-0" aria-hidden>
        <div className="works-hero-grid absolute inset-0" />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 48, repeat: Infinity, ease: 'linear' }}
          className="works-hero-glow-a absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-blue-600/15 blur-3xl"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 56, repeat: Infinity, ease: 'linear' }}
          className="works-hero-glow-b absolute -right-24 bottom-1/4 h-80 w-80 rounded-full bg-purple-600/12 blur-3xl"
        />
        {Array.from({ length: 12 }).map((_, i) => (
          <span
            key={i}
            className="works-hero-particle absolute rounded-full bg-cyan-400/25"
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
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.1 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-sm font-semibold text-cyan-300 backdrop-blur-sm"
          >
            <Sparkles className="h-4 w-4" />
            Our Portfolio
          </motion.span>
          <h1 className="tech-heading-gradient text-4xl font-bold md:text-5xl lg:text-6xl">
            Featured Works
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base tech-text md:text-lg">
            Explore our completed projects — from Arduino builds and IoT solutions to web development and custom electronics.
            Every project showcases innovation, quality, and technical excellence.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2"
            >
              <Briefcase className="h-5 w-5 text-cyan-300" />
              <span className="text-sm text-slate-300">50+ Projects</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.25 }}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2"
            >
              <Code className="h-5 w-5 text-purple-300" />
              <span className="text-sm text-slate-300">20+ Technologies</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2"
            >
              <Rocket className="h-5 w-5 text-blue-300" />
              <span className="text-sm text-slate-300">35+ Happy Clients</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
