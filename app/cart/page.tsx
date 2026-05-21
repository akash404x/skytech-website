'use client';

import Link from 'next/link';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import EmptyState from '@/components/EmptyState';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import ProductImage from '@/components/ProductImage';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { formatCurrency } from '@/lib/format';
import { getCartItemPrice } from '@/lib/cart';

export default function CartPage() {
  const { user } = useAuth();
  const { items, loading, itemCount, subtotal, updateQuantity, removeItem } = useCart();

  return (
    <div className="tech-page flex min-h-screen flex-col">
      <Navbar />
      <main className="tech-main">
        <div className="tech-page-header">
          <h1 className="tech-heading-gradient">Shopping Cart</h1>
          <p className="mt-2 tech-text">Cart changes sync live to this browser and your Firestore account.</p>
        </div>

        {loading ? (
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-32" />
              ))}
            </div>
            <Skeleton className="h-64" />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="Your cart is empty"
            description="Add products from the store and they will appear here instantly."
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              {items.map((item) => {
                const unitPrice = getCartItemPrice(item);
                return (
                  <article key={item.productId} className="tech-glass-card p-4">
                    <div className="flex flex-col gap-4 sm:flex-row">
                      <div className="relative h-32 w-full overflow-hidden rounded-lg bg-slate-800/50 sm:w-32">
                        <ProductImage src={item.image} alt={item.name} />
                      </div>
                      <div className="flex flex-1 flex-col justify-between gap-4">
                        <div>
                          <p className="text-sm tech-muted">{item.category}</p>
                          <h2 className="text-lg font-semibold text-white">{item.name}</h2>
                          <p className="mt-1 text-sm tech-text">{formatCurrency(unitPrice)} each</p>
                          <p className="mt-1 text-xs tech-muted">{item.stock} available</p>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center rounded-lg border border-white/15">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              className="p-2 text-slate-300 hover:bg-white/5"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="min-w-10 text-center text-sm font-semibold text-white">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              className="p-2 text-slate-300 hover:bg-white/5"
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="flex items-center gap-4">
                            <p className="font-bold text-white">{formatCurrency(unitPrice * item.quantity)}</p>
                            <button
                              type="button"
                              onClick={() => {
                                removeItem(item.productId);
                                toast.success('Removed from cart');
                              }}
                              className="rounded-lg p-2 text-red-400 hover:bg-red-500/10"
                              aria-label="Remove item"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <aside className="tech-glass-card h-fit p-6">
              <h2 className="text-xl font-bold text-white">Order Summary</h2>
              <div className="mt-6 space-y-3 border-b border-white/10 pb-6">
                <div className="flex justify-between text-sm tech-text">
                  <span>Items</span>
                  <span>{itemCount}</span>
                </div>
                <div className="flex justify-between text-sm tech-text">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm tech-text">
                  <span>Shipping</span>
                  <span>Calculated after confirmation</span>
                </div>
              </div>
              <div className="mt-6 flex justify-between text-lg font-bold text-white">
                <span>Total</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <Link href={user ? '/checkout' : '/login'} className="tech-btn-primary mt-6 flex w-full items-center justify-center px-4 py-3">
                {user ? 'Proceed to Checkout' : 'Sign in to Checkout'}
              </Link>
            </aside>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
