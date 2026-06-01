'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  Lightbulb,
  ShieldCheck,
  HeadsetIcon,
  Rocket,
} from 'lucide-react';

export default function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  };

  const features = [
    {
      icon: Lightbulb,
      title: 'Innovation',
      description: 'Cutting-edge technology and forward-thinking solutions that push the boundaries of what\'s possible.',
      gradient: 'from-[#00bfff] to-[#00e5ff]',
    },
    {
      icon: ShieldCheck,
      title: 'Reliability',
      description: 'Rigorous quality testing and premium components ensure consistent performance you can trust.',
      gradient: 'from-[#38bdf8] to-[#22d3ee]',
    },
    {
      icon: HeadsetIcon,
      title: 'Expert Support',
      description: 'Dedicated technical assistance from experienced engineers who understand your project needs.',
      gradient: 'from-[#0ea5e9] to-[#06b6d4]',
    },
    {
      icon: Rocket,
      title: 'Future Ready',
      description: 'Scalable solutions designed to grow with your projects and adapt to emerging technologies.',
      gradient: 'from-[#0284c7] to-[#0891b2]',
    },
  ];

  return (
    <section ref={ref} className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-[#06122d] to-[#020617]" />
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#00bfff] rounded-full blur-[200px]" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Why Choose <span className="bg-gradient-to-r from-[#00bfff] to-[#00e5ff] bg-clip-text text-transparent">Sky Tech</span>
          </h2>
          <p className="max-w-3xl mx-auto text-lg md:text-xl text-[#d6e4ff]/80">
            We deliver excellence through innovation, quality, and unwavering commitment to your success
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -8 }}
              className="group relative"
            >
              <div className="relative h-full p-8 rounded-2xl bg-[#06122d]/40 backdrop-blur-xl border border-[#00bfff]/10 hover:border-[#00bfff]/30 transition-all duration-500 overflow-hidden">
                {/* Gradient Glow on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                
                {/* Icon */}
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className={`relative w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-[0_0_30px_rgba(0,191,255,0.3)]`}
                >
                  <feature.icon className="w-8 h-8 text-white" />
                </motion.div>

                {/* Content */}
                <h3 className="relative text-2xl font-bold text-white mb-3 group-hover:text-[#00e5ff] transition-colors">
                  {feature.title}
                </h3>
                <p className="relative text-[#d6e4ff]/70 leading-relaxed">
                  {feature.description}
                </p>

                {/* Decorative Corner */}
                <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl ${feature.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-bl-3xl`} />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
