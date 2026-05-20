'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';
import { Cpu, Globe, Heart, Shield, TrendingUp, Clock } from 'lucide-react';

export default function AboutSkyTech() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

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
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  const values = [
    {
      icon: Heart,
      title: 'Customer First',
      description: 'We prioritize your needs and satisfaction above everything else.',
    },
    {
      icon: Shield,
      title: 'Quality Assurance',
      description: 'Every product undergoes rigorous testing to ensure reliability.',
    },
    {
      icon: TrendingUp,
      title: 'Continuous Innovation',
      description: 'We constantly evolve to bring you the latest technology.',
    },
    {
      icon: Clock,
      title: 'Timely Delivery',
      description: 'Fast and reliable shipping to get your projects moving.',
    },
  ];

  const milestones = [
    { year: '2018', event: 'SkyTech Founded' },
    { year: '2020', event: '1000+ Customers' },
    { year: '2022', event: 'Expanded Product Line' },
    { year: '2024', event: '5000+ Happy Customers' },
  ];

  return (
    <section ref={ref} className="relative py-20 md:py-32 px-4 bg-white dark:bg-gray-900">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-16">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Globe className="w-8 h-8 md:w-10 md:h-10 text-white" />
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            About SkyTech
          </h2>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Your trusted partner for Arduino, IoT, robotics, and electronics solutions. We're
            passionate about empowering creators to bring their innovative ideas to life.
          </p>
        </motion.div>

        {/* Story Section */}
        <motion.div variants={itemVariants} className="mb-20">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800 rounded-3xl p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <h3 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-white">
                  Our Story
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                  SkyTech was born from a simple idea: make electronics and programming accessible to
                  everyone. What started as a small passion project has grown into a thriving community
                  of creators, students, and professionals.
                </p>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Today, we serve thousands of customers worldwide, providing high-quality components,
                  expert guidance, and unparalleled support for projects of all sizes.
                </p>
              </div>
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-48 h-48 md:w-64 md:h-64 rounded-2xl overflow-hidden shadow-2xl"
              >
                <Image
                  src="/founder.jpg"
                  alt="Founder of SkyTech"
                  width={256}
                  height={256}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Values Section */}
        <motion.div variants={itemVariants} className="mb-20">
          <h3 className="text-3xl md:text-4xl font-bold mb-8 text-center text-gray-900 dark:text-white">
            Our Core Values
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl hover:shadow-xl transition-all"
              >
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, delay: index * 0.5 }}
                  className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-4"
                >
                  <value.icon className="w-7 h-7 text-white" />
                </motion.div>
                <h4 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{value.title}</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Timeline Section */}
        <motion.div variants={itemVariants}>
          <h3 className="text-3xl md:text-4xl font-bold mb-8 text-center text-gray-900 dark:text-white">
            Our Journey
          </h3>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-blue-500 to-purple-500 hidden md:block" />
            
            <div className="space-y-8 md:space-y-0">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className={`flex flex-col md:flex-row items-center ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  <div className="flex-1 text-center md:text-left md:pr-8 mb-4 md:mb-0">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-4 rounded-xl inline-block shadow-lg"
                    >
                      <span className="text-2xl md:text-3xl font-bold">{milestone.year}</span>
                    </motion.div>
                    <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">{milestone.event}</p>
                  </div>
                  
                  {/* Timeline dot */}
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                    className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full border-4 border-white dark:border-gray-900 z-10 hidden md:block"
                  />
                  
                  <div className="flex-1 hidden md:block" />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
