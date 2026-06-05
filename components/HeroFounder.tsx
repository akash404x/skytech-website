'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Zap, Rocket, Target, Users, Award, Lightbulb } from 'lucide-react';

export default function HeroFounder() {
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
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  } as const;

  const stats = [
    { icon: Users, label: 'Happy Customers', value: '5000+' },
    { icon: Award, label: 'Projects Completed', value: '200+' },
    { icon: Zap, label: 'Products Available', value: '1000+' },
    { icon: Target, label: 'Success Rate', value: '99%' },
  ];

  return (
    <section ref={ref} className="relative py-20 md:py-32 px-4 overflow-hidden">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        className="max-w-7xl mx-auto"
      >
        {/* Founder Image with animated effects */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col lg:flex-row items-center gap-12 mb-16"
        >
          <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96">
            <motion.div
              animate={{
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-20 blur-2xl"
            />
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="relative w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-2xl"
            >
              <div className="text-center text-white">
                <Rocket className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-4" />
                <p className="text-2xl md:text-3xl font-bold">Founder</p>
              </div>
            </motion.div>

            {/* Floating elements around founder */}
            {[Lightbulb, Zap, Target].map((Icon, index) => (
              <motion.div
                key={index}
                animate={{
                  y: [0, -20, 0],
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 4 + index,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className={`absolute w-12 h-12 md:w-16 md:h-16 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center ${
                  index === 0 ? 'top-0 -right-4' : index === 1 ? 'bottom-0 -left-4' : 'top-1/2 -right-8'
                }`}
              >
                <Icon className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
              </motion.div>
            ))}
          </div>

          <div className="flex-1 text-center lg:text-left">
            <motion.h2
              variants={itemVariants}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            >
              Meet the Visionary Behind SkyTech
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-6 leading-relaxed"
            >
              Founded with a passion for innovation and technology, SkyTech has been at the forefront of
              providing cutting-edge Arduino, IoT, and robotics solutions. Our mission is to empower
              creators, students, and professionals with the tools they need to bring their ideas to life.
            </motion.p>
            <motion.p
              variants={itemVariants}
              className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed"
            >
              From humble beginnings to becoming a trusted partner for thousands of customers, we continue
              to push the boundaries of what&apos;s possible in electronics and automation.
            </motion.p>
            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Learn More About Us
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all"
            >
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: index * 0.5,
                  ease: 'easeInOut',
                }}
                className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-4 mx-auto"
              >
                <stat.icon className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </motion.div>
              <motion.p
                animate={{ scale: [1, 1.1, 1] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: index * 0.3,
                }}
                className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2"
              >
                {stat.value}
              </motion.p>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 text-center">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
