'use client';

import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Cpu, Zap, Wifi, Sparkles } from 'lucide-react';

export default function PremiumHero() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number; duration: number }>>([]);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  useEffect(() => {
    // Generate particles only on client side
    const newParticles = [...Array(20)].map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 5 + Math.random() * 5,
    }));
    setParticles(newParticles);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePosition({
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height,
        });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  };

  const floatingCards = [
    { icon: Cpu, position: 'top-left', delay: 0.3 },
    { icon: Wifi, position: 'top-right', delay: 0.5 },
    { icon: Zap, position: 'bottom-left', delay: 0.7 },
    { icon: Sparkles, position: 'bottom-right', delay: 0.9 },
  ];

  return (
    <motion.div
      ref={heroRef}
      style={{ y: y1, opacity }}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#020617]"
    >
      {/* Animated Circuit Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#020617] via-[#06122d] to-[#0b1736]" />
        
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 191, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 191, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            animation: 'gridMove 20s linear infinite',
          }}
        />
        
        {/* Radial Glows */}
        <motion.div
          animate={{
            x: mousePosition.x * 100 - 50,
            y: mousePosition.y * 100 - 50,
          }}
          transition={{ type: 'spring', damping: 30, stiffness: 100 }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00bfff] rounded-full blur-[120px] opacity-20"
        />
        <motion.div
          animate={{
            x: mousePosition.x * -100 + 50,
            y: mousePosition.y * -100 + 50,
          }}
          transition={{ type: 'spring', damping: 30, stiffness: 100 }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00e5ff] rounded-full blur-[120px] opacity-15"
        />
        
        {/* Floating Particles */}
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-1 h-1 bg-[#00bfff] rounded-full"
            initial={{ opacity: 0 }}
            animate={{
              y: [0, -100 - Math.random() * 200],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
            }}
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
      >
        {/* Badge */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00bfff]/10 border border-[#00bfff]/20 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-[#00bfff]" />
            <span className="text-sm font-medium text-[#00e5ff]">Building The Future Through Technology</span>
          </div>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          variants={itemVariants}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6"
        >
          <span className="block text-white mb-2">BUILDING THE</span>
          <span className="block bg-gradient-to-r from-[#00bfff] via-[#00e5ff] to-[#38bdf8] bg-clip-text text-transparent">
            FUTURE
          </span>
          <span className="block text-white mt-2">THROUGH TECHNOLOGY</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          variants={itemVariants}
          className="max-w-3xl mx-auto text-lg sm:text-xl md:text-2xl text-[#d6e4ff]/80 mb-12 leading-relaxed"
        >
          Sky Tech delivers advanced electronics, IoT solutions, software development,
          and innovative digital experiences that transform ideas into reality.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/products">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group relative px-8 py-4 bg-gradient-to-r from-[#00bfff] to-[#00e5ff] rounded-xl font-semibold text-[#020617] overflow-hidden transition-all duration-300 hover:shadow-[0_0_40px_rgba(0,191,255,0.4)]"
            >
              <span className="relative z-10 flex items-center gap-2">
                Explore Products
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#00e5ff] to-[#00bfff] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.button>
          </Link>
          <Link href="/services">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-xl font-semibold text-white border border-[#00bfff]/30 bg-[#00bfff]/5 backdrop-blur-sm hover:bg-[#00bfff]/10 hover:border-[#00bfff]/50 transition-all duration-300"
            >
              Our Services
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>

      {/* Floating Product Cards */}
      {floatingCards.map((card, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: card.delay, duration: 0.6 }}
          className={`absolute ${
            card.position === 'top-left' ? 'top-20 left-10' :
            card.position === 'top-right' ? 'top-20 right-10' :
            card.position === 'bottom-left' ? 'bottom-20 left-10' :
            'bottom-20 right-10'
          } hidden lg:block`}
        >
          <motion.div
            animate={{
              y: [0, -20, 0],
              rotate: [0, 5, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: index * 0.5,
            }}
            className="p-4 rounded-2xl bg-[#06122d]/60 backdrop-blur-xl border border-[#00bfff]/20 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
          >
            <card.icon className="w-8 h-8 text-[#00bfff]" />
          </motion.div>
        </motion.div>
      ))}

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-[#00bfff]/30 flex items-start justify-center p-2"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full bg-[#00bfff]"
          />
        </motion.div>
      </motion.div>

      <style jsx>{`
        @keyframes gridMove {
          0% { background-position: 0 0; }
          100% { background-position: 60px 60px; }
        }
      `}</style>
    </motion.div>
  );
}
