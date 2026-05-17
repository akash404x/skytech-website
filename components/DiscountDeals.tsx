'use client';

import { Clock, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: string;
  stock: number;
  images: string[];
  rating: number;
  status: 'Active' | 'Inactive';
}

interface Deal {
  id: number;
  title: string;
  discount: string;
  products: Product[];
  bgColor: string;
  endTime: Date;
}

export default function DiscountDeals() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [timeLeft, setTimeLeft] = useState<{ [key: number]: string }>({});
  const [loading, setLoading] = useState(true);

  // Load products from Firestore with real-time listener
  useEffect(() => {
    const productsQuery = query(collection(db, 'products'), orderBy('name'), limit(8));
    const unsubscribe = onSnapshot(productsQuery, (snapshot) => {
      const productsData = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Product))
        .filter(product => product.status === 'Active' && product.discountPrice && product.discountPrice < product.price);
      
      // Create deals from products with discounts
      const dealsData: Deal[] = [
        {
          id: 1,
          title: 'Arduino & IoT Deals',
          discount: 'Up to 40% OFF',
          products: productsData.slice(0, 4),
          bgColor: 'from-blue-500 to-cyan-500',
          endTime: new Date(Date.now() + 5 * 60 * 60 * 1000)
        },
        {
          id: 2,
          title: 'Sensor & Component Deals',
          discount: 'Flat 35% OFF',
          products: productsData.slice(4, 8),
          bgColor: 'from-purple-500 to-pink-500',
          endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
        },
      ].filter(deal => deal.products.length > 0);
      
      setDeals(dealsData);
      setLoading(false);
    }, (error) => {
      console.error('Error loading products:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const newTimeLeft: { [key: number]: string } = {};
      deals.forEach((deal) => {
        const now = new Date().getTime();
        const distance = deal.endTime.getTime() - now;
        
        if (distance > 0) {
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);
          newTimeLeft[deal.id] = `${hours}h ${minutes}m ${seconds}s`;
        } else {
          newTimeLeft[deal.id] = 'Expired';
        }
      });
      setTimeLeft(newTimeLeft);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [deals]);

  if (loading) {
    return (
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Hot Deals & Offers</h2>
          <div className="text-center py-12">
            <p className="text-gray-500">Loading deals...</p>
          </div>
        </div>
      </section>
    );
  }

  if (deals.length === 0) {
    return (
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Hot Deals & Offers</h2>
          <div className="text-center py-12">
            <p className="text-gray-500">No deals available at the moment.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Hot Deals & Offers</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {deals.map((deal) => (
            <div
              key={deal.id}
              className={`rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1`}
            >
              <div className={`bg-gradient-to-r ${deal.bgColor} p-6 text-white`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-bold mb-1">{deal.title}</h3>
                    <p className="text-3xl font-extrabold">{deal.discount}</p>
                  </div>
                  <div className="flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                    <Clock className="h-5 w-5 mr-2" />
                    <span className="font-semibold">{timeLeft[deal.id] || 'Loading...'}</span>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-white">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {deal.products.map((product) => (
                    <div
                      key={product.id}
                      className="text-center p-4 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors cursor-pointer group"
                    >
                      <div className="h-[220px] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden mb-2">
                        {product.images[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`w-full h-full flex items-center justify-center text-4xl ${product.images[0] ? 'hidden' : ''}`}>
                          📦
                        </div>
                      </div>
                      <h4 className="text-sm font-medium text-gray-900 mb-1 line-clamp-1">
                        {product.name}
                      </h4>
                      <div className="flex flex-col items-center">
                        <span className="text-lg font-bold text-gray-900">₹{product.discountPrice ? product.discountPrice.toLocaleString() : product.price.toLocaleString()}</span>
                        {product.discountPrice && product.discountPrice < product.price && (
                          <>
                            <span className="text-xs text-gray-500 line-through">
                              ₹{product.price.toLocaleString()}
                            </span>
                            <span className="text-xs text-green-600 font-medium">
                              {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% off
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 group-hover:shadow-lg">
                  View All Deals
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
