'use client';

import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { Eye, ShoppingCart, Star } from 'lucide-react';
import { useRef } from 'react';
import { toast } from 'react-hot-toast';
import ProductImage from '@/components/ProductImage';
import { useCart } from '@/contexts/CartContext';
import { formatCurrency } from '@/lib/format';
import { getProductPrice, getProductImageUrl } from '@/lib/cart';
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
  const imageUrl = getProductImageUrl(product);

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] as const }}
      className="group relative"
    >
      {/* Neon glow effect */}
      <motion.div
        className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-blue-500/40 via-purple-500/40 to-cyan-500/40 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100"
        animate={{
          opacity: isInView ? 0.3 : 0,
        }}
        whileHover={{
          opacity: 0.8,
          scale: 1.05,
        }}
        transition={{ duration: 0.5 }}
      />

      {/* Card */}
      <motion.div
        className="relative h-full overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900/80 via-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-white/10 shadow-2xl"
        whileHover={{
          y: -8,
          scale: 1.02,
          boxShadow: '0 25px 50px -12px rgba(59, 130, 246, 0.25), 0 0 30px rgba(168, 85, 247, 0.15)',
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {/* Image area with gradient glow */}
        <Link href={`/products/${product.id}`} className="relative block aspect-square overflow-hidden">
          {/* Gradient glow behind image */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/10 to-cyan-500/20" />
          
          {/* Radial glow spotlight */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,212,255,0.25)_0%,transparent_70%)]" />
          
          {/* Image container with proper scaling */}
          <div className="relative h-full w-full">
            <motion.div
              className="relative h-full w-full"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <ProductImage
                src={imageUrl}
                alt={product.name}
                className="h-full w-full object-cover object-center"
              />
            </motion.div>
          </div>

          {/* Overlay gradient */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60" />

          {/* Badges */}
          {hasDiscount && (
            <motion.span
              initial={{ scale: 0, rotate: -180 }}
              animate={isInView ? { scale: 1, rotate: 0 } : {}}
              transition={{ delay: index * 0.05 + 0.2, type: 'spring' }}
              className="absolute left-3 top-3 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg shadow-rose-500/40"
            >
              {discount}% OFF
            </motion.span>
          )}
          {product.featured && (
            <motion.span
              initial={{ scale: 0, rotate: -180 }}
              animate={isInView ? { scale: 1, rotate: 0 } : {}}
              transition={{ delay: index * 0.05 + 0.25, type: 'spring' }}
              className="absolute right-3 top-3 rounded-full border border-amber-400/50 bg-amber-500/20 backdrop-blur-sm px-2.5 py-1.5 text-xs font-semibold text-amber-200 shadow-lg shadow-amber-500/20"
            >
              Featured
            </motion.span>
          )}
        </Link>

        {/* Content */}
        <div className="flex flex-1 flex-col p-5">
          <div className="mb-3 flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <motion.span
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ delay: index * 0.05 + 0.1 }}
                className="text-xs font-semibold uppercase tracking-wider text-cyan-400/90"
              >
                {product.category}
              </motion.span>
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.05 + 0.15 }}
                className="mt-1.5 line-clamp-2 text-base font-bold text-white transition-colors group-hover:text-blue-200"
              >
                {product.name}
              </motion.h3>
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={isInView ? { scale: 1 } : {}}
              transition={{ delay: index * 0.05 + 0.2, type: 'spring' }}
              className="flex shrink-0 items-center rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-500/30 px-2 py-1 text-xs font-semibold text-amber-200"
            >
              <Star className="mr-0.5 h-3 w-3 fill-amber-400 text-amber-400" />
              {product.rating.toFixed(1)}
            </motion.div>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: index * 0.05 + 0.2 }}
            className="mb-4 line-clamp-2 flex-1 text-sm leading-relaxed text-slate-400"
          >
            {product.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: index * 0.05 + 0.25 }}
            className="mb-4 flex flex-wrap items-baseline gap-2"
          >
            <span className="text-xl font-bold text-white">{formatCurrency(salePrice)}</span>
            {hasDiscount && (
              <span className="text-sm text-slate-500 line-through">{formatCurrency(product.price)}</span>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: index * 0.05 + 0.3 }}
            className="grid grid-cols-2 gap-2.5"
          >
            <Link
              href={`/products/${product.id}`}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-semibold text-slate-300 transition-all duration-300 hover:border-blue-400/40 hover:bg-blue-500/10 hover:text-white hover:shadow-lg hover:shadow-blue-500/20"
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
              className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-3 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:from-blue-500 hover:to-purple-500 hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="h-4 w-4" />
              {product.stock > 0 ? 'Add' : 'Out'}
            </button>
          </motion.div>
        </div>
      </motion.div>
    </motion.article>
  );
}
