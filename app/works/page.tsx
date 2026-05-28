import { Suspense } from 'react';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import WorksCatalog from '@/components/works/WorksCatalog';
import WorksHero from '@/components/works/WorksHero';
import { Skeleton } from '@/components/ui/Skeleton';

function CatalogFallback() {
  return (
    <section className="relative pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function WorksPage() {
  return (
    <div className="tech-page flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <WorksHero />
        <Suspense fallback={<CatalogFallback />}>
          <WorksCatalog />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
