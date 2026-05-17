'use client';

import { motion } from 'framer-motion';
import { Target, Lightbulb, TrendingUp, Globe } from 'lucide-react';

export default function AboutSkyTech() {
  return (
    <section className="relative py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-block px-4 py-2 bg-purple-500/20 text-purple-400 rounded-full text-sm font-semibold border border-purple-500/30 backdrop-blur-sm mb-6"
          >
            About SkyTech
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent"
          >
            Building India's Next-Generation
            <br />
            Electronics Innovation Ecosystem
          </motion.h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Description Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-6"
          >
            <div className="p-8 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm hover:border-blue-500/30 transition-all duration-300">
              <p className="text-lg text-gray-200 leading-relaxed">
                SkyTech is a cutting-edge electronics and innovation platform dedicated to empowering students, makers, and innovators across India. We provide a comprehensive range of Arduino boards, IoT modules, sensors, robotics components, and smart tech solutions.
              </p>
            </div>

            <div className="p-8 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm hover:border-purple-500/30 transition-all duration-300">
              <p className="text-lg text-gray-200 leading-relaxed">
                Our mission is to democratize technology by making quality electronics accessible and affordable. We focus on providing modern technology solutions that enable real-world learning and innovation.
              </p>
            </div>

            <div className="p-8 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl border border-blue-500/20 backdrop-blur-sm">
              <p className="text-xl text-blue-200 leading-relaxed font-semibold">
                "Building India's next-generation electronics innovation ecosystem"
              </p>
            </div>
          </motion.div>

          {/* Stats/Features Side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="grid grid-cols-2 gap-6"
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300 group"
            >
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-500/30 transition-colors">
                <Target className="text-blue-400" size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Our Mission</h3>
              <p className="text-gray-400 text-sm">Empower innovators with accessible technology</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm hover:border-purple-500/50 transition-all duration-300 group"
            >
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-500/30 transition-colors">
                <Lightbulb className="text-purple-400" size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Innovation</h3>
              <p className="text-gray-400 text-sm">Cutting-edge solutions for modern problems</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm hover:border-cyan-500/50 transition-all duration-300 group"
            >
              <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-cyan-500/30 transition-colors">
                <TrendingUp className="text-cyan-400" size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Quality</h3>
              <p className="text-gray-400 text-sm">Premium products at affordable prices</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm hover:border-pink-500/50 transition-all duration-300 group"
            >
              <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-pink-500/30 transition-colors">
                <Globe className="text-pink-400" size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Vision</h3>
              <p className="text-gray-400 text-sm">Global impact through local innovation</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
