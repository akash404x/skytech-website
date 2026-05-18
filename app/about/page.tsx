'use client';

import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimatedBackground from '@/components/about/AnimatedBackground';
import FounderSection from '@/components/about/FounderSection';
import AboutSkyTech from '@/components/about/AboutSkyTech';
import FeaturesSection from '@/components/about/FeaturesSection';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 relative overflow-hidden">
      <AnimatedBackground />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10"
      >
        <Navbar />
        <FounderSection />
        <AboutSkyTech />
        <FeaturesSection />
        <Footer />
      </motion.div>
    </div>
  );
}
