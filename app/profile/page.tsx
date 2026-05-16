'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { User, Mail, Calendar, Shield, LogOut, ShoppingBag, Heart, MapPin, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Toast from '@/components/Toast';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, loading, signOut, isAdmin } = useAuth();
  const router = useRouter();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    try {
      await signOut();
      setToast({ message: 'Logged out successfully', type: 'success' });
      router.push('/');
    } catch (error) {
      setToast({ message: 'Logout failed', type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-12">
            <div className="flex items-center space-x-6">
              <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center text-4xl font-bold text-blue-600">
                {user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="text-white">
                <h1 className="text-3xl font-bold">{user?.displayName || 'User'}</h1>
                <p className="text-blue-100 mt-1">{user?.email}</p>
                <div className={`mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm ${isAdmin ? 'bg-yellow-400 text-blue-900' : 'bg-white/20'}`}>
                  <Shield className="h-4 w-4 mr-1" />
                  {isAdmin ? 'Admin' : 'User'}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {isAdmin && (
                <Link href="/admin" className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-6 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-yellow-400 rounded-lg">
                      <LayoutDashboard className="h-6 w-6 text-blue-900" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Admin Dashboard</h3>
                      <p className="text-sm text-gray-600">Manage products, orders & users</p>
                    </div>
                  </div>
                </Link>
              )}
              <div className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <ShoppingBag className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">My Orders</h3>
                    <p className="text-sm text-gray-600">Track your orders</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-red-100 rounded-lg">
                    <Heart className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Wishlist</h3>
                    <p className="text-sm text-gray-600">View saved items</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <MapPin className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Addresses</h3>
                    <p className="text-sm text-gray-600">Manage addresses</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <User className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Account Settings</h3>
                    <p className="text-sm text-gray-600">Update profile</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Details */}
            <div className="border-t pt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Account Details</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium text-gray-900">{user?.displayName || 'User'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email Address</p>
                    <p className="font-medium text-gray-900">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Shield className={`h-5 w-5 ${isAdmin ? 'text-yellow-500' : 'text-gray-400'}`} />
                  <div>
                    <p className="text-sm text-gray-500">Role</p>
                    <p className={`font-medium capitalize ${isAdmin ? 'text-yellow-600' : 'text-gray-900'}`}>{isAdmin ? 'Admin' : 'User'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <div className="mt-8 pt-8 border-t">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 border border-red-300 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
