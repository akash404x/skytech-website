'use client';

import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight, PenTool, ShieldCheck, Users, Heart, HeadphonesIcon } from 'lucide-react';
import Link from 'next/link';
import { collection, onSnapshot, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Review } from '@/lib/types';

// Statistics data
const stats = [
  { icon: Star, value: '4.9/5', label: 'Average Rating', color: 'text-amber-400' },
  { icon: Users, value: '100+', label: 'Happy Customers', color: 'text-blue-400' },
  { icon: Heart, value: '98%', label: 'Satisfaction', color: 'text-rose-400' },
  { icon: HeadphonesIcon, value: '24/7', label: 'Customer Support', color: 'text-purple-400' },
];

export default function TestimonialsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [testimonials, setTestimonials] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const q = query(
      collection(db, 'reviews'),
      where('status', '==', 'approved'),
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const reviews = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Review));
        setTestimonials(reviews);
        setLoading(false);
      },
      (error) => {
        console.error('Error loading reviews:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Auto-slide with progress indicator
  useEffect(() => {
    if (testimonials.length === 0 || isPaused) return;
    
    const duration = 6000;
    const interval = 50;
    let progressValue = 0;
    
    const progressTimer = setInterval(() => {
      progressValue += interval;
      setProgress((progressValue / duration) * 100);
      
      if (progressValue >= duration) {
        progressValue = 0;
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
        setProgress(0);
      }
    }, interval);

    return () => clearInterval(progressTimer);
  }, [testimonials.length, isPaused]);

  const nextTestimonial = () => {
    setProgress(0);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setProgress(0);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  } as const;

  return (
    <section ref={ref} className="relative py-24 md:py-32 bg-[#020617]">
      {/* Subtle Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px]" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-12 md:mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            What Our <span className="text-[#00bfff]">Customers Say</span>
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-slate-400">
            Real feedback from real innovators who trust Sky Tech
          </p>
        </motion.div>

        {/* Statistics Row */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12 md:mb-16"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + index * 0.1 }}
              whileHover={{ y: -4 }}
              className="p-4 md:p-6 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-white/10 transition-all duration-300"
            >
              <stat.icon className={`w-5 h-5 md:w-6 md:h-6 ${stat.color} mb-3`} />
              <p className="text-xl md:text-2xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-sm text-slate-400">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Testimonial Carousel */}
        {loading ? (
          <motion.div variants={itemVariants} className="relative max-w-4xl mx-auto">
            <div className="p-8 md:p-12 rounded-2xl bg-slate-900/50 border border-white/5">
              <div className="animate-pulse space-y-6">
                <div className="h-24 bg-white/5 rounded-xl" />
                <div className="flex gap-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-5 h-5 bg-white/5 rounded-full" />
                  ))}
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/5 rounded-full" />
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-white/5 rounded" />
                    <div className="h-3 w-24 bg-white/5 rounded" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : testimonials.length === 0 ? (
          <motion.div variants={itemVariants} className="text-center py-16">
            <Star className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No reviews yet. Be the first to share your experience!</p>
          </motion.div>
        ) : (
          <motion.div variants={itemVariants} className="relative max-w-4xl mx-auto">
            {/* Progress Indicator */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[#00bfff]"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.05, ease: 'linear' }}
              />
            </div>

            <div 
              className="relative overflow-hidden mt-4"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="relative"
                >
                  {/* Clean Glassmorphism Card */}
                  <div className="relative p-8 md:p-12 rounded-2xl bg-slate-900/50 border border-white/5 backdrop-blur-sm">
                    {/* Small Quote Icon */}
                    <div className="absolute top-6 right-6 opacity-10">
                      <Quote className="w-8 h-8 text-white" />
                    </div>

                    {/* Content */}
                    <div className="relative z-10">
                      {/* Stars */}
                      <div className="flex gap-1 mb-6">
                        {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 fill-[#00bfff] text-[#00bfff]" />
                        ))}
                      </div>

                      {/* Review Text */}
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg md:text-xl text-slate-200 leading-relaxed mb-8 max-w-3xl"
                      >
                        "{testimonials[currentIndex].content}"
                      </motion.p>

                      {/* Author Section */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center gap-4"
                      >
                        {/* Avatar */}
                        {testimonials[currentIndex].profileImage ? (
                          <img
                            src={testimonials[currentIndex].profileImage}
                            alt={testimonials[currentIndex].name}
                            className="w-14 h-14 rounded-full object-cover border border-white/10"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center border border-white/10">
                            <span className="text-xl font-bold text-white">
                              {testimonials[currentIndex].name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}

                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-lg font-semibold text-white">
                              {testimonials[currentIndex].name}
                            </h4>
                            {testimonials[currentIndex].verifiedPurchase && (
                              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 border border-white/10">
                                <ShieldCheck className="w-3 h-3 text-green-400" />
                                <span className="text-xs font-medium text-green-400">Verified</span>
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-slate-400">
                            {testimonials[currentIndex].designation || 'Verified Customer'}
                          </p>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={prevTestimonial}
                className="w-10 h-10 rounded-full bg-slate-900/50 border border-white/10 flex items-center justify-center hover:border-white/20 hover:bg-slate-800 transition-all duration-200"
              >
                <ChevronLeft className="w-5 h-5 text-slate-400" />
              </button>
              
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentIndex(index);
                      setProgress(0);
                    }}
                    className={`h-1.5 rounded-full transition-all duration-200 ${
                      index === currentIndex
                        ? 'w-6 bg-[#00bfff]'
                        : 'w-1.5 bg-white/20 hover:bg-white/30'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={nextTestimonial}
                className="w-10 h-10 rounded-full bg-slate-900/50 border border-white/10 flex items-center justify-center hover:border-white/20 hover:bg-slate-800 transition-all duration-200"
              >
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Write Review Button */}
        <motion.div
          variants={itemVariants}
          className="mt-12 md:mt-16 text-center"
        >
          <Link href="/write-review">
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-white border border-white/10 bg-slate-900/50 hover:bg-slate-800 hover:border-white/20 transition-all duration-200"
            >
              <PenTool className="w-4 h-4 text-[#00bfff]" />
              Write a Review
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
