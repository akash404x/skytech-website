'use client';

import { motion } from 'framer-motion';
import { 
  Microchip, 
  Truck, 
  Cpu, 
  Lightbulb, 
  Shield, 
  HeadphonesIcon 
} from 'lucide-react';

const features = [
  {
    icon: Microchip,
    title: 'Premium Electronics',
    description: 'High-quality Arduino boards, sensors, and components from trusted manufacturers',
    gradient: 'from-blue-500 to-cyan-500',
    glow: 'blue',
  },
  {
    icon: Truck,
    title: 'Fast Delivery',
    description: 'Quick and reliable shipping across India with real-time tracking',
    gradient: 'from-purple-500 to-pink-500',
    glow: 'purple',
  },
  {
    icon: Cpu,
    title: 'IoT & Robotics',
    description: 'Complete solutions for IoT projects, robotics, and automation',
    gradient: 'from-cyan-500 to-teal-500',
    glow: 'cyan',
  },
  {
    icon: Lightbulb,
    title: 'Smart Innovation',
    description: 'Cutting-edge products for modern tech enthusiasts and makers',
    gradient: 'from-yellow-500 to-orange-500',
    glow: 'yellow',
  },
  {
    icon: Shield,
    title: 'Secure Shopping',
    description: 'Safe and secure payment options with buyer protection',
    gradient: 'from-green-500 to-emerald-500',
    glow: 'green',
  },
  {
    icon: HeadphonesIcon,
    title: 'Technical Support',
    description: 'Expert guidance and support for all your projects and queries',
    gradient: 'from-red-500 to-pink-500',
    glow: 'red',
  },
];

export default function FeaturesSection() {
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
            className="inline-block px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-full text-sm font-semibold border border-cyan-500/30 backdrop-blur-sm mb-6"
          >
            Why Choose Us
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent"
          >
            Features That Set Us Apart
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl text-gray-400 max-w-2xl mx-auto"
          >
            Experience the future of electronics with our premium features and unmatched service
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                whileHover={{ 
                  scale: 1.05, 
                  y: -10,
                  boxShadow: `0 20px 40px rgba(59, 130, 246, 0.3)`,
                }}
                className="group relative p-8 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm overflow-hidden"
              >
                {/* Animated Gradient Background on Hover */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                />

                {/* Glow Effect */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`absolute -top-20 -right-20 w-40 h-40 bg-${feature.glow}-500/20 rounded-full blur-3xl`}
                />

                {/* Icon */}
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className={`relative w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}
                >
                  <Icon className="text-white" size={32} />
                </motion.div>

                {/* Content */}
                <h3 className="relative text-2xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 transition-all duration-300">
                  {feature.title}
                </h3>
                <p className="relative text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                  {feature.description}
                </p>

                {/* Decorative Elements */}
                <motion.div
                  initial={{ scale: 0 }}
                  whileHover={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="absolute bottom-4 right-4 w-2 h-2 bg-blue-400 rounded-full"
                />
                <motion.div
                  initial={{ scale: 0 }}
                  whileHover={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="absolute bottom-4 right-8 w-1 h-1 bg-purple-400 rounded-full"
                />
              </motion.div>
            );
          })}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-full shadow-lg hover:shadow-blue-500/50 transition-all duration-300"
          >
            Explore Our Products
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
