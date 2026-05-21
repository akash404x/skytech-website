import AnimatedBackground from '@/components/AnimatedBackground';
import DiscountDeals from '@/components/DiscountDeals';
import FeaturedProducts from '@/components/FeaturedProducts';
import FeaturesSection from '@/components/FeaturesSection';
import Footer from '@/components/Footer';
import HeroBanner from '@/components/HeroBanner';
import Navbar from '@/components/Navbar';
import ProductCategories from '@/components/ProductCategories';
import Services from '@/components/Services';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <AnimatedBackground />
      <Navbar />
      <HeroBanner />
      <FeaturesSection />
      <ProductCategories />
      <FeaturedProducts />
      <Services />
      <DiscountDeals />
      <Footer />
    </div>
  );
}
