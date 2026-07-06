'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Wallet, Plus, X, CreditCard } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/lib/format';

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

export default function WalletPage() {
  const router = useRouter();
  const { user, loading: authLoading, getIdToken, profile } = useAuth();
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [addAmount, setAddAmount] = useState('');
  const [addingMoney, setAddingMoney] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, router, user]);

  const fetchWalletData = async () => {
    try {
      const token = await getIdToken();
      
      // Fetch wallet balance
      const balanceResponse = await fetch('/api/wallet/balance', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const balanceData = await balanceResponse.json();
      if (balanceResponse.ok) {
        setWalletBalance(balanceData.walletBalance);
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      toast.error('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchWalletData();
  }, [user, getIdToken]);

  const handleAddMoney = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(addAmount);
    if (isNaN(amount) || amount < 1) {
      toast.error('Minimum amount is ₹1');
      return;
    }
    if (amount > 100000) {
      toast.error('Maximum amount is ₹1,00,000');
      return;
    }

    setAddingMoney(true);

    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error('Razorpay checkout failed to load');

      const token = await getIdToken();
      if (!token) throw new Error('You need to sign in again');

      const createResponse = await fetch('/api/wallet/add-money/create-order', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      });

      const createData = await createResponse.json();
      if (!createResponse.ok) throw new Error(createData?.error || 'Unable to create payment order');

      if (!window.Razorpay) throw new Error('Razorpay checkout is unavailable');

      const razorpay = new window.Razorpay({
        key: createData.keyId,
        amount: createData.amount,
        currency: createData.currency,
        name: 'SkyTech',
        description: 'Add money to wallet',
        order_id: createData.razorpayOrderId,
        prefill: {
          name: profile?.displayName || user?.displayName || 'User',
          email: user?.email ?? '',
          contact: '',
        },
        theme: {
          color: '#22d3ee',
        },
        modal: {
          ondismiss: () => {
            setAddingMoney(false);
            setShowAddMoney(false);
          },
        },
        handler: async (response) => {
          try {
            const verifyResponse = await fetch('/api/wallet/add-money/verify', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                amount,
              }),
            });

            const verifyData = await verifyResponse.json();
            if (!verifyResponse.ok) throw new Error(verifyData.error || 'Payment verification failed');

            toast.success('Money added to wallet successfully');
            setAddAmount('');
            setShowAddMoney(false);
            fetchWalletData();
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error(error instanceof Error ? error.message : 'Payment verification failed');
          } finally {
            setAddingMoney(false);
          }
        },
      });

      razorpay.on('payment.failed', () => {
        toast.error('Payment failed');
        setAddingMoney(false);
      });

      razorpay.open();
    } catch (error) {
      console.error('Add money error:', error);
      toast.error(error instanceof Error ? error.message : 'Unable to add money');
      setAddingMoney(false);
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
        <div className="mb-8">
          <h1 className="tech-heading-gradient text-3xl font-bold">My Wallet</h1>
          <p className="mt-2 tech-text">Manage your wallet balance</p>
        </div>

        {loading ? (
          <Skeleton className="h-48" />
        ) : (
          <>
            {/* Wallet Balance Card */}
            <div className="tech-glass-card mb-8 p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 p-4">
                    <Wallet className="h-8 w-8 text-cyan-300" />
                  </div>
                  <div>
                    <p className="text-sm tech-muted">Wallet Balance</p>
                    <p className="text-4xl font-bold text-white">{formatCurrency(walletBalance)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddMoney(true)}
                  className="tech-btn-primary flex items-center gap-2 px-6 py-3"
                >
                  <Plus className="h-5 w-5" />
                  Add Money
                </button>
              </div>
              <p className="mt-4 text-sm tech-text">
                This balance can be used for future purchases. Wallet credits are added when your return or replacement requests are approved.
              </p>
            </div>

            {/* Add Money Modal */}
            {showAddMoney && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <div className="tech-glass-card w-full max-w-md p-6 shadow-[0_0_40px_rgba(34,211,238,0.2)]">
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">Add Money to Wallet</h2>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddMoney(false);
                        setAddAmount('');
                      }}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <form onSubmit={handleAddMoney} className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-white">Amount (₹)</label>
                      <input
                        type="number"
                        value={addAmount}
                        onChange={(e) => setAddAmount(e.target.value)}
                        placeholder="Enter amount"
                        min="1"
                        max="100000"
                        step="1"
                        required
                        disabled={addingMoney}
                        className="tech-input w-full"
                      />
                      <p className="mt-2 text-xs tech-text">Minimum: ₹1 | Maximum: ₹1,00,000</p>
                    </div>

                    <div className="flex gap-3">
                      {[100, 500, 1000, 5000].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setAddAmount(preset.toString())}
                          disabled={addingMoney}
                          className="flex-1 rounded-lg border border-white/10 bg-slate-800/50 py-2 text-sm font-medium text-white transition hover:border-cyan-500/30 hover:bg-cyan-500/10 disabled:opacity-50"
                        >
                          ₹{preset}
                        </button>
                      ))}
                    </div>

                    <button
                      type="submit"
                      disabled={addingMoney || !addAmount}
                      className="tech-btn-primary flex w-full items-center justify-center gap-2 py-3 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {addingMoney ? (
                        <>
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-400/30 border-t-cyan-400" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-5 w-5" />
                          Pay with Razorpay
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            )}

          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
