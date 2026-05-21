'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import ProductImage from '@/components/ProductImage';

interface ProductGalleryProps {
  images: string[];
  alt: string;
}

export default function ProductGallery({ images, alt }: ProductGalleryProps) {
  const galleryImages = images.length > 0 ? images : [''];
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSrc = galleryImages[activeIndex];

  return (
    <div className="space-y-4">
      <div className="product-gallery-main relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-slate-800/50">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSrc || activeIndex}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="absolute inset-0"
          >
            <ProductImage src={activeSrc || undefined} alt={alt} priority className="transition-transform duration-500 hover:scale-105" />
          </motion.div>
        </AnimatePresence>
      </div>

      {galleryImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {galleryImages.map((src, index) => (
            <button
              key={`${src}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-300 ${
                index === activeIndex
                  ? 'border-cyan-400 shadow-[0_0_16px_rgba(34,211,238,0.35)]'
                  : 'border-white/10 opacity-70 hover:border-white/25 hover:opacity-100'
              }`}
            >
              <ProductImage src={src || undefined} alt={`${alt} ${index + 1}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
