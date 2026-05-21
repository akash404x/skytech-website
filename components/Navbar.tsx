'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Info, LogOut, Menu, PackageCheck, Search, Shield, ShoppingCart, User, Wrench, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';

export default function Navbar() {
  const { user, loading, signOut, isAdmin, isEditor } = useAuth();
  const { itemCount } = useCart();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  const cartBadge = (
    <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-400 text-xs font-bold text-blue-900">
      {itemCount}
    </span>
  );

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex shrink-0 items-center">
            <div className="text-2xl font-bold italic tracking-tight">
              Sky<span className="text-yellow-400">Tech</span>
            </div>
          </Link>

          <div className="mx-8 hidden max-w-2xl flex-1 md:flex">
            <div className="relative w-full">
              <input
                type="search"
                placeholder="Search for products, brands and more"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full rounded-sm px-4 py-2 pl-10 text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div className="hidden items-center space-x-6 md:flex">
            <Link href="/services" className="flex items-center space-x-1 transition-colors hover:text-yellow-300">
              <Wrench className="h-5 w-5" />
              <span className="font-medium">Services</span>
            </Link>
            <Link href="/about" className="flex items-center space-x-1 transition-colors hover:text-yellow-300">
              <Info className="h-5 w-5" />
              <span className="font-medium">About</span>
            </Link>

            {loading ? (
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : user ? (
              <>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center space-x-1 rounded-full bg-yellow-400 px-3 py-1 text-sm font-bold text-blue-900 transition-colors hover:bg-yellow-300"
                  >
                    <Shield className="h-4 w-4" />
                    <span>Admin</span>
                  </Link>
                )}
                {isEditor && !isAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center space-x-1 rounded-full bg-orange-400 px-3 py-1 text-sm font-bold text-blue-900 transition-colors hover:bg-orange-300"
                  >
                    <Wrench className="h-4 w-4" />
                    <span>Editor</span>
                  </Link>
                )}
                <Link href="/profile" className="flex items-center space-x-1 transition-colors hover:text-yellow-300">
                  <User className="h-5 w-5" />
                  <span className="max-w-32 truncate font-medium">{user.displayName || user.email}</span>
                </Link>
                <Link href="/orders" className="flex items-center space-x-1 transition-colors hover:text-yellow-300">
                  <PackageCheck className="h-5 w-5" />
                  <span className="font-medium">Orders</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center space-x-1 transition-colors hover:text-yellow-300"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </>
            ) : (
              <Link href="/login" className="flex items-center space-x-1 transition-colors hover:text-yellow-300">
                <User className="h-5 w-5" />
                <span className="font-medium">Login</span>
              </Link>
            )}

            <Link href="/cart" className="relative flex items-center space-x-1 transition-colors hover:text-yellow-300">
              <ShoppingCart className="h-5 w-5" />
              <span className="font-medium">Cart</span>
              {cartBadge}
            </Link>
          </div>

          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setIsMenuOpen((open) => !open)}
              className="inline-flex items-center justify-center rounded-md p-2 hover:bg-blue-700 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="animate-slideDown pb-4 md:hidden">
            <div className="relative mb-4">
              <input
                type="search"
                placeholder="Search for products, brands and more"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full rounded-sm px-4 py-2 pl-10 text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            <div className="flex flex-col space-y-3">
              <Link href="/services" className="flex items-center space-x-2 py-2 transition-colors hover:text-yellow-300">
                <Wrench className="h-5 w-5" />
                <span className="font-medium">Services</span>
              </Link>
              <Link href="/about" className="flex items-center space-x-2 py-2 transition-colors hover:text-yellow-300">
                <Info className="h-5 w-5" />
                <span className="font-medium">About</span>
              </Link>

              {loading ? (
                <div className="flex justify-center py-2">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                </div>
              ) : user ? (
                <>
                  {(isAdmin || isEditor) && (
                    <Link
                      href="/admin"
                      className="flex items-center justify-center space-x-2 rounded-full bg-yellow-400 px-3 py-2 text-sm font-bold text-blue-900 transition-colors hover:bg-yellow-300"
                    >
                      <Shield className="h-4 w-4" />
                      <span>{isAdmin ? 'Admin Dashboard' : 'Editor Dashboard'}</span>
                    </Link>
                  )}
                  <Link href="/profile" className="flex items-center space-x-2 py-2 transition-colors hover:text-yellow-300">
                    <User className="h-5 w-5" />
                    <span className="font-medium">{user.displayName || user.email}</span>
                  </Link>
                  <Link href="/orders" className="flex items-center space-x-2 py-2 transition-colors hover:text-yellow-300">
                    <PackageCheck className="h-5 w-5" />
                    <span className="font-medium">Orders</span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center space-x-2 py-2 transition-colors hover:text-yellow-300"
                  >
                    <LogOut className="h-5 w-5" />
                    <span className="font-medium">Logout</span>
                  </button>
                </>
              ) : (
                <Link href="/login" className="flex items-center space-x-2 py-2 transition-colors hover:text-yellow-300">
                  <User className="h-5 w-5" />
                  <span className="font-medium">Login</span>
                </Link>
              )}

              <Link href="/cart" className="relative flex items-center space-x-2 py-2 transition-colors hover:text-yellow-300">
                <ShoppingCart className="h-5 w-5" />
                <span className="font-medium">Cart</span>
                {cartBadge}
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
