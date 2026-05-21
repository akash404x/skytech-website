'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { CART_STORAGE_KEY, getCartSubtotal, productToCartItem, sanitizeCartItems } from '@/lib/cart';
import { db } from '@/lib/firebase';
import type { CartItem, Product } from '@/lib/types';
import { useAuth } from './AuthContext';

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  itemCount: number;
  subtotal: number;
  addItem: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function signature(items: CartItem[]) {
  return JSON.stringify(
    items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
      discountPrice: item.discountPrice,
      stock: item.stock,
    })),
  );
}

function readLocalCart() {
  if (typeof window === 'undefined') return [];

  try {
    const stored = window.localStorage.getItem(CART_STORAGE_KEY);
    return stored ? sanitizeCartItems(JSON.parse(stored) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(true);
  const localItemsRef = useRef<CartItem[]>([]);
  const lastRemoteSignature = useRef('');

  useEffect(() => {
    const localItems = readLocalCart();
    localItemsRef.current = localItems;
    queueMicrotask(() => {
      setItems(localItems);
      setHydrated(true);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!hydrated || !user) return undefined;

    queueMicrotask(() => setLoading(true));
    const cartRef = doc(db, 'carts', user.uid);
    let firstSnapshot = true;

    const unsubscribe = onSnapshot(
      cartRef,
      async (snapshot) => {
        if (!snapshot.exists()) {
          if (firstSnapshot && localItemsRef.current.length > 0) {
            await setDoc(
              cartRef,
              { userId: user.uid, items: localItemsRef.current, updatedAt: serverTimestamp() },
              { merge: true },
            );
          }
          firstSnapshot = false;
          setLoading(false);
          return;
        }

        const remoteItems = sanitizeCartItems((snapshot.data().items ?? []) as CartItem[]);
        lastRemoteSignature.current = signature(remoteItems);
        localItemsRef.current = remoteItems;
        setItems(remoteItems);
        firstSnapshot = false;
        setLoading(false);
      },
      (error) => {
        console.error('Error listening to cart:', error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [hydrated, user]);

  useEffect(() => {
    if (!hydrated) return;

    localItemsRef.current = items;
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));

    if (!user) return;

    const currentSignature = signature(items);
    if (currentSignature === lastRemoteSignature.current) return;

    lastRemoteSignature.current = currentSignature;
    setDoc(
      doc(db, 'carts', user.uid),
      { userId: user.uid, items, updatedAt: serverTimestamp() },
      { merge: true },
    ).catch((error) => {
      console.error('Error saving cart:', error);
      toast.error('Could not sync your cart');
    });
  }, [hydrated, items, user]);

  const addItem = useCallback((product: Product, quantity = 1) => {
    if (product.stock <= 0) {
      toast.error('This product is out of stock');
      return;
    }

    setItems((currentItems) => {
      const existing = currentItems.find((item) => item.productId === product.id);
      if (!existing) {
        return sanitizeCartItems([...currentItems, productToCartItem(product, quantity)]);
      }

      return currentItems.map((item) =>
        item.productId === product.id
          ? {
              ...item,
              quantity: Math.min(item.quantity + quantity, product.stock),
              stock: product.stock,
              price: product.price,
              discountPrice: product.discountPrice,
            }
          : item,
      );
    });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems((currentItems) =>
      sanitizeCartItems(
        currentItems.map((item) =>
          item.productId === productId
            ? { ...item, quantity: Math.min(Math.max(1, quantity), Math.max(item.stock, 1)) }
            : item,
        ),
      ),
    );
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.productId !== productId));
  }, []);

  const clearCart = useCallback(async () => {
    setItems([]);
    if (user) {
      await setDoc(
        doc(db, 'carts', user.uid),
        { userId: user.uid, items: [], updatedAt: serverTimestamp() },
        { merge: true },
      );
    }
  }, [user]);

  const value = useMemo<CartContextType>(
    () => ({
      items,
      loading,
      itemCount: items.reduce((total, item) => total + item.quantity, 0),
      subtotal: getCartSubtotal(items),
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [addItem, clearCart, items, loading, removeItem, updateQuantity],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
