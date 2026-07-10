'use client';

import { motion } from 'framer-motion';
import { Cpu, Zap, Rocket, Sparkles, Code, Microchip } from 'lucide-react';
import Image from 'next/image';

export default function FounderSection() {
  return (
    <section className="relative flex items-center justify-center px-4 py-16 md:py-24 lg:py-32 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-cyan-500/5 pointer-events-none" />
      
      {/* Floating Tech Particles Background */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -30, 0],
              x: [0, (i % 2 === 0 ? 20 : -20), 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3,
            }}
            className="absolute w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full blur-sm"
            style={{
              top: `${10 + i * 8}%`,
              left: `${5 + i * 8}%`,
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Founder Image Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative flex justify-center lg:justify-start order-2 lg:order-1"
          >
            {/* Glassmorphism Background Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-3xl border border-white/10"
              style={{
                width: '420px',
                maxWidth: '100%',
                aspectRatio: '4/5',
              }}
            />

            {/* Floating Tech Icons */}
            <motion.div
              animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 -left-4 text-cyan-400/40 z-20"
            >
              <Microchip className="w-8 h-8 sm:w-10 sm:h-10" />
            </motion.div>
            <motion.div
              animate={{ y: [0, 12, 0], rotate: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-4 -right-4 text-purple-400/40 z-20"
            >
              <Code className="w-7 h-7 sm:w-9 sm:h-9" />
            </motion.div>
            <motion.div
              animate={{ y: [0, -18, 0], rotate: [0, 12, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              className="absolute top-1/3 -right-6 text-blue-400/40 z-20"
            >
              <Cpu className="w-6 h-6 sm:w-8 sm:h-8" />
            </motion.div>

            {/* Founder Image Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              whileHover={{ scale: 1.02 }}
              className="relative z-10 group cursor-pointer"
              style={{ width: '420px', maxWidth: '100%' }}
            >
              <div className="relative" style={{ aspectRatio: '4/5' }}>
                {/* Gradient Border */}
                <div 
                  className="absolute inset-0 rounded-[24px] p-[2px] bg-gradient-to-br from-[#00D4FF] via-[#7C4DFF] to-[#00D4FF]"
                  style={{
                    background: 'linear-gradient(135deg, #00D4FF 0%, #7C4DFF 50%, #00D4FF 100%)',
                  }}
                >
                  <div className="absolute inset-[2px] rounded-[22px] bg-[#0B1120]" />
                </div>

                {/* Glow Effect */}
                <motion.div
                  className="absolute inset-0 rounded-[24px] blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-350"
                  style={{
                    background: 'linear-gradient(135deg, #00D4FF 0%, #7C4DFF 100%)',
                  }}
                />

                {/* Image Container */}
                <div className="relative rounded-[22px] overflow-hidden" style={{ aspectRatio: '4/5' }}>
                  <Image
                    src="/founder.jpg"
                    alt="Akash Singh - Founder"
                    fill
                    sizes="(min-width: 1024px) 420px, (min-width: 768px) 350px, 280px"
                    className="object-cover"
                    style={{ objectPosition: 'center center' }}
                    priority
                  />
                  
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120]/20 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Sparkle Effects */}
                <motion.div
                  animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-3 -right-3 text-cyan-400 z-30"
                >
                  <Sparkles size={20} fill="currentColor" />
                </motion.div>
                <motion.div
                  animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -bottom-3 -left-3 text-purple-400 z-30"
                >
                  <Sparkles size={16} fill="currentColor" />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>

          {/* Founder Info Side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="order-1 lg:order-2 text-left"
          >
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-2xl sm:text-3xl font-bold text-cyan-400 mb-6 uppercase tracking-wider"
            >
              Meet Our Visionary
            </motion.h3>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-blue-400 bg-clip-text text-transparent leading-tight"
            >
              Akash Singh
            </motion.h1>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-xl sm:text-2xl md:text-3xl font-semibold mb-8 text-cyan-300/90"
            >
              Founder & Tech Innovator
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="max-w-2xl"
            >
              <p className="text-gray-200 text-base md:text-lg leading-[1.8] mb-6">
                A teenage tech enthusiast with an insatiable passion for electronics, IoT, Arduino, Raspberry Pi, robotics, and cutting-edge technology.
              </p>
              <p className="text-gray-300 text-base md:text-lg leading-[1.8] mb-6">
                I founded SkyTech with a mission to make electronics and innovation accessible to everyone. From building smart solutions to crafting futuristic projects, my focus is on creativity, innovation, and real-world tech learning.
              </p>
              <p className="text-gray-300 text-base md:text-lg leading-[1.8] mb-8">
                I believe in empowering the next generation of makers and innovators by providing quality products, modern technology, and affordable pricing.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="flex flex-wrap gap-3 mb-10"
            >
              <div className="px-4 py-2 bg-gradient-to-r from-cyan-500/10 to-cyan-500/5 rounded-xl border border-cyan-500/20 backdrop-blur-sm">
                <span className="text-cyan-400 font-semibold text-sm">Arduino</span>
              </div>
              <div className="px-4 py-2 bg-gradient-to-r from-purple-500/10 to-purple-500/5 rounded-xl border border-purple-500/20 backdrop-blur-sm">
                <span className="text-purple-400 font-semibold text-sm">IoT</span>
              </div>
              <div className="px-4 py-2 bg-gradient-to-r from-blue-500/10 to-blue-500/5 rounded-xl border border-blue-500/20 backdrop-blur-sm">
                <span className="text-blue-400 font-semibold text-sm">Robotics</span>
              </div>
              <div className="px-4 py-2 bg-gradient-to-r from-pink-500/10 to-pink-500/5 rounded-xl border border-pink-500/20 backdrop-blur-sm">
                <span className="text-pink-400 font-semibold text-sm">Innovation</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex justify-center sm:justify-start"
            >
              <motion.a
                href="mailto:akash@theskytechnology.in?subject=Contact%20from%20Sky%20Tech%20Website"
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                className="group relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full font-bold text-white text-base shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 w-full sm:w-fit"
              >
                <span className="relative z-10">Contact Founder</span>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
              </motion.a>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
