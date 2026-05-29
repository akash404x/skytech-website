'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Calendar, LayoutDashboard, LogOut, Mail, MapPin, PackageCheck, Settings, Shield, ShoppingCart, User, Wallet as WalletIcon } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, formatDate } from '@/lib/format';

export default function ProfilePage() {
  const { user, profile, loading, signOut, isAdmin, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out');
      router.push('/');
    } catch {
      toast.error('Logout failed');
    }
  };

  if (loading) {
    return (
      <div className="tech-loading-screen">
        <div className="tech-spinner" />
      </div>
    );
  }

  if (!user) return null;

  const displayName = profile?.displayName || user.displayName || 'User';

  return (
    <div className="tech-page flex min-h-screen flex-col">
      <Navbar />
      <main className="tech-main py-4">
        <div className="tech-glass-card overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600/80 to-purple-600/70 px-6 py-10 sm:px-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white text-4xl font-bold text-blue-600">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="text-white">
                <h1 className="text-3xl font-bold">{displayName}</h1>
                <p className="mt-1 text-blue-100">{profile?.email || user.email}</p>
                <div className="mt-3 inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-sm capitalize">
                  <Shield className="mr-1 h-4 w-4" />
                  {role}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2">
              {isAdmin && (
                <Link href="/admin" className="tech-glass-card border-amber-400/30 p-5 transition hover:border-amber-400/50">
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-amber-500/20 p-3 text-amber-300">
                      <LayoutDashboard className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-white">Admin Dashboard</h2>
                      <p className="text-sm tech-muted">Manage products, orders, users, and analytics</p>
                    </div>
                  </div>
                </Link>
              )}

              <Link href="/orders" className="tech-glass-card p-5 transition hover:border-blue-400/30">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-blue-600/30 p-3 text-blue-300">
                    <PackageCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-white">My Orders</h2>
                    <p className="text-sm tech-muted">Track orders and payment history</p>
                  </div>
                </div>
              </Link>

              <Link href="/cart" className="tech-glass-card p-5 transition hover:border-blue-400/30">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-green-600/30 p-3 text-green-300">
                    <ShoppingCart className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-white">Cart</h2>
                    <p className="text-sm tech-muted">Review saved items before checkout</p>
                  </div>
                </div>
              </Link>

              <Link href="/wallet" className="tech-glass-card p-5 transition hover:border-cyan-400/30">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-cyan-600/30 p-3 text-cyan-300">
                    <WalletIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-white">Wallet</h2>
                    <p className="text-sm tech-muted">Manage balance, refunds and transactions</p>
                  </div>
                </div>
              </Link>

              <Link href="/settings" className="tech-glass-card p-5 transition hover:border-purple-400/30">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-purple-600/30 p-3 text-purple-300">
                    <Settings className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-white">Settings</h2>
                    <p className="text-sm tech-muted">Account preferences and settings</p>
                  </div>
                </div>
              </Link>

              <div className="tech-glass-card p-5">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-purple-600/30 p-3 text-purple-300">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-white">Shipping</h2>
                    <p className="text-sm tech-muted">Address is collected securely at checkout</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 pt-8">
              <h2 className="mb-6 text-xl font-bold text-white">Account Details</h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="flex items-center gap-4">
                  <User className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-sm tech-muted">Full Name</p>
                    <p className="font-medium text-white">{displayName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Mail className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-sm tech-muted">Email Address</p>
                    <p className="font-medium text-white">{profile?.email || user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Calendar className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-sm tech-muted">Last Login</p>
                    <p className="font-medium text-white">{formatDate(profile?.lastLogin)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Shield className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-sm tech-muted">Total Spent</p>
                    <p className="font-medium text-white">{formatCurrency(profile?.totalSpent ?? 0)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-white/10 pt-8">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-400/40 px-4 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/10"
              >
                <LogOut className="h-5 w-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
