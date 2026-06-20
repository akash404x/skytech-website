import { Metadata } from 'next';
import { Suspense } from 'react';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import ProductsCatalog from '@/components/products/ProductsCatalog';
import ProductsHero from '@/components/products/ProductsHero';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';

export const metadata: Metadata = {
  title: 'Products - Arduino, Electronics, Robotics & IoT Components',
  description: 'Browse our extensive collection of Arduino boards, sensors, microcontrollers, robotics components, IoT modules, and electronic components. Quality products for hobbyists and professionals.',
  keywords: ['Arduino Products', 'Electronic Components', 'Sensors', 'Microcontrollers', 'Robotics Parts', 'IoT Modules', 'DIY Electronics', 'STEM Kits'],
  openGraph: {
    title: 'Products - Arduino, Electronics, Robotics & IoT Components',
    description: 'Browse our extensive collection of Arduino boards, sensors, microcontrollers, robotics components, and IoT modules.',
    url: 'https://www.theskytechnology.in/products',
  },
};

function CatalogFallback() {
  return (
    <section className="relative pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function ProductsPage() {
  return (
    <div className="tech-page flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <ProductsHero />
        
        {/* Premium Announcement Section */}
        <section className="relative py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="tech-glass-card p-8 md:p-12 text-center">
              <div className="absolute inset-0 bg-gradient-to-r from-[#00bfff]/5 via-transparent to-[#00e5ff]/5 rounded-2xl" />
              <div className="relative">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                  Free Technical Support on Every Product Purchased
                </h2>
                <p className="text-[#d6e4ff]/80 text-base md:text-lg max-w-2xl mx-auto">
                  Get complete setup guidance, usage instructions, and expert technical support with every purchase.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        <Suspense fallback={<CatalogFallback />}>
          <ProductsCatalog />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
