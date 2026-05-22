'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Info, LogOut, Menu, Package, PackageCheck, Search, Shield, ShoppingCart, User, Wrench, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';

function NavLink({
  href,
  children,
  className = '',
  isActive = false,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  isActive?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`tech-nav-link flex items-center gap-1.5 ${isActive ? 'tech-nav-link-active' : ''} ${className}`}
      aria-current={isActive ? 'page' : undefined}
    >
      {children}
    </Link>
  );
}

export default function Navbar() {
  const { user, loading, signOut, isAdmin, isEditor } = useAuth();
  const { itemCount } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);

  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(href);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  const submitSearch = () => {
    const q = searchQuery.trim();
    if (q) router.push(`/products?q=${encodeURIComponent(q)}`);
    else router.push('/products');
  };

  const cartBadge = (
    <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-400 text-xs font-bold text-slate-950 shadow-[0_0_12px_rgba(34,211,238,0.5)]">
      {itemCount}
    </span>
  );

  return (
    <nav
      className={`tech-navbar sticky top-0 z-50 text-slate-100 transition-all duration-300 ${
        scrolled ? 'tech-navbar-scrolled' : ''
      }`}
    >
      <div className="tech-navbar-glow pointer-events-none absolute inset-x-0 bottom-0 h-px" aria-hidden />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between md:h-[4.25rem]">
          <Link href="/" className="group flex shrink-0 items-center transition-transform duration-300 hover:scale-[1.02]">
            <div className="text-2xl font-bold italic tracking-tight text-white">
              Sky<span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">Tech</span>
            </div>
          </Link>

          {pathname === '/products' && (
            <div className="mx-6 hidden max-w-2xl flex-1 md:flex lg:mx-8">
              <div className="relative w-full">
                <input
                  type="search"
                  placeholder="Search products, brands and more"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') submitSearch();
                  }}
                  className="tech-nav-search w-full rounded-lg py-2.5 pl-10 pr-4"
                />
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          )}

          <div className="hidden items-center gap-2 md:flex md:gap-3">
            <NavLink href="/" isActive={isActiveRoute('/')}>
              <Home className="h-4 w-4 shrink-0 opacity-80" />
              <span className="font-medium">Home</span>
            </NavLink>
            <NavLink href="/products" isActive={isActiveRoute('/products')}>
              <Package className="h-4 w-4 shrink-0 opacity-80" />
              <span className="font-medium">Products</span>
            </NavLink>
            <NavLink href="/services" isActive={isActiveRoute('/services')}>
              <Wrench className="h-4 w-4 shrink-0 opacity-80" />
              <span className="font-medium">Services</span>
            </NavLink>
            <NavLink href="/about" isActive={isActiveRoute('/about')}>
              <Info className="h-4 w-4 shrink-0 opacity-80" />
              <span className="font-medium">About</span>
            </NavLink>

            {loading ? (
              <div className="mx-2 h-6 w-6 animate-spin rounded-full border-2 border-cyan-400/30 border-t-cyan-400" />
            ) : user ? (
              <>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="tech-nav-badge ml-1 flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-200 transition hover:border-amber-300/60 hover:bg-amber-500/25 hover:shadow-[0_0_16px_rgba(251,191,36,0.2)]"
                  >
                    <Shield className="h-3.5 w-3.5" />
                    Admin
                  </Link>
                )}
                {isEditor && !isAdmin && (
                  <Link
                    href="/admin"
                    className="tech-nav-badge ml-1 flex items-center gap-1 rounded-full border border-orange-400/40 bg-orange-500/15 px-3 py-1 text-xs font-bold text-orange-200 transition hover:border-orange-300/60 hover:bg-orange-500/25"
                  >
                    <Wrench className="h-3.5 w-3.5" />
                    Editor
                  </Link>
                )}
                <NavLink href="/profile">
                  <User className="h-4 w-4 shrink-0 opacity-80" />
                  <span className="max-w-28 truncate font-medium">{user.displayName || user.email}</span>
                </NavLink>
                <NavLink href="/orders">
                  <PackageCheck className="h-4 w-4 shrink-0 opacity-80" />
                  <span className="font-medium">Orders</span>
                </NavLink>
                <button type="button" onClick={handleLogout} className="tech-nav-link flex items-center gap-1.5">
                  <LogOut className="h-4 w-4 shrink-0 opacity-80" />
                  <span className="font-medium">Logout</span>
                </button>
              </>
            ) : (
              <NavLink href="/login">
                <User className="h-4 w-4 shrink-0 opacity-80" />
                <span className="font-medium">Login</span>
              </NavLink>
            )}

            <NavLink href="/cart" className="relative ml-1" isActive={isActiveRoute('/cart')}>
              <ShoppingCart className="h-4 w-4 shrink-0 opacity-80" />
              <span className="font-medium">Cart</span>
              {cartBadge}
            </NavLink>
          </div>

          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setIsMenuOpen((open) => !open)}
              className="tech-nav-menu-btn inline-flex items-center justify-center rounded-lg p-2"
              aria-label="Toggle navigation menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="animate-slideDown border-t border-white/5 pb-4 pt-3 md:hidden">
            <div className="relative mb-4">
              <input
                type="search"
                placeholder="Search products, brands and more"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') submitSearch();
                }}
                className="tech-nav-search w-full rounded-lg py-2.5 pl-10 pr-4"
              />
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            </div>
            <div className="flex flex-col gap-2">
              <NavLink href="/" className="rounded-lg px-2 py-2.5" isActive={isActiveRoute('/')}>
                <Home className="h-5 w-5" />
                <span>Home</span>
              </NavLink>
              <NavLink href="/products" className="rounded-lg px-2 py-2.5" isActive={isActiveRoute('/products')}>
                <Package className="h-5 w-5" />
                <span>Products</span>
              </NavLink>
              <NavLink href="/services" className="rounded-lg px-2 py-2.5" isActive={isActiveRoute('/services')}>
                <Wrench className="h-5 w-5" />
                <span>Services</span>
              </NavLink>
              <NavLink href="/about" className="rounded-lg px-2 py-2.5" isActive={isActiveRoute('/about')}>
                <Info className="h-5 w-5" />
                <span>About</span>
              </NavLink>

              {loading ? (
                <div className="flex justify-center py-3">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-400/30 border-t-cyan-400" />
                </div>
              ) : user ? (
                <>
                  {(isAdmin || isEditor) && (
                    <Link
                      href="/admin"
                      className="mb-2 flex items-center justify-center gap-2 rounded-lg border border-amber-400/40 bg-amber-500/15 px-3 py-2.5 text-sm font-bold text-amber-200"
                    >
                      <Shield className="h-4 w-4" />
                      {isAdmin ? 'Admin Dashboard' : 'Editor Dashboard'}
                    </Link>
                  )}
                  <NavLink href="/profile" className="rounded-lg px-2 py-2.5">
                    <User className="h-5 w-5" />
                    <span>{user.displayName || user.email}</span>
                  </NavLink>
                  <NavLink href="/orders" className="rounded-lg px-2 py-2.5">
                    <PackageCheck className="h-5 w-5" />
                    <span>Orders</span>
                  </NavLink>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="tech-nav-link flex w-full items-center gap-2 rounded-lg px-2 py-2.5 text-left"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <NavLink href="/login" className="rounded-lg px-2 py-2.5">
                  <User className="h-5 w-5" />
                  <span>Login</span>
                </NavLink>
              )}

              <NavLink href="/cart" className="relative rounded-lg px-2 py-2.5" isActive={isActiveRoute('/cart')}>
                <ShoppingCart className="h-5 w-5" />
                <span>Cart</span>
                {cartBadge}
              </NavLink>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
