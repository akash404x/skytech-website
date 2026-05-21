import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import ProductDetailView from '@/components/products/ProductDetailView';

export default function ProductDetailPage() {
  return (
    <div className="tech-page flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <ProductDetailView />
      </main>
      <Footer />
    </div>
  );
}
