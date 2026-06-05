import { Metadata } from 'next';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FounderSection from '@/components/about/FounderSection';
import AboutSkyTech from '@/components/about/AboutSkyTech';
import FeaturesSection from '@/components/about/FeaturesSection';

export const metadata: Metadata = {
  title: 'About Us - SkyTech Technology Solutions',
  description: 'Learn about SkyTech - your trusted partner for Arduino, electronics, robotics, and IoT solutions. Discover our mission, vision, and commitment to quality technology products and services.',
  keywords: ['About SkyTech', 'Company Profile', 'Technology Solutions', 'Arduino Expert', 'Electronics Store', 'IoT Services'],
  openGraph: {
    title: 'About Us - SkyTech Technology Solutions',
    description: 'Learn about SkyTech - your trusted partner for Arduino, electronics, robotics, and IoT solutions.',
    url: '/about',
  },
};

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
