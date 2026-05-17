'use client';

import { Star, ShoppingCart, Heart } from 'lucide-react';
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

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
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
        .filter(product => product.status === 'Active');
      setProducts(productsData);
      setLoading(false);
    }, (error) => {
      console.error('Error loading products:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const toggleWishlist = (id: string) => {
    setWishlist((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const discount = (price: number, discountPrice: number) => {
    if (!price || price <= 0) return 0;
    return Math.round(((price - discountPrice) / price) * 100);
  };

  if (loading) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
          </div>
          <div className="text-center py-12">
            <p className="text-gray-500">Loading products...</p>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
          </div>
          <div className="text-center py-12">
            <p className="text-gray-500">No products available yet.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
          <button className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
            View All →
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group transform hover:-translate-y-2"
              >
                <div className="relative">
                  <div className="h-[220px] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
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
                    <div className={`w-full h-full flex items-center justify-center text-6xl ${product.images[0] ? 'hidden' : ''}`}>
                      📦
                    </div>
                  </div>
                  {product.discountPrice && product.discountPrice < product.price && (
                    <span className="absolute top-3 left-3 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      {discount(product.price, product.discountPrice)}% OFF
                    </span>
                  )}
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors group/wishlist"
                  >
                    <Heart
                      className={`h-5 w-5 ${
                        wishlist.has(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'
                      } group-hover/wishlist:text-red-500 transition-colors`}
                    />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2 line-clamp-1">{product.description}</p>
                  <div className="flex items-center mb-2">
                    <div className="flex items-center bg-green-600 text-white text-xs px-2 py-0.5 rounded">
                      <Star className="h-3 w-3 fill-current mr-1" />
                      {product.rating}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-xl font-bold text-gray-900">₹{product.discountPrice ? product.discountPrice.toLocaleString() : product.price.toLocaleString()}</span>
                      {product.discountPrice && product.discountPrice < product.price && (
                        <>
                          <span className="text-sm text-gray-500 line-through ml-2">
                            ₹{product.price.toLocaleString()}
                          </span>
                          <span className="text-sm text-green-600 font-medium ml-2">
                            {discount(product.price, product.discountPrice)}% off
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2 group-hover:shadow-lg">
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}
