'use client';

import { motion } from 'framer-motion';
import { Cpu, Zap, Rocket, Sparkles } from 'lucide-react';

export default function FounderSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Founder Image Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative flex justify-center lg:justify-end"
          >
            {/* Animated Effects Behind Image */}
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Holographic Rings */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute w-80 h-80 border-2 border-blue-500/30 rounded-full"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute w-96 h-96 border border-purple-500/20 rounded-full"
              />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute w-[28rem] h-[28rem] border border-cyan-500/10 rounded-full"
              />

              {/* Floating Tech Elements */}
              <motion.div
                animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-10 -left-10 text-blue-400/50"
              >
                <Cpu size={60} />
              </motion.div>
              <motion.div
                animate={{ y: [0, 15, 0], rotate: [0, -15, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-10 -right-10 text-purple-400/50"
              >
                <Zap size={50} />
              </motion.div>
              <motion.div
                animate={{ y: [0, -25, 0], rotate: [0, 20, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute top-1/2 -right-16 text-cyan-400/50"
              >
                <Rocket size={40} />
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
                  className="w-72 h-72 md:w-96 md:h-96 rounded-full overflow-hidden border-4 border-blue-500/50 bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm"
                >
                  <img
                    src="/images/founder.png"
                    alt="Akash Singh - Founder"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"%3E%3Crect fill="%231e293b" width="400" height="400"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="24" fill="%2364748b"%3EFounder Image%3C/text%3E%3C/svg%3E';
                    }}
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
            className="text-center lg:text-left"
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
              className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent"
            >
              Akash Singh
            </motion.h1>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-2xl md:text-3xl font-semibold mb-8 text-blue-300"
            >
              Founder & Tech Innovator
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="space-y-4 text-lg text-gray-300 leading-relaxed"
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
              className="mt-8 flex flex-wrap gap-4 justify-center lg:justify-start"
            >
              <div className="px-4 py-2 bg-white/5 rounded-lg border border-white/10 backdrop-blur-sm">
                <span className="text-blue-400 font-semibold">Arduino</span>
              </div>
              <div className="px-4 py-2 bg-white/5 rounded-lg border border-white/10 backdrop-blur-sm">
                <span className="text-purple-400 font-semibold">IoT</span>
              </div>
              <div className="px-4 py-2 bg-white/5 rounded-lg border border-white/10 backdrop-blur-sm">
                <span className="text-cyan-400 font-semibold">Robotics</span>
              </div>
              <div className="px-4 py-2 bg-white/5 rounded-lg border border-white/10 backdrop-blur-sm">
                <span className="text-pink-400 font-semibold">Innovation</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
