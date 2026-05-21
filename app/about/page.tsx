'use client';

import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FounderSection from '@/components/about/FounderSection';
import AboutSkyTech from '@/components/about/AboutSkyTech';
import FeaturesSection from '@/components/about/FeaturesSection';

export default function AboutPage() {
  return (
    <div className="tech-page overflow-hidden">
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
