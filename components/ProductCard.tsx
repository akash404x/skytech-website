'use client';

import { ShoppingCart, Star } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '@/lib/format';
import { getProductPrice } from '@/lib/cart';
import type { Product } from '@/lib/types';
import { useCart } from '@/contexts/CartContext';
import ProductImage from './ProductImage';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const { addItem } = useCart();
  const salePrice = getProductPrice(product);
  const hasDiscount = salePrice < product.price;
  const discount = hasDiscount ? Math.round(((product.price - salePrice) / product.price) * 100) : 0;

  return (
    <article className="group overflow-hidden rounded-lg bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <ProductImage src={product.images[0]} alt={product.name} priority={priority} />
        {hasDiscount && (
          <span className="absolute left-3 top-3 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
            {discount}% off
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="mb-2 flex items-start justify-between gap-3">
          <div>
            <h3 className="line-clamp-2 font-semibold text-gray-900 group-hover:text-blue-700">
              {product.name}
            </h3>
            <p className="mt-1 line-clamp-2 text-sm text-gray-600">{product.description}</p>
          </div>
          <div className="flex shrink-0 items-center rounded bg-green-600 px-2 py-1 text-xs font-medium text-white">
            <Star className="mr-1 h-3 w-3 fill-current" />
            {product.rating.toFixed(1)}
          </div>
        </div>

        <div className="mb-4 flex flex-wrap items-baseline gap-2">
          <span className="text-xl font-bold text-gray-900">{formatCurrency(salePrice)}</span>
          {hasDiscount && <span className="text-sm text-gray-500 line-through">{formatCurrency(product.price)}</span>}
        </div>

        <button
          type="button"
          disabled={product.stock <= 0}
          onClick={() => {
            addItem(product);
            toast.success('Added to cart');
          }}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          <ShoppingCart className="h-4 w-4" />
          {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </article>
  );
}
