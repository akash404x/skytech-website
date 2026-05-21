'use client';

import { motion } from 'framer-motion';
import { Cpu, Sparkles } from 'lucide-react';

const textContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const textItem = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function ProductsHero() {
  return (
    <section className="products-hero relative overflow-hidden py-16 md:py-24">
      <div className="products-showcase-bg pointer-events-none absolute inset-0" aria-hidden>
        <div className="products-showcase-grid absolute inset-0" />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 48, repeat: Infinity, ease: 'linear' }}
          className="products-showcase-glow-a absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-blue-600/15 blur-3xl"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 56, repeat: Infinity, ease: 'linear' }}
          className="products-showcase-glow-b absolute -right-24 bottom-1/4 h-80 w-80 rounded-full bg-purple-600/12 blur-3xl"
        />
        {Array.from({ length: 16 }).map((_, i) => (
          <span
            key={i}
            className="products-showcase-particle absolute rounded-full bg-cyan-400/25"
            style={{
              left: `${(i * 19) % 92}%`,
              top: `${(i * 13) % 85}%`,
              width: 2 + (i % 2),
              height: 2 + (i % 2),
              animationDelay: `${i * 0.4}s`,
              animationDuration: `${6 + (i % 5)}s`,
            }}
          />
        ))}
      </div>
      <div className="tech-section-backdrop" aria-hidden />

      <motion.div
        variants={textContainer}
        initial="hidden"
        animate="visible"
        className="relative z-[1] mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8"
      >
        <motion.span
          variants={textItem}
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-sm font-semibold text-cyan-300 backdrop-blur-sm"
        >
          <Sparkles className="h-4 w-4" />
          Smart Tech Store
        </motion.span>
        <motion.h1
          variants={textItem}
          className="tech-heading-gradient text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl"
        >
          Explore Smart Tech Products
        </motion.h1>
        <motion.p variants={textItem} className="mx-auto mt-4 max-w-2xl text-lg tech-text md:text-xl">
          Arduino, IoT, Robotics & Innovation Products
        </motion.p>
        <motion.div variants={textItem} className="mt-8 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/30">
            <Cpu className="h-7 w-7 text-white" />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
