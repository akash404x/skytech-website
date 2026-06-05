'use client';

import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { Eye, ShoppingCart, Star } from 'lucide-react';
import { useRef } from 'react';
import { toast } from 'react-hot-toast';
import ProductImage from '@/components/ProductImage';
import { useCart } from '@/contexts/CartContext';
import { formatCurrency } from '@/lib/format';
import { getProductPrice } from '@/lib/cart';
import type { Product } from '@/lib/types';

interface PremiumProductCardProps {
  product: Product;
  index: number;
}

export default function PremiumProductCard({ product, index }: PremiumProductCardProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.12 });
  const { addItem } = useCart();
  const salePrice = getProductPrice(product);
  const hasDiscount = salePrice < product.price;
  const discount = hasDiscount ? Math.round(((product.price - salePrice) / product.price) * 100) : 0;

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] as const }}
      style={{ perspective: 1200 }}
      className="product-card-3d group relative rounded-2xl bg-gradient-to-br from-blue-500/30 via-purple-500/20 to-cyan-500/30 p-[1px] transition-shadow duration-500 hover:shadow-[0_0_36px_rgba(59,130,246,0.22)]"
    >
      <motion.div
        className="product-card-inner flex h-full flex-col overflow-hidden rounded-[15px]"
        whileHover={{ y: -10, rotateX: 5, rotateY: -5, scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <Link href={`/products/${product.id}`} className="relative block aspect-[4/3] overflow-hidden bg-slate-800/60">
          <motion.div className="h-full w-full transition-transform duration-500 group-hover:scale-110">
            <ProductImage src={product.images[0]} alt={product.name} className="transition-transform duration-500" />
          </motion.div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          {hasDiscount && (
            <span className="absolute left-3 top-3 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-3 py-1 text-xs font-bold text-white shadow-lg shadow-blue-500/40">
              {discount}% OFF
            </span>
          )}
          {product.featured && (
            <span className="absolute right-3 top-3 rounded-full border border-amber-400/40 bg-amber-500/20 px-2.5 py-1 text-xs font-semibold text-amber-200">
              Featured
            </span>
          )}
        </Link>

        <div className="flex flex-1 flex-col p-5">
          <div className="mb-2 flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <span className="text-xs font-medium uppercase tracking-wide text-cyan-300/80">{product.category}</span>
              <h3 className="mt-1 line-clamp-2 text-lg font-bold text-white transition-colors group-hover:text-blue-200">
                {product.name}
              </h3>
            </div>
            <div className="flex shrink-0 items-center rounded-lg bg-green-600/90 px-2 py-1 text-xs font-semibold text-white">
              <Star className="mr-0.5 h-3 w-3 fill-current" />
              {product.rating.toFixed(1)}
            </div>
          </div>

          <p className="mb-4 line-clamp-2 flex-1 text-sm leading-relaxed tech-muted">{product.description}</p>

          <div className="mb-4 flex flex-wrap items-baseline gap-2">
            <span className="text-xl font-bold text-white">{formatCurrency(salePrice)}</span>
            {hasDiscount && <span className="text-sm tech-muted line-through">{formatCurrency(product.price)}</span>}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Link
              href={`/products/${product.id}`}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-blue-400/40 hover:bg-blue-500/10 hover:text-white"
            >
              <Eye className="h-4 w-4" />
              Details
            </Link>
            <button
              type="button"
              disabled={product.stock <= 0}
              onClick={() => {
                addItem(product);
                toast.success('Added to cart');
              }}
              className="tech-btn-primary flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm disabled:opacity-50"
            >
              <ShoppingCart className="h-4 w-4" />
              {product.stock > 0 ? 'Add' : 'Out'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.article>
  );
}
