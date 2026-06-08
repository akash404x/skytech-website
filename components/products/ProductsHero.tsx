'use client';

import { motion } from 'framer-motion';
import { Gift, ArrowRight, Sparkles } from 'lucide-react';

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
        
        {/* Promotional Notification Section */}
        <motion.div
          variants={textItem}
          className="mt-8 mx-auto max-w-2xl"
        >
          <div className="relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-blue-900/40 via-purple-900/30 to-blue-900/40 backdrop-blur-xl p-6 md:p-8 shadow-2xl shadow-cyan-500/10">
            {/* Animated gradient border effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-cyan-500/10 animate-pulse" />
            
            <div className="relative z-10">
              <div className="flex items-start gap-3 mb-3">
                <div className="flex-shrink-0 p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30">
                  <Gift className="h-5 w-5 text-cyan-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg md:text-xl font-bold text-white mb-2">
                    Can't find the Arduino & IOT product you're looking for?
                  </h3>
                  <p className="text-sm md:text-base text-cyan-200/80 leading-relaxed">
                    If a product is not listed in our store, let us know and get an additional <span className="text-cyan-400 font-semibold">₹50 OFF</span> on your purchase.
                  </p>
                </div>
              </div>
              
              <motion.button
                onClick={() => {
                  const message = encodeURIComponent(`Hello SkyTech Team,
I couldn't find the product I was looking for on your website.

Product Name:
________________

Please help me source this product. I would also like to claim the additional ₹50 OFF offer.

Thank you.`);
                  window.open(`https://wa.me/919519322323?text=${message}`, '_blank');
                }}
                className="mt-4 w-full sm:w-auto group relative overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition-all duration-300 hover:shadow-cyan-500/50 hover:scale-105"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Pulse/glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/50 to-blue-600/50 animate-pulse opacity-50" />
                
                <div className="relative flex items-center justify-center gap-2">
                  <span>Request a Product & Get ₹50 OFF</span>
                  <motion.div
                    className="flex items-center"
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </motion.div>
                </div>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
