'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import HeroBanner from '@/components/HeroBanner';
import ProductCategories from '@/components/ProductCategories';
import FeaturedProducts from '@/components/FeaturedProducts';
import DiscountDeals from '@/components/DiscountDeals';
import Services from '@/components/Services';
import Footer from '@/components/Footer';
import Toast from '@/components/Toast';
import { useAuth } from '@/contexts/AuthContext';

function HomeContent() {
  const { data: session, status } = useSession();
  const { user, loading: firebaseLoading, isAdmin: firebaseIsAdmin } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    console.log('[HOME] NextAuth status:', status);
    console.log('[HOME] NextAuth session:', session);
    console.log('[HOME] Firebase user:', user);
    console.log('[HOME] Firebase isAdmin:', firebaseIsAdmin);
    
    // Check for auth success/error from URL params
    const authSuccess = searchParams.get('auth_success');
    const authError = searchParams.get('auth_error');
    
    if (authSuccess) {
      setToast({ message: 'Login successful!', type: 'success' });
      // Clean up URL
      router.replace('/', { scroll: false });
    } else if (authError) {
      setToast({ message: decodeURIComponent(authError), type: 'error' });
      // Clean up URL
      router.replace('/', { scroll: false });
    }
    
    // Removed automatic admin redirect - admins can now browse store normally
    // Admin dashboard is accessed only via the Admin button in navbar
  }, [session, status, user, firebaseIsAdmin, firebaseLoading, router, searchParams]);

  return (
    <div className="min-h-screen flex flex-col">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <Navbar />
      <HeroBanner />
      <ProductCategories />
      <FeaturedProducts />
      <Services />
      <DiscountDeals />
      <Footer />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen flex flex-col"><Navbar /><HeroBanner /><ProductCategories /><FeaturedProducts /><Services /><DiscountDeals /><Footer /></div>}>
      <HomeContent />
    </Suspense>
  );
}
