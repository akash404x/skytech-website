'use client';

import { useRouter } from 'next/navigation';
import { CreditCard, LockKeyhole, MapPin, Ticket, Wallet, X } from 'lucide-react';
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
  const [walletBalance, setWalletBalance] = useState(0);
  const [useWallet, setUseWallet] = useState(false);
  const [gstSettings, setGstSettings] = useState({ enabled: true, percentage: 18 });
  const [shippingSettings, setShippingSettings] = useState({ shippingFee: 80, freeShippingAbove: 999 });
  const [deliverySettings, setDeliverySettings] = useState({ enabled: true, charge: 20 });
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number; discountType: string; discountValue: number } | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, router, user]);

  useEffect(() => {
    if (!user) return;

    const fetchPricingSettings = async () => {
      try {
        const response = await fetch('/api/settings/pricing');
        const data = await response.json();
        if (response.ok) {
          setGstSettings(data.data.gst);
          setShippingSettings(data.data.shipping);
          setDeliverySettings(data.data.delivery);
        }
      } catch (error) {
        console.error('Error fetching pricing settings:', error);
      } finally {
        setLoadingSettings(false);
      }
    };

    const fetchWalletBalance = async () => {
      try {
        const token = await getIdToken();
        const response = await fetch('/api/wallet/balance', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) {
          setWalletBalance(data.walletBalance);
        }
      } catch (error) {
        console.error('Error fetching wallet balance:', error);
      }
    };

    fetchPricingSettings();
    fetchWalletBalance();
  }, [user, getIdToken]);

  const checkoutItems = useMemo(
    () => items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
    [items],
  );

  const gstAmount = useMemo(() => {
    if (!gstSettings.enabled) return 0;
    return (subtotal * gstSettings.percentage) / 100;
  }, [subtotal, gstSettings]);

  const shippingFee = useMemo(() => {
    if (subtotal >= shippingSettings.freeShippingAbove) return 0;
    return shippingSettings.shippingFee;
  }, [subtotal, shippingSettings]);

  const deliveryCharge = useMemo(() => {
    if (!deliverySettings.enabled) return 0;
    return deliverySettings.charge;
  }, [deliverySettings]);

  const totalBeforeWallet = useMemo(() => {
    return subtotal + gstAmount + shippingFee + deliveryCharge;
  }, [subtotal, gstAmount, shippingFee, deliveryCharge]);

  const amountAfterCoupon = useMemo(() => {
    return totalBeforeWallet - (appliedCoupon?.discountAmount || 0);
  }, [totalBeforeWallet, appliedCoupon]);

  const walletDeduction = useMemo(() => {
    if (!useWallet) return 0;
    return Math.min(walletBalance, amountAfterCoupon);
  }, [useWallet, walletBalance, amountAfterCoupon]);

  const remainingAmount = useMemo(() => {
    const amount = amountAfterCoupon - walletDeduction;
    return Math.max(0, amount);
  }, [amountAfterCoupon, walletDeduction]);

  const updateAddress = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress((current) => ({ ...current, [field]: value }));
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setValidatingCoupon(true);
    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode.trim(),
          orderAmount: totalBeforeWallet,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.valid) {
        toast.error(data.error || 'Invalid coupon code');
        return;
      }

      setAppliedCoupon({
        code: data.coupon.code,
        discountAmount: data.discountAmount,
        discountType: data.coupon.discountType,
        discountValue: data.coupon.discountValue,
      });
      setCouponCode('');
      toast.success('Coupon applied successfully');
    } catch (error) {
      console.error('Error validating coupon:', error);
      toast.error('Failed to validate coupon');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    toast.success('Coupon removed');
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
      // If wallet covers full amount, process wallet payment only
      if (remainingAmount === 0) {
        const token = await getIdToken();
        if (!token) throw new Error('You need to sign in again');

        console.log('=== WALLET-ONLY PAYMENT START ===');
        console.log('Subtotal:', subtotal);
        console.log('GST amount:', gstAmount);
        console.log('Shipping fee:', shippingFee);
        console.log('Delivery charge:', deliveryCharge);
        console.log('Total before wallet:', totalBeforeWallet);
        console.log('Coupon discount:', appliedCoupon?.discountAmount);
        console.log('Amount after coupon:', amountAfterCoupon);
        console.log('Wallet balance:', walletBalance);
        console.log('Wallet deduction:', walletDeduction);
        console.log('Remaining amount:', remainingAmount);
        console.log('Use wallet:', useWallet);

        const response = await fetch('/api/payments/wallet-only', {
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
            walletAmount: walletBalance,
            couponCode: appliedCoupon?.code ?? null,
            discountAmount: appliedCoupon?.discountAmount ?? 0,
            gstAmount,
            gstPercentage: gstSettings.percentage,
            shippingFee,
            deliveryCharge,
          }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Wallet payment failed');

        await clearCart();
        toast.success('Payment successful and order created');
        // Redirect to post-purchase review page
        router.push(`/review-order/${data.order.id}`);
        return;
      }

      // Otherwise, use Razorpay for remaining amount
      const loaded = await loadRazorpayScript();
      console.log('Razorpay script loaded:', loaded);
      if (!loaded) throw new Error('Razorpay checkout failed to load');

      const token = await getIdToken();
      if (!token) throw new Error('You need to sign in again');

      const createResponse = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: checkoutItems, amount: remainingAmount }),
      });

      let createData: any;
      const contentType = createResponse.headers.get('content-type') ?? '';
      if (contentType.includes('application/json')) {
        createData = await createResponse.json();
      } else {
        const text = await createResponse.text();
        throw new Error(`Create order response invalid: ${text}`);
      }

      if (!createResponse.ok) {
        console.error('Create order failed response:', { status: createResponse.status, data: createData });
        throw new Error(createData?.error || 'Unable to start payment');
      }

      console.log('Create order response data:', createData);
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
                walletAmount: walletBalance,
                couponCode: appliedCoupon?.code ?? null,
                discountAmount: appliedCoupon?.discountAmount ?? 0,
                gstAmount,
                gstPercentage: gstSettings.percentage,
                shippingFee,
                deliveryCharge,
              }),
            });

            const verifyData = await verifyResponse.json();
            if (!verifyResponse.ok) throw new Error(verifyData.error || 'Payment verification failed');

            await clearCart();
            toast.success('Payment verified and order created');
            // Redirect to post-purchase review page
            router.push(`/review-order/${verifyData.order.id}`);
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

            <div className="mt-6 space-y-3 border-b border-white/10 pb-6">
              <div className="flex justify-between text-sm tech-text">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {gstSettings.enabled && (
                <div className="flex justify-between text-sm tech-text">
                  <span>GST ({gstSettings.percentage}%)</span>
                  <span>{formatCurrency(gstAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm tech-text">
                <span>Shipping</span>
                <span>{shippingFee === 0 ? 'Free' : formatCurrency(shippingFee)}</span>
              </div>
              {deliverySettings.enabled && (
                <div className="flex justify-between text-sm tech-text">
                  <span>Delivery Charge</span>
                  <span>{formatCurrency(deliveryCharge)}</span>
                </div>
              )}
            </div>
            
            {/* Wallet Payment Option */}
            {walletBalance > 0 && (
              <div className="mt-6 rounded-lg border border-cyan-500/20 bg-cyan-500/10 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Wallet className="h-5 w-5 text-cyan-300" />
                    <div>
                      <p className="font-medium text-white">Use Wallet Balance</p>
                      <p className="text-sm tech-text">Available: {formatCurrency(walletBalance)}</p>
                    </div>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={useWallet}
                      onChange={(e) => setUseWallet(e.target.checked)}
                      className="peer sr-only"
                    />
                    <div className="peer h-6 w-11 rounded-full bg-slate-700 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-cyan-600 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full" />
                  </label>
                </div>
                {useWallet && walletDeduction > 0 && (
                  <div className="mt-3 text-sm tech-text">
                    <div className="flex justify-between">
                      <span>Wallet deduction:</span>
                      <span className="text-cyan-300">-{formatCurrency(walletDeduction)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Remaining to pay:</span>
                      <span className="text-white font-semibold">{formatCurrency(remainingAmount)}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Coupon Section */}
            {!appliedCoupon ? (
              <div className="mt-6 rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Ticket className="h-5 w-5 text-cyan-300" />
                  <p className="font-medium text-white">Have a Coupon Code?</p>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter coupon code"
                    className="flex-1 rounded-lg border border-cyan-500/30 bg-slate-700/50 px-4 py-2 text-white placeholder-gray-400 transition focus:border-cyan-400 focus:bg-slate-700 focus:outline-none"
                    disabled={validatingCoupon}
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={validatingCoupon || !couponCode.trim()}
                    className="rounded-lg bg-cyan-600 px-4 py-2 font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {validatingCoupon ? 'Applying...' : 'Apply'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Ticket className="h-5 w-5 text-emerald-300" />
                    <div>
                      <p className="font-medium text-white">Coupon Applied</p>
                      <p className="text-sm tech-text">
                        {appliedCoupon.code} - {appliedCoupon.discountType === 'fixed' ? formatCurrency(appliedCoupon.discountValue) : `${appliedCoupon.discountValue}%`} off
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="rounded-lg p-2 text-rose-400 hover:bg-rose-500/10"
                    aria-label="Remove coupon"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-between text-lg font-bold text-white">
              <span>Total</span>
              <span>{formatCurrency(totalBeforeWallet)}</span>
            </div>
            {appliedCoupon && (
              <div className="mt-2 flex justify-between text-sm tech-text">
                <span>Coupon discount ({appliedCoupon.code}):</span>
                <span className="text-emerald-300 font-semibold">-{formatCurrency(appliedCoupon.discountAmount)}</span>
              </div>
            )}
            {(useWallet && walletDeduction > 0) || appliedCoupon ? (
              <div className="mt-2 flex justify-between text-sm tech-text">
                <span>Final payable:</span>
                <span className="text-cyan-300 font-semibold">{formatCurrency(remainingAmount)}</span>
              </div>
            ) : null}
            <button
              type="submit"
              disabled={processing || items.length === 0}
              className="tech-btn-primary mt-6 flex w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CreditCard className="h-5 w-5" />
              {processing ? 'Processing...' : remainingAmount === 0 ? 'Pay with Wallet' : `Pay ${formatCurrency(remainingAmount)} with Razorpay`}
            </button>
          </aside>
        </form>
      </main>
      <Footer />
    </div>
  );
}
