'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect } from 'react';

interface LogoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LogoModal({ isOpen, onClose }: LogoModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl"
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative max-w-2xl w-full">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute -top-12 right-0 flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="tech-glass-card p-8 md:p-12 text-center">
                {/* Logo */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
                  className="mb-8 relative inline-block"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#00bfff] to-[#00e5ff] blur-3xl opacity-30 animate-pulse" />
                  <img
                    src="/favicon.ico"
                    alt="Sky Tech Logo"
                    className="relative w-48 h-48 md:w-64 md:h-64 object-contain mx-auto"
                  />
                </motion.div>

                {/* Company Name */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="text-4xl md:text-5xl font-bold text-white mb-4"
                >
                  Sky Tech
                </motion.h1>

                {/* Tagline */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="text-xl md:text-2xl text-[#00e5ff] font-medium"
                >
                  Building the Future Through Technology
                </motion.p>

                {/* Decorative Line */}
                <motion.div
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="mt-8 h-px w-32 mx-auto bg-gradient-to-r from-transparent via-[#00bfff] to-transparent"
                />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
