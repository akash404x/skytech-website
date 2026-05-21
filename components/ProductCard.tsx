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
    <article className="tech-glass-card group overflow-hidden transition hover:-translate-y-1 hover:border-blue-400/30 hover:shadow-blue-500/10">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-800/50">
        <ProductImage src={product.images[0]} alt={product.name} priority={priority} />
        {hasDiscount && (
          <span className="absolute left-3 top-3 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white shadow-lg shadow-blue-500/30">
            {discount}% off
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="mb-2 flex items-start justify-between gap-3">
          <div>
            <h3 className="line-clamp-2 font-semibold text-white group-hover:text-blue-300">
              {product.name}
            </h3>
            <p className="mt-1 line-clamp-2 text-sm tech-muted">{product.description}</p>
          </div>
          <div className="flex shrink-0 items-center rounded bg-green-600 px-2 py-1 text-xs font-medium text-white">
            <Star className="mr-1 h-3 w-3 fill-current" />
            {product.rating.toFixed(1)}
          </div>
        </div>

        <div className="mb-4 flex flex-wrap items-baseline gap-2">
          <span className="text-xl font-bold text-white">{formatCurrency(salePrice)}</span>
          {hasDiscount && <span className="text-sm tech-muted line-through">{formatCurrency(product.price)}</span>}
        </div>

        <button
          type="button"
          disabled={product.stock <= 0}
          onClick={() => {
            addItem(product);
            toast.success('Added to cart');
          }}
          className="tech-btn-primary flex w-full items-center justify-center gap-2 px-4 py-2.5 text-sm disabled:opacity-50"
        >
          <ShoppingCart className="h-4 w-4" />
          {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </article>
  );
}
