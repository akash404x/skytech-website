'use client';

import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight, PenTool } from 'lucide-react';
import Link from 'next/link';
import { collection, onSnapshot, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Review } from '@/lib/types';

export default function TestimonialsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [testimonials, setTestimonials] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    if (testimonials.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section ref={ref} className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-[#06122d] to-[#020617]" />
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#00bfff] rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-[#00e5ff] rounded-full blur-[150px]" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            What Our <span className="bg-gradient-to-r from-[#00bfff] to-[#00e5ff] bg-clip-text text-transparent">Customers Say</span>
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-[#d6e4ff]/80">
            Real feedback from real innovators who trust Sky Tech
          </p>
        </motion.div>

        {/* Testimonial Carousel */}
        {loading ? (
          <motion.div variants={itemVariants} className="relative max-w-4xl mx-auto">
            <div className="p-8 md:p-12 rounded-3xl bg-[#06122d]/40 backdrop-blur-xl border border-[#00bfff]/20">
              <div className="animate-pulse space-y-4">
                <div className="h-24 bg-[#00bfff]/10 rounded" />
                <div className="flex gap-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-5 h-5 bg-[#00bfff]/10 rounded" />
                  ))}
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[#00bfff]/10 rounded-full" />
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-[#00bfff]/10 rounded" />
                    <div className="h-3 w-24 bg-[#00bfff]/10 rounded" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : testimonials.length === 0 ? (
          <motion.div variants={itemVariants} className="text-center py-12">
            <Star className="w-16 h-16 text-[#d6e4ff]/30 mx-auto mb-4" />
            <p className="text-[#d6e4ff]/70">No reviews yet. Be the first to share your experience!</p>
          </motion.div>
        ) : (
          <motion.div variants={itemVariants} className="relative max-w-4xl mx-auto">
            <div className="relative overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5 }}
                  className="relative"
                >
                  <div className="relative p-8 md:p-12 rounded-3xl bg-[#06122d]/40 backdrop-blur-xl border border-[#00bfff]/20">
                    {/* Quote Icon */}
                    <div className="absolute top-6 left-6 w-12 h-12 rounded-full bg-[#00bfff]/10 flex items-center justify-center">
                      <Quote className="w-6 h-6 text-[#00bfff]" />
                    </div>

                    {/* Content */}
                    <div className="relative z-10">
                      <p className="text-xl md:text-2xl text-[#d6e4ff] leading-relaxed mb-8">
                        "{testimonials[currentIndex].content}"
                      </p>

                      {/* Rating */}
                      <div className="flex gap-1 mb-6">
                        {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 fill-[#00bfff] text-[#00bfff]" />
                        ))}
                      </div>

                      {/* Author */}
                      <div className="flex items-center gap-4">
                        {testimonials[currentIndex].profileImage ? (
                          <img
                            src={testimonials[currentIndex].profileImage}
                            alt={testimonials[currentIndex].name}
                            className="w-14 h-14 rounded-full object-cover border border-[#00bfff]/20"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#00bfff] to-[#00e5ff] flex items-center justify-center">
                            <span className="text-xl font-bold text-[#020617]">
                              {testimonials[currentIndex].name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <h4 className="text-lg font-semibold text-white">{testimonials[currentIndex].name}</h4>
                          <p className="text-[#d6e4ff]/60">{testimonials[currentIndex].designation || 'Verified Customer'}</p>
                          {testimonials[currentIndex].verifiedPurchase && (
                            <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-green-500/20 border border-green-500/40 text-green-400 text-xs font-semibold">
                              ✓ Verified Purchase
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#00bfff]/10 to-transparent rounded-bl-3xl" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-[#00e5ff]/10 to-transparent rounded-tr-3xl" />
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={prevTestimonial}
                className="w-12 h-12 rounded-full bg-[#06122d]/40 backdrop-blur-xl border border-[#00bfff]/20 flex items-center justify-center hover:border-[#00bfff]/40 hover:bg-[#00bfff]/10 transition-all duration-300"
              >
                <ChevronLeft className="w-5 h-5 text-[#00bfff]" />
              </button>
              
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? 'w-8 bg-[#00bfff]'
                        : 'bg-[#00bfff]/30 hover:bg-[#00bfff]/50'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={nextTestimonial}
                className="w-12 h-12 rounded-full bg-[#06122d]/40 backdrop-blur-xl border border-[#00bfff]/20 flex items-center justify-center hover:border-[#00bfff]/40 hover:bg-[#00bfff]/10 transition-all duration-300"
              >
                <ChevronRight className="w-5 h-5 text-[#00bfff]" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Write Review Button */}
        <motion.div
          variants={itemVariants}
          className="mt-12 text-center"
        >
          <Link href="/write-review">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white border border-[#00bfff]/30 bg-[#00bfff]/5 backdrop-blur-sm hover:bg-[#00bfff]/10 hover:border-[#00bfff]/50 transition-all duration-300"
            >
              <PenTool className="w-5 h-5 text-[#00bfff]" />
              Write a Review
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
