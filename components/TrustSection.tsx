'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Shield, Truck, Clock, Award, CheckCircle, Lock } from 'lucide-react';

export default function TrustSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  } as const;

  const badges = [
    {
      icon: Shield,
      title: 'Verified Business',
      description: 'Officially registered and verified company',
      gradient: 'from-[#00bfff] to-[#00e5ff]',
    },
    {
      icon: Lock,
      title: 'Secure Payments',
      description: '256-bit SSL encryption for all transactions',
      gradient: 'from-[#38bdf8] to-[#22d3ee]',
    },
    {
      icon: Truck,
      title: 'Fast Shipping',
      description: 'Quick delivery with tracking',
      gradient: 'from-[#0ea5e9] to-[#06b6d4]',
    },
    {
      icon: Clock,
      title: '24/7 Support',
      description: 'Round-the-clock customer assistance',
      gradient: 'from-[#0284c7] to-[#0891b2]',
    },
    {
      icon: Award,
      title: 'Quality Assured',
      description: 'Premium products with warranty',
      gradient: 'from-[#0369a1] to-[#0e7490]',
    },
    {
      icon: CheckCircle,
      title: 'Satisfaction Guaranteed',
      description: 'Easy returns and refunds policy',
      gradient: 'from-[#075985] to-[#155e75]',
    },
  ];

  return (
    <section ref={ref} className="relative py-20 md:py-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-[#06122d] to-[#020617]" />
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00bfff] rounded-full blur-[200px]" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Trusted By <span className="bg-gradient-to-r from-[#00bfff] to-[#00e5ff] bg-clip-text text-transparent">Innovators</span>
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-[#d6e4ff]/80">
            Your trust is our priority. We're committed to providing secure, reliable, and exceptional service.
          </p>
        </motion.div>

        {/* Trust Badges */}
        <motion.div variants={containerVariants} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {badges.map((badge, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.05 }}
              className="group"
            >
              <div className="relative h-full p-6 rounded-2xl bg-[#06122d]/40 backdrop-blur-xl border border-[#00bfff]/10 hover:border-[#00bfff]/30 transition-all duration-500 text-center">
                {/* Icon */}
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className={`relative w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br ${badge.gradient} flex items-center justify-center shadow-[0_0_30px_rgba(0,191,255,0.3)]`}
                >
                  <badge.icon className="w-7 h-7 text-white" />
                </motion.div>

                {/* Content */}
                <h3 className="text-sm font-bold text-white mb-1">{badge.title}</h3>
                <p className="text-xs text-[#d6e4ff]/60 leading-relaxed">{badge.description}</p>

                {/* Glow on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${badge.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-2xl`} />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
