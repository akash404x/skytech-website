import { Metadata } from 'next';
import DiscountDeals from '@/components/DiscountDeals';
import FeaturedProducts from '@/components/FeaturedProducts';
import FeaturedWorks from '@/components/FeaturedWorks';
import FeaturesSection from '@/components/FeaturesSection';
import Footer from '@/components/Footer';
import FounderSection from '@/components/FounderSection';
import PremiumHero from '@/components/PremiumHero';
import Navbar from '@/components/Navbar';
import ProductCategories from '@/components/ProductCategories';
import Services from '@/components/Services';
import TestimonialsSection from '@/components/TestimonialsSection';
import TrustSection from '@/components/TrustSection';

export const metadata: Metadata = {
  title: 'Sky Tech – Arduino, Electronics, Robotics & IoT Solutions',
  description: 'Your one-stop shop for Arduino boards, sensors, IoT modules, robotics components, and professional tech services. Quality electronics with expert support for hobbyists and professionals.',
  keywords: ['Arduino', 'Electronics', 'Robotics', 'IoT', 'Sensors', 'Microcontrollers', 'Tech Services', 'DIY Electronics', 'STEM Education', 'Smart Home', 'Electronic Components'],
  openGraph: {
    title: 'Sky Tech – Arduino, Electronics, Robotics & IoT Solutions',
    description: 'Your one-stop shop for Arduino boards, sensors, IoT modules, robotics components, and professional tech services.',
    url: 'https://www.theskytechnology.in/',
  },
};

export default function Home() {
  return (
    <div className="tech-page">
      <Navbar />
      <PremiumHero />
      <FeaturesSection />
      <FounderSection />
      <ProductCategories />
      <FeaturedProducts />
      <Services />
      <FeaturedWorks />
      <TrustSection />
      <TestimonialsSection />
      <DiscountDeals />
      <Footer />
    </div>
  );
}
