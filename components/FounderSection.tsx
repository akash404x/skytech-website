'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';
import { Award, Target, Rocket, Sparkles } from 'lucide-react';

export default function FounderSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

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
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  };

  const values = [
    {
      icon: Target,
      title: 'Vision',
      description: 'To revolutionize the technology landscape by making advanced electronics and IoT solutions accessible to everyone.',
    },
    {
      icon: Rocket,
      title: 'Mission',
      description: 'Empowering innovators and creators with cutting-edge tools, expert guidance, and unparalleled support.',
    },
    {
      icon: Award,
      title: 'Journey',
      description: 'From a small workshop to a leading technology company, driven by passion for innovation and excellence.',
    },
  ];

  return (
    <section ref={ref} className="relative py-24 md:py-32 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-[#06122d] to-[#020617]" />
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00bfff] rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#00e5ff] rounded-full blur-[150px]" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        {/* Section Header */}
        <motion.div variants={itemVariants} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00bfff]/10 border border-[#00bfff]/20 backdrop-blur-sm mb-6">
            <Sparkles className="w-4 h-4 text-[#00bfff]" />
            <span className="text-sm font-medium text-[#00e5ff]">Leadership</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Meet The Founder
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-[#d6e4ff]/80">
            The vision behind Sky Tech's commitment to innovation and excellence
          </p>
        </motion.div>

        {/* Founder Content */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image Side */}
          <motion.div variants={itemVariants} className="relative">
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-[#06122d] to-[#0b1736] border border-[#00bfff]/20 shadow-[0_0_60px_rgba(0,191,255,0.15)]">
              {/* Founder Image */}
              <Image
                src="/founder.jpg"
                alt="Founder"
                fill
                className="object-cover"
                style={{ objectPosition: 'center top' }}
                priority
              />
              
              {/* Decorative Elements */}
              <div className="absolute top-4 right-4 w-20 h-20 rounded-full bg-[#00bfff]/10 blur-xl" />
              <div className="absolute bottom-4 left-4 w-16 h-16 rounded-full bg-[#00e5ff]/10 blur-xl" />
            </div>

            {/* Floating Badge */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -bottom-6 -right-6 px-6 py-3 rounded-2xl bg-[#06122d]/90 backdrop-blur-xl border border-[#00bfff]/30 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00bfff] to-[#00e5ff] flex items-center justify-center">
                  <Award className="w-5 h-5 text-[#020617]" />
                </div>
                <div>
                 <p className="text-[#39ff14] font-bold text-xl">Akash Singh</p>
                <p className="text-white font-semibold">Founder</p>
                <p className="text-[#d6e4ff]/70 text-sm">Sky Tech</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Content Side */}
          <motion.div variants={itemVariants} className="space-y-8">
            <div>
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Building Tomorrow's Technology Today
              </h3>
              <p className="text-lg text-[#d6e4ff]/80 leading-relaxed">
                With a passion for innovation and a commitment to excellence, I founded Sky Tech to bridge the gap between 
                cutting-edge technology and accessible solutions. Our journey began with a simple belief: everyone deserves 
                access to quality electronics and expert guidance.
              </p>
            </div>

            {/* Values */}
            <div className="space-y-6">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  whileHover={{ x: 8 }}
                  className="flex gap-4 p-4 rounded-xl bg-[#06122d]/40 backdrop-blur-sm border border-[#00bfff]/10 hover:border-[#00bfff]/30 transition-all duration-300"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#00bfff]/20 to-[#00e5ff]/20 flex items-center justify-center border border-[#00bfff]/20">
                    <value.icon className="w-6 h-6 text-[#00bfff]" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-white mb-1">{value.title}</h4>
                    <p className="text-[#d6e4ff]/70">{value.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Signature */}
            <div className="pt-4">
              <div className="text-[#00bfff] text-2xl font-signature italic">
                "Innovation is not just about technology—it's about people."
              </div>
              <p className="text-[#d6e4ff]/60 mt-2">— Akash Singh, Founder, Sky Tech</p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
