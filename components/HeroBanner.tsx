'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import HeroSlideEffects from '@/components/hero/HeroSlideEffects';
import AnimatedButton from '@/components/ui/AnimatedButton';
import Link from 'next/link';

const slides = [
  {
    id: 1,
    variant: 'particles' as const,
    title: 'Arduino & IoT Solutions',
    subtitle: 'Build Your Projects',
    description: 'Arduino Boards, Sensors, Modules & Components',
    slideClass: 'hero-slide-theme-1',
    accent: 'from-amber-300 via-orange-300 to-yellow-400',
  },
  {
    id: 2,
    variant: 'grid' as const,
    title: 'Robotics & Automation',
    subtitle: 'Smart Technology',
    description: 'Motors, Drivers, Controllers & DIY Kits',
    slideClass: 'hero-slide-theme-2',
    accent: 'from-purple-400 via-fuchsia-300 to-violet-400',
  },
  {
    id: 3,
    variant: 'circuit' as const,
    title: 'Professional Services',
    subtitle: 'Expert Support',
    description: 'IoT Development, PCB Design & Project Assistance',
    slideClass: 'hero-slide-theme-3',
    accent: 'from-emerald-400 via-cyan-300 to-teal-400',
  },
];

const textContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.08 },
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

export default function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  const slide = slides[currentSlide];

  return (
    <div className="tech-hero-banner relative w-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.65, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <div className={`tech-hero-slide ${slide.slideClass} relative flex h-full w-full items-center justify-center`}>
            <HeroSlideEffects variant={slide.variant} active />
            <div className="hero-slide-radial-glow pointer-events-none absolute inset-0" aria-hidden />

            <motion.div
              variants={textContainer}
              initial="hidden"
              animate="visible"
              className="relative z-10 max-w-4xl px-4 text-center"
            >
              <motion.h2
                variants={textItem}
                className={`mb-2 bg-gradient-to-r ${slide.accent} bg-clip-text text-4xl font-bold tracking-tight text-transparent md:text-6xl`}
              >
                {slide.title}
              </motion.h2>
              <motion.p variants={textItem} className="mb-3 text-2xl font-semibold text-slate-100 md:text-4xl">
                {slide.subtitle}
              </motion.p>
              <motion.p variants={textItem} className="mx-auto max-w-2xl text-lg text-slate-300/90 md:text-xl">
                {slide.description}
              </motion.p>
              <motion.div variants={textItem} className="mt-8">
                <Link href="/products">
  <AnimatedButton
    type="button"
    className="hero-cta-btn px-10 py-3.5 text-base font-semibold md:text-lg"
  >
    Shop Now
  </AnimatedButton>
</Link>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      <button
        type="button"
        onClick={prevSlide}
        className="hero-nav-btn absolute left-4 top-1/2 z-20 -translate-y-1/2"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        type="button"
        onClick={nextSlide}
        className="hero-nav-btn absolute right-4 top-1/2 z-20 -translate-y-1/2"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`hero-dot h-2 rounded-full transition-all duration-300 ${
              index === currentSlide ? 'hero-dot-active w-8' : 'w-2 bg-white/30 hover:bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
