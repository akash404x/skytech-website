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
