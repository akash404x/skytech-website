'use client';

import { useRouter } from 'next/navigation';
import { CreditCard, LockKeyhole, MapPin } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { formatCurrency } from '@/lib/format';
import type { ShippingAddress } from '@/lib/types';

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void; on: (event: string, cb: (response: unknown) => void) => void };
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  handler: (response: RazorpaySuccessResponse) => void;
  theme: {
    color: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpaySuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

function loadRazorpayScript() {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const initialAddress: ShippingAddress = {
  fullName: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
};

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: authLoading, getIdToken, profile } = useAuth();
  const { items, subtotal, clearCart } = useCart();
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>(initialAddress);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, router, user]);

  const checkoutItems = useMemo(
    () => items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
    [items],
  );

  const updateAddress = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress((current) => ({ ...current, [field]: value }));
  };

  const startPayment = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!user) {
      router.push('/login');
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty');
      router.push('/cart');
      return;
    }

    setProcessing(true);

    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error('Razorpay checkout failed to load');

      const token = await getIdToken();
      if (!token) throw new Error('You need to sign in again');

      const createResponse = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: checkoutItems }),
      });

      const createData = await createResponse.json();
      if (!createResponse.ok) throw new Error(createData.error || 'Unable to start payment');

      if (!window.Razorpay) throw new Error('Razorpay checkout is unavailable');

      const razorpay = new window.Razorpay({
        key: createData.keyId,
        amount: createData.amount,
        currency: createData.currency,
        name: 'SkyTech',
        description: 'SkyTech order payment',
        order_id: createData.razorpayOrderId,
        prefill: {
          name: shippingAddress.fullName,
          email: user.email ?? '',
          contact: shippingAddress.phone,
        },
        theme: {
          color: '#2563eb',
        },
        modal: {
          ondismiss: () => setProcessing(false),
        },
        handler: async (response) => {
          try {
            const verifyResponse = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                items: checkoutItems,
                shippingAddress: {
                  ...shippingAddress,
                  fullName: shippingAddress.fullName || profile?.displayName || user.displayName || 'Customer',
                },
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyResponse.json();
            if (!verifyResponse.ok) throw new Error(verifyData.error || 'Payment verification failed');

            await clearCart();
            toast.success('Payment verified and order created');
            router.push('/orders');
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error(error instanceof Error ? error.message : 'Payment verification failed');
            setProcessing(false);
          }
        },
      });

      razorpay.on('payment.failed', () => {
        toast.error('Payment failed');
        setProcessing(false);
      });
      razorpay.open();
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error instanceof Error ? error.message : 'Unable to start checkout');
      setProcessing(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="tech-loading-screen">
        <div className="tech-spinner" />
      </div>
    );
  }

  return (
    <div className="tech-page flex min-h-screen flex-col">
      <Navbar />
      <main className="tech-main">
        <div className="tech-page-header">
          <h1 className="tech-heading-gradient">Secure Checkout</h1>
          <p className="mt-2 flex items-center gap-2 tech-text">
            <LockKeyhole className="h-4 w-4" />
            Orders are created only after Razorpay signature verification.
          </p>
        </div>

        <form onSubmit={startPayment} className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="tech-glass-card p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-lg bg-blue-600/30 p-3 text-blue-300">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Shipping Address</h2>
                <p className="text-sm tech-muted">Required for order tracking</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <input required value={shippingAddress.fullName} onChange={(event) => updateAddress('fullName', event.target.value)} placeholder="Full name" className="tech-input sm:col-span-1" />
              <input required value={shippingAddress.phone} onChange={(event) => updateAddress('phone', event.target.value)} placeholder="Phone number" className="tech-input" />
              <input required value={shippingAddress.line1} onChange={(event) => updateAddress('line1', event.target.value)} placeholder="Address line 1" className="tech-input sm:col-span-2" />
              <input value={shippingAddress.line2 ?? ''} onChange={(event) => updateAddress('line2', event.target.value)} placeholder="Address line 2" className="tech-input sm:col-span-2" />
              <input required value={shippingAddress.city} onChange={(event) => updateAddress('city', event.target.value)} placeholder="City" className="tech-input" />
              <input required value={shippingAddress.state} onChange={(event) => updateAddress('state', event.target.value)} placeholder="State" className="tech-input" />
              <input required value={shippingAddress.postalCode} onChange={(event) => updateAddress('postalCode', event.target.value)} placeholder="Postal code" className="tech-input" />
              <input required value={shippingAddress.country} onChange={(event) => updateAddress('country', event.target.value)} placeholder="Country" className="tech-input" />
            </div>
          </section>

          <aside className="tech-glass-card h-fit p-6">
            <h2 className="text-xl font-bold text-white">Payment Summary</h2>
            <div className="mt-6 space-y-3 border-b border-white/10 pb-6">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between gap-3 text-sm tech-text">
                  <span>{item.name} x {item.quantity}</span>
                  <span>{formatCurrency((item.discountPrice || item.price) * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-between text-lg font-bold text-white">
              <span>Total</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <button
              type="submit"
              disabled={processing || items.length === 0}
              className="tech-btn-primary mt-6 flex w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CreditCard className="h-5 w-5" />
              {processing ? 'Processing...' : 'Pay with Razorpay'}
            </button>
          </aside>
        </form>
      </main>
      <Footer />
    </div>
  );
}
