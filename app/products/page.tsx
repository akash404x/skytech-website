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
        <Suspense fallback={<CatalogFallback />}>
          <ProductsCatalog />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
