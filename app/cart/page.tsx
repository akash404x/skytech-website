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
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="mt-2 text-gray-600">Cart changes sync live to this browser and your Firestore account.</p>
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
                  <article key={item.productId} className="rounded-lg bg-white p-4 shadow-sm">
                    <div className="flex flex-col gap-4 sm:flex-row">
                      <div className="relative h-32 w-full overflow-hidden rounded-lg bg-gray-100 sm:w-32">
                        <ProductImage src={item.image} alt={item.name} />
                      </div>
                      <div className="flex flex-1 flex-col justify-between gap-4">
                        <div>
                          <p className="text-sm text-gray-500">{item.category}</p>
                          <h2 className="text-lg font-semibold text-gray-900">{item.name}</h2>
                          <p className="mt-1 text-sm text-gray-600">{formatCurrency(unitPrice)} each</p>
                          <p className="mt-1 text-xs text-gray-500">{item.stock} available</p>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center rounded-lg border border-gray-300">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              className="p-2 text-gray-600 hover:bg-gray-100"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="min-w-10 text-center text-sm font-semibold text-gray-900">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              className="p-2 text-gray-600 hover:bg-gray-100"
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="flex items-center gap-4">
                            <p className="font-bold text-gray-900">{formatCurrency(unitPrice * item.quantity)}</p>
                            <button
                              type="button"
                              onClick={() => {
                                removeItem(item.productId);
                                toast.success('Removed from cart');
                              }}
                              className="rounded-lg p-2 text-red-600 hover:bg-red-50"
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

            <aside className="h-fit rounded-lg bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>
              <div className="mt-6 space-y-3 border-b border-gray-200 pb-6">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Items</span>
                  <span>{itemCount}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span>Calculated after confirmation</span>
                </div>
              </div>
              <div className="mt-6 flex justify-between text-lg font-bold text-gray-900">
                <span>Total</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <Link
                href={user ? '/checkout' : '/login'}
                className="mt-6 flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
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
