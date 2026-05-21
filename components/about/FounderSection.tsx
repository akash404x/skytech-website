'use client';

import { motion } from 'framer-motion';
import { Cpu, Zap, Rocket, Sparkles } from 'lucide-react';
import Image from 'next/image';

export default function FounderSection() {
  return (
    <section className="relative flex items-center justify-center px-4 py-12 md:py-20 lg:py-32">
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Founder Image Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative flex justify-center lg:justify-end order-2 lg:order-1"
          >
            {/* Animated Effects Behind Image */}
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Holographic Rings */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 border-2 border-blue-500/30 rounded-full"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute w-56 h-56 sm:w-72 sm:h-72 md:w-96 md:h-96 lg:w-[28rem] lg:h-[28rem] border border-purple-500/20 rounded-full"
              />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute w-64 h-64 sm:w-80 sm:h-80 md:w-[28rem] md:h-[28rem] lg:w-[32rem] lg:h-[32rem] border border-cyan-500/10 rounded-full"
              />

              {/* Floating Tech Elements */}
              <motion.div
                animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-6 -left-6 sm:-top-10 sm:-left-10 text-blue-400/50"
              >
                <Cpu className="w-8 h-8 sm:w-10 sm:h-10 md:w-14 md:h-14 lg:w-16 lg:h-16" />
              </motion.div>
              <motion.div
                animate={{ y: [0, 15, 0], rotate: [0, -15, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-6 -right-6 sm:-bottom-10 sm:-right-10 text-purple-400/50"
              >
                <Zap className="w-7 h-7 sm:w-9 sm:h-9 md:w-12 md:h-12 lg:w-14 lg:h-14" />
              </motion.div>
              <motion.div
                animate={{ y: [0, -25, 0], rotate: [0, 20, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute top-1/2 -right-8 sm:-right-12 md:-right-16 text-cyan-400/50"
              >
                <Rocket className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12" />
              </motion.div>

              {/* Glowing Particles */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 0.7, 0.3],
                  }}
                  transition={{
                    duration: 2 + i * 0.3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.2,
                  }}
                  className="absolute w-3 h-3 bg-blue-400 rounded-full blur-sm"
                  style={{
                    top: `${20 + i * 10}%`,
                    left: `${10 + i * 12}%`,
                  }}
                />
              ))}
            </div>

            {/* Founder Image */}
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10"
            >
              <div className="relative">
                {/* Glowing Border */}
                <motion.div
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(59, 130, 246, 0.5)',
                      '0 0 40px rgba(139, 92, 246, 0.7)',
                      '0 0 20px rgba(59, 130, 246, 0.5)',
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="w-56 h-56 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-full overflow-hidden border-4 border-blue-500/50 bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm"
                >
                  <Image
                    src="/founder.jpg"
                    alt="Akash Singh - Founder"
                    width={384}
                    height={384}
                    sizes="(min-width: 1024px) 384px, (min-width: 768px) 320px, 224px"
                    className="h-full w-full object-cover"
                  />
                </motion.div>

                {/* Sparkle Effects */}
                <motion.div
                  animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-4 -right-4 text-yellow-400"
                >
                  <Sparkles size={24} fill="currentColor" />
                </motion.div>
                <motion.div
                  animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -bottom-4 -left-4 text-blue-400"
                >
                  <Sparkles size={20} fill="currentColor" />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>

          {/* Founder Info Side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center lg:text-left order-1 lg:order-2"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="inline-block mb-4"
            >
              <span className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-full text-sm font-semibold border border-blue-500/30 backdrop-blur-sm">
                Meet Our Visionary
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent"
            >
              Akash Singh
            </motion.h1>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-xl sm:text-2xl md:text-3xl font-semibold mb-6 md:mb-8 text-blue-300"
            >
              Founder & Tech Innovator
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="space-y-4 text-base md:text-lg text-gray-300 leading-relaxed"
            >
              <p className="text-gray-200">
                A teenage tech enthusiast with an insatiable passion for electronics, IoT, Arduino, Raspberry Pi, robotics, and cutting-edge technology.
              </p>
              <p className="text-gray-300">
                I founded SkyTech with a mission to make electronics and innovation accessible to everyone. From building smart solutions to crafting futuristic projects, my focus is on creativity, innovation, and real-world tech learning.
              </p>
              <p className="text-gray-300">
                I believe in empowering the next generation of makers and innovators by providing quality products, modern technology, and affordable pricing.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="mt-6 md:mt-8 flex flex-wrap gap-3 md:gap-4 justify-center lg:justify-start"
            >
              <div className="px-3 py-1.5 md:px-4 md:py-2 bg-white/5 rounded-lg border border-white/10 backdrop-blur-sm">
                <span className="text-blue-400 font-semibold text-sm md:text-base">Arduino</span>
              </div>
              <div className="px-3 py-1.5 md:px-4 md:py-2 bg-white/5 rounded-lg border border-white/10 backdrop-blur-sm">
                <span className="text-purple-400 font-semibold text-sm md:text-base">IoT</span>
              </div>
              <div className="px-3 py-1.5 md:px-4 md:py-2 bg-white/5 rounded-lg border border-white/10 backdrop-blur-sm">
                <span className="text-cyan-400 font-semibold text-sm md:text-base">Robotics</span>
              </div>
              <div className="px-3 py-1.5 md:px-4 md:py-2 bg-white/5 rounded-lg border border-white/10 backdrop-blur-sm">
                <span className="text-pink-400 font-semibold text-sm md:text-base">Innovation</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
