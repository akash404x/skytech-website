import { Metadata } from 'next';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import ServicesShowcase from '@/components/services/ServicesShowcase';

export const metadata: Metadata = {
  title: 'Services - Professional Tech Solutions & Consulting',
  description: 'Expert technology services including IoT development, robotics projects, Arduino programming, electronics consulting, and custom tech solutions. Professional support for your projects.',
  keywords: ['Tech Services', 'IoT Development', 'Robotics Services', 'Arduino Programming', 'Electronics Consulting', 'Custom Tech Solutions', 'STEM Education'],
  openGraph: {
    title: 'Services - Professional Tech Solutions & Consulting',
    description: 'Expert technology services including IoT development, robotics projects, Arduino programming, and custom tech solutions.',
    url: '/services',
  },
};

export default function ServicesPage() {
  return (
    <div className="tech-page flex min-h-screen flex-col">
      <Navbar />
      <ServicesShowcase variant="full" />
      <Footer />
    </div>
  );
}
