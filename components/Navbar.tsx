'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, ShoppingCart, User, Menu, X, LogOut, Shield, Wrench, Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Navbar() {
  const { user, loading, signOut, isAdmin, isEditor, role } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-700 text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center">
            <div className="text-2xl font-bold italic tracking-tight">
              Sky<span className="text-yellow-400">Tech</span>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search for products, brands and more"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 rounded-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Right Section */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/services"
              className="flex items-center space-x-1 hover:text-yellow-300 transition-colors"
            >
              <Wrench className="h-5 w-5" />
              <span className="font-medium">Services</span>
            </Link>
            <Link
              href="/about"
              className="flex items-center space-x-1 hover:text-yellow-300 transition-colors"
            >
              <Info className="h-5 w-5" />
              <span className="font-medium">About</span>
            </Link>
            {loading ? (
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : user ? (
              <>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center space-x-1 bg-yellow-400 text-blue-900 px-3 py-1 rounded-full text-sm font-bold hover:bg-yellow-300 transition-colors"
                  >
                    <Shield className="h-4 w-4" />
                    <span>Admin</span>
                  </Link>
                )}
                {isEditor && !isAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center space-x-1 bg-orange-400 text-blue-900 px-3 py-1 rounded-full text-sm font-bold hover:bg-orange-300 transition-colors"
                  >
                    <Wrench className="h-4 w-4" />
                    <span>Editor</span>
                  </Link>
                )}
                <Link
                  href="/profile"
                  className="flex items-center space-x-1 hover:text-yellow-300 transition-colors"
                >
                  <User className="h-5 w-5" />
                  <span className="font-medium">{user.displayName || user.email}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 hover:text-yellow-300 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="flex items-center space-x-1 hover:text-yellow-300 transition-colors"
                >
                  <User className="h-5 w-5" />
                  <span className="font-medium">Login</span>
                </Link>
              </>
            )}
            <Link href="/cart" className="flex items-center space-x-1 hover:text-yellow-300 transition-colors relative">
              <ShoppingCart className="h-5 w-5" />
              <span className="font-medium">Cart</span>
              <span className="absolute -top-2 -right-2 bg-yellow-400 text-blue-900 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                2
              </span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md hover:bg-blue-700 focus:outline-none"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 animate-slideDown">
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search for products, brands and more"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 rounded-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            <div className="flex flex-col space-y-3">
              <Link
                href="/services"
                className="flex items-center space-x-2 hover:text-yellow-300 transition-colors py-2"
              >
                <Wrench className="h-5 w-5" />
                <span className="font-medium">Services</span>
              </Link>
              <Link
                href="/about"
                className="flex items-center space-x-2 hover:text-yellow-300 transition-colors py-2"
              >
                <Info className="h-5 w-5" />
                <span className="font-medium">About</span>
              </Link>
              {loading ? (
                <div className="flex items-center justify-center py-2">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                </div>
              ) : user ? (
                <>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center space-x-2 bg-yellow-400 text-blue-900 px-3 py-2 rounded-full text-sm font-bold hover:bg-yellow-300 transition-colors justify-center"
                    >
                      <Shield className="h-4 w-4" />
                      <span>Admin Dashboard</span>
                    </Link>
                  )}
                  {isEditor && !isAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center space-x-2 bg-orange-400 text-blue-900 px-3 py-2 rounded-full text-sm font-bold hover:bg-orange-300 transition-colors justify-center"
                    >
                      <Wrench className="h-4 w-4" />
                      <span>Editor Dashboard</span>
                    </Link>
                  )}
                  <Link
                    href="/profile"
                    className="flex items-center space-x-2 hover:text-yellow-300 transition-colors py-2"
                  >
                    <User className="h-5 w-5" />
                    <span className="font-medium">{user.displayName || user.email}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 hover:text-yellow-300 transition-colors py-2"
                  >
                    <LogOut className="h-5 w-5" />
                    <span className="font-medium">Logout</span>
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center space-x-2 hover:text-yellow-300 transition-colors py-2"
                >
                  <User className="h-5 w-5" />
                  <span className="font-medium">Login</span>
                </Link>
              )}
              <Link href="/cart" className="flex items-center space-x-2 hover:text-yellow-300 transition-colors py-2 relative">
                <ShoppingCart className="h-5 w-5" />
                <span className="font-medium">Cart</span>
                <span className="absolute -top-1 -right-1 bg-yellow-400 text-blue-900 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  2
                </span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
