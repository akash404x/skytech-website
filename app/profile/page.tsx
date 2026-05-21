'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Calendar, LayoutDashboard, LogOut, Mail, MapPin, PackageCheck, Shield, ShoppingCart, User } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'react-hot-toast';
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
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!user) return null;

  const displayName = profile?.displayName || user.displayName || 'User';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-lg bg-white shadow-lg">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-10 sm:px-8">
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
                <Link href="/admin" className="rounded-lg border-2 border-yellow-300 bg-yellow-50 p-5 transition hover:shadow-md">
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-yellow-400 p-3">
                      <LayoutDashboard className="h-6 w-6 text-blue-900" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-gray-900">Admin Dashboard</h2>
                      <p className="text-sm text-gray-600">Manage products, orders, users, and analytics</p>
                    </div>
                  </div>
                </Link>
              )}

              <Link href="/orders" className="rounded-lg bg-gray-50 p-5 transition hover:shadow-md">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-blue-100 p-3">
                    <PackageCheck className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">My Orders</h2>
                    <p className="text-sm text-gray-600">Track orders and payment history</p>
                  </div>
                </div>
              </Link>

              <Link href="/cart" className="rounded-lg bg-gray-50 p-5 transition hover:shadow-md">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-green-100 p-3">
                    <ShoppingCart className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">Cart</h2>
                    <p className="text-sm text-gray-600">Review saved items before checkout</p>
                  </div>
                </div>
              </Link>

              <div className="rounded-lg bg-gray-50 p-5">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-purple-100 p-3">
                    <MapPin className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">Shipping</h2>
                    <p className="text-sm text-gray-600">Address is collected securely at checkout</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-8">
              <h2 className="mb-6 text-xl font-bold text-gray-900">Account Details</h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="flex items-center gap-4">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium text-gray-900">{displayName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email Address</p>
                    <p className="font-medium text-gray-900">{profile?.email || user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Last Login</p>
                    <p className="font-medium text-gray-900">{formatDate(profile?.lastLogin)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Shield className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Total Spent</p>
                    <p className="font-medium text-gray-900">{formatCurrency(profile?.totalSpent ?? 0)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t pt-8">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-300 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                <LogOut className="h-5 w-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
