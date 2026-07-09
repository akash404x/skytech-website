'use client';

import { collection, onSnapshot, query } from 'firebase/firestore';
import { Briefcase, DollarSign, Package, ShoppingCart, TrendingUp, Users, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { mapOrder, mapProduct, mapUserProfile, mapWork } from '@/lib/firestore-mappers';
import { formatCurrency, orderStatusLabel, statusBadgeClass, toDate } from '@/lib/format';
import type { Order, Product, UserProfile, Work, Review } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/Skeleton';

export default function AdminDashboard() {
  const { profile, isAdmin } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [works, setWorks] = useState<Work[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState({ orders: true, products: true, users: true, works: true, reviews: true });

  useEffect(() => {
    const unsubscribes: (() => void)[] = [];

    // Orders - both admin and editor can read
    const unsubscribeOrders = onSnapshot(
      query(collection(db, 'orders')),
      (snapshot) => {
        setOrders(snapshot.docs.map((document) => mapOrder(document.id, document.data())));
        setLoading((current) => ({ ...current, orders: false }));
      },
      (error) => {
        console.error('Error loading dashboard orders:', error);
        setLoading((current) => ({ ...current, orders: false }));
      },
    );
    unsubscribes.push(unsubscribeOrders);

    // Products - both admin and editor can read
    const unsubscribeProducts = onSnapshot(
      query(collection(db, 'products')),
      (snapshot) => {
        setProducts(snapshot.docs.map((document) => mapProduct(document.id, document.data())));
        setLoading((current) => ({ ...current, products: false }));
      },
      (error) => {
        console.error('Error loading dashboard products:', error);
        setLoading((current) => ({ ...current, products: false }));
      },
    );
    unsubscribes.push(unsubscribeProducts);

    // Works - both admin and editor can read
    const unsubscribeWorks = onSnapshot(
      query(collection(db, 'works')),
      (snapshot) => {
        setWorks(snapshot.docs.map((document) => mapWork(document.id, document.data())));
        setLoading((current) => ({ ...current, works: false }));
      },
      (error) => {
        console.error('Error loading dashboard works:', error);
        setLoading((current) => ({ ...current, works: false }));
      },
    );
    unsubscribes.push(unsubscribeWorks);

    // Users - admin only
    if (isAdmin) {
      const unsubscribeUsers = onSnapshot(
        query(collection(db, 'users')),
        (snapshot) => {
          setUsers(snapshot.docs.map((document) => mapUserProfile(document.id, document.data())));
          setLoading((current) => ({ ...current, users: false }));
        },
        (error) => {
          console.error('Error loading dashboard users:', error);
          setLoading((current) => ({ ...current, users: false }));
        },
      );
      unsubscribes.push(unsubscribeUsers);
    } else {
      setLoading((current) => ({ ...current, users: false }));
    }

    // Reviews - admin only
    if (isAdmin) {
      const unsubscribeReviews = onSnapshot(
        query(collection(db, 'reviews')),
        (snapshot) => {
          setReviews(snapshot.docs.map((document) => ({ id: document.id, ...document.data() } as Review)));
          setLoading((current) => ({ ...current, reviews: false }));
        },
        (error) => {
          console.error('Error loading dashboard reviews:', error);
          setLoading((current) => ({ ...current, reviews: false }));
        },
      );
      unsubscribes.push(unsubscribeReviews);
    } else {
      setLoading((current) => ({ ...current, reviews: false }));
    }

    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  }, [isAdmin]);

  const isLoading = loading.orders || loading.products || loading.users || loading.works || loading.reviews;
  const paidOrders = orders.filter((order) => order.status !== 'cancelled');
  const revenue = paidOrders.reduce((total, order) => total + order.total, 0);
  
  // Review stats
  const totalReviews = reviews.length;
  const pendingReviews = reviews.filter(r => r.status === 'pending').length;
  const approvedReviews = reviews.filter(r => r.status === 'approved').length;
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;
  
  const recentOrders = [...orders]
    .sort((a, b) => (toDate(b.createdAt)?.getTime() ?? 0) - (toDate(a.createdAt)?.getTime() ?? 0))
    .slice(0, 5);

  const topProductTotals = new Map<string, { name: string; quantity: number; revenue: number }>();
  paidOrders.forEach((order) => {
    order.items.forEach((item) => {
      const current = topProductTotals.get(item.productId) ?? { name: item.name, quantity: 0, revenue: 0 };
      topProductTotals.set(item.productId, {
        name: item.name,
        quantity: current.quantity + item.quantity,
        revenue: current.revenue + item.lineTotal,
      });
    });
  });
  const topProducts = Array.from(topProductTotals.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const featuredWorks = works.filter((work) => work.featured);
  const activeWorks = works.filter((work) => work.status === 'active');

  // Editor-only stat cards (no admin analytics)
  const editorStatCards = [
    { name: 'Orders', value: orders.length.toString(), icon: ShoppingCart, tone: 'bg-blue-100 text-blue-700' },
    { name: 'Products', value: products.length.toString(), icon: Package, tone: 'bg-amber-100 text-amber-700' },
    { name: 'Works', value: `${activeWorks.length} / ${works.length}`, icon: Briefcase, tone: 'bg-cyan-100 text-cyan-700' },
  ];

  // Admin stat cards (includes analytics)
  const adminStatCards = [
    { name: 'Total Revenue', value: formatCurrency(revenue), icon: DollarSign, tone: 'bg-green-100 text-green-700' },
    { name: 'Orders', value: orders.length.toString(), icon: ShoppingCart, tone: 'bg-blue-100 text-blue-700' },
    { name: 'Products', value: products.length.toString(), icon: Package, tone: 'bg-amber-100 text-amber-700' },
    { name: 'Total Reviews', value: totalReviews.toString(), icon: Star, tone: 'bg-yellow-100 text-yellow-700' },
    { name: 'Pending Reviews', value: pendingReviews.toString(), icon: Star, tone: 'bg-orange-100 text-orange-700' },
    { name: 'Approved Reviews', value: approvedReviews.toString(), icon: Star, tone: 'bg-green-100 text-green-700' },
    { name: 'Avg Rating', value: `${averageRating}⭐`, icon: Star, tone: 'bg-cyan-100 text-cyan-700' },
    { name: 'Works', value: `${activeWorks.length} / ${works.length}`, icon: Briefcase, tone: 'bg-cyan-100 text-cyan-700' },
    { name: 'Registered Users', value: users.length.toString(), icon: Users, tone: 'bg-purple-100 text-purple-700' },
  ];

  const statCards = isAdmin ? adminStatCards : editorStatCards;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="tech-heading-gradient text-3xl font-bold">Dashboard</h1>
        <p className="mt-2 tech-text">
          Welcome back, {profile?.displayName || 'Admin'}. These analytics are calculated from live Firestore orders.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="tech-glass-panel p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-cyan-200">{stat.name}</p>
                  <p className="mt-2 text-2xl font-bold text-white">{stat.value}</p>
                </div>
                <div className={`rounded-lg p-3 ${stat.tone}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <section className="tech-glass-panel p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Recent Orders</h2>
            <TrendingUp className="h-5 w-5 text-cyan-300" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left">
              <thead>
                <tr className="border-b border-white/10 text-sm text-slate-300">
                  <th className="py-3 pr-4 font-semibold">Order</th>
                  <th className="py-3 pr-4 font-semibold">Customer</th>
                  <th className="py-3 pr-4 font-semibold">Amount</th>
                  <th className="py-3 pr-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-white/10 text-sm">
                    <td className="py-3 pr-4 font-medium text-white">{order.orderNumber}</td>
                    <td className="py-3 pr-4 text-slate-300">{order.customerName}</td>
                    <td className="py-3 pr-4 font-semibold text-white">{formatCurrency(order.total, order.currency)}</td>
                    <td className="py-3 pr-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(order.status)}`}>
                        {orderStatusLabel(order.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {recentOrders.length === 0 && <p className="py-8 text-center text-sm text-slate-400">No orders yet.</p>}
          </div>
        </section>

        <section className="tech-glass-panel p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Top Products</h2>
            <Package className="h-5 w-5 text-cyan-300" />
          </div>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={product.name} className="flex items-center justify-between rounded-xl bg-slate-900/80 p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 font-bold text-cyan-200">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-white">{product.name}</p>
                    <p className="text-sm text-slate-400">{product.quantity} sold</p>
                  </div>
                </div>
                <p className="font-semibold text-white">{formatCurrency(product.revenue)}</p>
              </div>
            ))}
            {topProducts.length === 0 && <p className="py-8 text-center text-sm text-slate-400">Top products appear after orders are paid.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
