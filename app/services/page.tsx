'use client';

import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import ServicesShowcase from '@/components/services/ServicesShowcase';

export default function ServicesPage() {
  return (
    <div className="tech-page flex min-h-screen flex-col">
      <Navbar />
      <ServicesShowcase variant="full" />
      <Footer />
    </div>
  );
}
