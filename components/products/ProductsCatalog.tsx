'use client';

import { motion } from 'framer-motion';
import { Package, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import EmptyState from '@/components/EmptyState';
import PremiumProductCard from '@/components/products/PremiumProductCard';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { useProducts } from '@/hooks/useProducts';
import {
  PRODUCT_FILTER_CHIPS,
  matchesProductFilter,
  type ProductFilterId,
} from '@/lib/products-content';

export default function ProductsCatalog() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('q') ?? searchParams.get('search') ?? '';
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [activeFilter, setActiveFilter] = useState<ProductFilterId>('all');
  const { products, loading, error } = useProducts({ activeOnly: true });

  const filteredProducts = useMemo(() => {
    const search = searchQuery.trim().toLowerCase();
    return products.filter((product) => {
      const matchesFilter = matchesProductFilter(product.category, activeFilter);
      const matchesSearch =
        !search ||
        product.name.toLowerCase().includes(search) ||
        product.description.toLowerCase().includes(search) ||
        product.category.toLowerCase().includes(search);
      return matchesFilter && matchesSearch;
    });
  }, [products, activeFilter, searchQuery]);

  return (
    <section className="products-catalog relative pb-20 md:pb-28">
      <div className="tech-section-backdrop" aria-hidden />
      <div className="relative z-[1] mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="relative mx-auto max-w-xl">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by name, category..."
              className="products-search-input w-full rounded-xl py-3.5 pl-12 pr-4"
            />
          </div>
        </motion.div>

        <motion.div
          layout
          className="mb-10 flex flex-wrap justify-center gap-2 md:gap-3"
        >
          {PRODUCT_FILTER_CHIPS.map((chip) => {
            const isActive = activeFilter === chip.id;
            return (
              <motion.button
                key={chip.id}
                type="button"
                layout
                onClick={() => setActiveFilter(chip.id)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30'
                    : 'border border-white/10 bg-white/5 text-slate-300 hover:border-blue-400/30 hover:bg-blue-500/10 hover:text-white'
                }`}
              >
                {chip.label}
              </motion.button>
            );
          })}
        </motion.div>

        <p className="mb-6 text-center text-sm tech-muted">
          {loading ? 'Loading products...' : `${filteredProducts.length} product${filteredProducts.length === 1 ? '' : 's'} found`}
        </p>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        ) : error ? (
          <EmptyState icon={Package} title="Unable to load products" description={error} />
        ) : filteredProducts.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No products found"
            description="Try a different search or filter, or check back when new inventory is added in admin."
          />
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {filteredProducts.map((product, index) => (
              <PremiumProductCard key={product.id} product={product} index={index} />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
