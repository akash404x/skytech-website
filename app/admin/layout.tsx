'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Briefcase, LayoutDashboard, Package, ShoppingCart, Users, LogOut, Menu, X, Shield, Wrench, RotateCcw, RefreshCw, Settings } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading: firebaseLoading, isAdmin, isEditor, role, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAuthenticated = !!user;
  const isLoading = firebaseLoading;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    } else if (!isLoading && isAuthenticated && !isEditor) {
      router.push('/');
    }
  }, [isLoading, isAuthenticated, isEditor, router]);

  if (isLoading) {
    return (
      <div className="tech-loading-screen">
        <div className="tech-spinner" />
      </div>
    );
  }

  if (!isAuthenticated || !isEditor) {
    return null;
  }

  // At this point, we know the user is authenticated and is editor or admin
  const userName = user?.displayName || 'Admin';
  const userInitial = userName.charAt(0).toUpperCase();

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Services', href: '/admin/services', icon: Wrench },
    { name: 'Works', href: '/admin/works', icon: Briefcase },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Returns', href: '/admin/returns', icon: RotateCcw },
    { name: 'Replacements', href: '/admin/replacements', icon: RefreshCw },
    { name: 'Pricing Settings', href: '/admin/pricing-settings', icon: Settings },
    ...(isAdmin ? [{ name: 'Users', href: '/admin/users', icon: Users }] : []),
  ];

  return (
    <div className="relative flex min-h-screen admin-background text-slate-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-950/95 border-r border-cyan-500/10 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 bg-slate-950/90 border-b border-cyan-500/10">
          <div className="text-2xl font-bold italic text-white">
            Sky<span className="text-yellow-400">Tech</span>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
            aria-label="Close sidebar"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="px-3 flex items-center space-x-3 mb-6">
            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
              {userInitial}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{userName}</p>
              <p className="text-xs text-gray-400 flex items-center">
                <Shield className="h-3 w-3 mr-1" />
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </p>
            </div>
          </div>

          <nav className="mt-5 px-2 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-colors ${
                    isActive
                      ? 'bg-cyan-500/15 text-white ring-1 ring-cyan-400/20'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <item.icon
                    className={`h-5 w-5 mr-3 ${isActive ? 'text-cyan-200' : 'text-slate-400 group-hover:text-cyan-200'}`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex-shrink-0 space-y-3 bg-slate-950/90 p-4 border-t border-cyan-500/10">
          <Link href="/" className="flex items-center text-slate-300 hover:text-white transition-colors">
            <LayoutDashboard className="h-5 w-5 mr-3 text-cyan-300" />
            Back to Store
          </Link>
          <button type="button" onClick={handleLogout} className="flex items-center text-slate-300 hover:text-white transition-colors">
            <LogOut className="h-5 w-5 mr-3 text-cyan-300" />
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1">
        {/* Top bar */}
        <div className="tech-admin-bar">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="px-4 text-slate-300 hover:text-white focus:outline-none lg:hidden"
                aria-label="Open sidebar"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="relative ml-3 flex flex-1 items-center justify-end">
                <div className="flex items-center space-x-4">
                  <span className="tech-admin-bar-text text-sm">{userName}</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                    {userInitial}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
