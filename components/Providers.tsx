'use client';

import AnimatedBackground from '@/components/ui/AnimatedBackground';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { Toaster } from 'react-hot-toast';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="tech-site relative min-h-full">
          <AnimatedBackground />
          <div className="relative z-[1] flex min-h-full flex-col">{children}</div>
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: '8px',
              background: 'rgba(15, 23, 42, 0.95)',
              color: '#f1f5f9',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            },
          }}
        />
      </CartProvider>
    </AuthProvider>
  );
}
