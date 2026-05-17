'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  Microchip,
  Wifi,
  Cpu,
  Zap,
  Shield,
  Truck,
  Headphones,
  RefreshCw,
} from 'lucide-react';

export default function FeaturesSection() {
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
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  const features = [
    {
      icon: Microchip,
      title: 'Arduino Boards',
      description: 'Wide range of Arduino boards from UNO to Mega, perfect for all your projects.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Wifi,
      title: 'IoT Solutions',
      description: 'ESP8266, ESP32, and IoT modules for smart home and automation projects.',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Cpu,
      title: 'Sensors & Modules',
      description: 'Temperature, humidity, motion sensors and more for data collection.',
      color: 'from-green-500 to-teal-500',
    },
    {
      icon: Zap,
      title: 'Motors & Drivers',
      description: 'Servo, stepper motors and drivers for robotics and automation.',
      color: 'from-yellow-500 to-orange-500',
    },
    {
      icon: Shield,
      title: 'Quality Guaranteed',
      description: 'All products tested and verified for reliability and performance.',
      color: 'from-red-500 to-pink-500',
    },
    {
      icon: Truck,
      title: 'Fast Shipping',
      description: 'Quick delivery across the country to keep your projects on track.',
      color: 'from-indigo-500 to-blue-500',
    },
    {
      icon: Headphones,
      title: 'Expert Support',
      description: 'Technical assistance and guidance for your project development.',
      color: 'from-teal-500 to-green-500',
    },
    {
      icon: RefreshCw,
      title: 'Easy Returns',
      description: 'Hassle-free return policy if products dont meet your expectations.',
      color: 'from-orange-500 to-red-500',
    },
  ];

  return (
    <section ref={ref} className="relative py-20 md:py-32 px-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Why Choose SkyTech?
          </h2>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            We provide everything you need to bring your electronic projects to life with quality
            products and exceptional service.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -10 }}
              whileTap={{ scale: 0.95 }}
              className="group relative bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
            >
              {/* Animated gradient background on hover */}
              <motion.div
                className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
              />

              {/* Icon */}
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: index * 0.2 }}
                className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}
              >
                <feature.icon className="w-8 h-8 text-white" />
              </motion.div>

              {/* Content */}
              <h3 className="text-xl md:text-2xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base leading-relaxed">
                {feature.description}
              </p>

              {/* Decorative element */}
              <motion.div
                className={`absolute -bottom-4 -right-4 w-20 h-20 bg-gradient-to-r ${feature.color} opacity-20 rounded-full blur-xl group-hover:opacity-40 transition-opacity`}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Call to Action */}
        <motion.div variants={itemVariants} className="text-center mt-16">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
          >
            Explore All Products
          </motion.button>
        </motion.div>
      </motion.div>
    </section>
  );
}
