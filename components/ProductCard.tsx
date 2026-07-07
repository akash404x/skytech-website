'use client';

import { motion } from 'framer-motion';
import { ShoppingCart, Sparkles, Star, Eye } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '@/lib/format';
import { getProductPrice, getProductImageUrl } from '@/lib/cart';
import type { Product } from '@/lib/types';
import { useCart } from '@/contexts/CartContext';
import ProductImage from './ProductImage';
import Link from 'next/link';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const { addItem } = useCart();
  const salePrice = getProductPrice(product);
  const hasDiscount = salePrice < product.price;
  const discount = hasDiscount ? Math.round(((product.price - salePrice) / product.price) * 100) : 0;
  const imageUrl = getProductImageUrl(product);

  return (
    <motion.article
      whileHover={{ y: -8 }}
      className="group relative"
    >
      <div className="relative h-full overflow-hidden rounded-2xl bg-[#06122d]/40 backdrop-blur-xl border border-[#00bfff]/10 hover:border-[#00bfff]/30 transition-all duration-500">
        {/* Image Section */}
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-800/50">
          <motion.div
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full"
          >
            <ProductImage src={imageUrl} alt={product.name} priority={priority} />
          </motion.div>
          
          {/* Badges */}
          {product.featured && (
            <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#00bfff] to-[#00e5ff] px-3 py-1 text-xs font-semibold text-[#020617] shadow-[0_0_20px_rgba(0,191,255,0.4)]">
              <Sparkles className="h-3 w-3 fill-current" />
              Featured
            </span>
          )}
          {hasDiscount && !product.featured && (
            <span className="absolute left-3 top-3 rounded-full bg-gradient-to-r from-[#00bfff] to-[#00e5ff] px-3 py-1 text-xs font-semibold text-[#020617] shadow-[0_0_20px_rgba(0,191,255,0.4)]">
              {discount}% off
            </span>
          )}
          {hasDiscount && product.featured && (
            <span className="absolute right-3 top-3 rounded-full bg-gradient-to-r from-[#00bfff] to-[#00e5ff] px-3 py-1 text-xs font-semibold text-[#020617] shadow-[0_0_20px_rgba(0,191,255,0.4)]">
              {discount}% off
            </span>
          )}

          {/* Quick View Button */}
          <Link href={`/products/${product.id}`}>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute right-3 bottom-3 w-10 h-10 rounded-full bg-[#020617]/80 backdrop-blur-sm border border-[#00bfff]/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <Eye className="w-4 h-4 text-[#00bfff]" />
            </motion.button>
          </Link>

          {/* Glow Effect on Hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#00bfff]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="flex-1">
              <h3 className="line-clamp-2 font-semibold text-white group-hover:text-[#00e5ff] transition-colors">
                {product.name}
              </h3>
              <p className="mt-1 line-clamp-2 text-sm text-[#d6e4ff]/70">{product.description}</p>
            </div>
            <div className="flex shrink-0 items-center rounded-lg bg-[#00bfff]/10 border border-[#00bfff]/20 px-2 py-1">
              <Star className="mr-1 h-3 w-3 fill-[#00bfff] text-[#00bfff]" />
              <span className="text-xs font-semibold text-[#00e5ff]">{product.rating.toFixed(1)}</span>
            </div>
          </div>

          <div className="mb-4 flex flex-wrap items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{formatCurrency(salePrice)}</span>
            {hasDiscount && (
              <span className="text-sm text-[#d6e4ff]/50 line-through">{formatCurrency(product.price)}</span>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            disabled={product.stock <= 0}
            onClick={() => {
              addItem(product);
              toast.success('Added to cart');
            }}
            className="tech-btn-primary flex w-full items-center justify-center gap-2 px-4 py-3 text-sm disabled:opacity-50"
          >
            <ShoppingCart className="h-4 w-4" />
            {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
          </motion.button>
        </div>

        {/* Decorative Corner */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-[#00bfff]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-bl-2xl" />
      </div>
    </motion.article>
  );
}
