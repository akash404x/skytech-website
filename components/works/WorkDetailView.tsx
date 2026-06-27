'use client';

import ProductImage from '@/components/ProductImage';
import WorkCard from '@/components/WorkCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDate } from '@/lib/format';
import type { Work } from '@/lib/types';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, Calendar, User, Tag } from 'lucide-react';

interface WorkDetailViewProps {
  work: Work;
  relatedWorks: Work[];
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  );
}

function LoadingSkeleton() {
  return (
    <section className="relative overflow-hidden py-12 md:py-20">
      <div className="tech-section-backdrop" aria-hidden />
      <div className="relative z-[1] mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Skeleton className="mb-4 h-8 w-32" />
        <Skeleton className="mb-4 h-12 w-3/4" />
        <Skeleton className="mb-8 h-6 w-1/2" />
        <Skeleton className="mb-8 aspect-video w-full" />
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <Skeleton className="h-64" />
            <Skeleton className="h-32" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-40" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default function WorkDetailView({ work, relatedWorks }: WorkDetailViewProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const galleryImages = work.images || [];
  const allImages = work.thumbnail ? [work.thumbnail, ...galleryImages.filter(img => img !== work.thumbnail)] : galleryImages;

  const nextImage = () => {
    console.log('Next button clicked, current index:', currentImageIndex, 'total images:', allImages.length);
    setCurrentImageIndex((prev) => {
      const newIndex = (prev + 1) % allImages.length;
      console.log('New index:', newIndex);
      return newIndex;
    });
  };

  const prevImage = () => {
    console.log('Previous button clicked, current index:', currentImageIndex, 'total images:', allImages.length);
    setCurrentImageIndex((prev) => {
      const newIndex = (prev - 1 + allImages.length) % allImages.length;
      console.log('New index:', newIndex);
      return newIndex;
    });
  };

  const goToImage = (index: number) => {
    console.log('Dot indicator clicked, going to index:', index);
    setCurrentImageIndex(index);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (allImages.length <= 1) return;
      if (e.key === 'ArrowLeft') {
        prevImage();
      } else if (e.key === 'ArrowRight') {
        nextImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [allImages.length]);

  // Swipe support for mobile
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextImage();
    } else if (isRightSwipe) {
      prevImage();
    }
  };

  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 });

  return (
    <section ref={sectionRef} className="relative overflow-hidden py-12 md:py-20">
      {/* Background Effects */}
      <div className="work-detail-bg pointer-events-none absolute inset-0" aria-hidden>
        <div className="work-detail-grid absolute inset-0" />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 48, repeat: Infinity, ease: 'linear' }}
          className="work-detail-glow-a absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-blue-600/15 blur-3xl"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 56, repeat: Infinity, ease: 'linear' }}
          className="work-detail-glow-b absolute -right-24 bottom-1/4 h-80 w-80 rounded-full bg-purple-600/12 blur-3xl"
        />
      </div>
      
      <div className="tech-section-backdrop" aria-hidden />
      
      <div className="relative z-[1] mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] as const }}
          className="mb-8"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.1 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-sm font-medium text-cyan-300 backdrop-blur-sm"
          >
            <Tag className="h-4 w-4" />
            {work.category}
          </motion.span>
          <h1 className="tech-heading-gradient text-3xl font-bold md:text-4xl lg:text-5xl">
            {work.title}
          </h1>
          <p className="mt-4 text-lg tech-text">{work.shortDescription}</p>
        </motion.div>
        
        {/* Hero Image Gallery */}
        {allImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.65, delay: 0.2, ease: [0.22, 1, 0.36, 1] as const }}
            className="relative mb-8 aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-800/50"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentImageIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="h-full w-full"
              >
                <ProductImage src={allImages[currentImageIndex]} alt={`${work.title} - Image ${currentImageIndex + 1}`} />
              </motion.div>
            </AnimatePresence>

            {allImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Previous button clicked directly');
                    prevImage();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition hover:bg-black/70 hover:scale-110 active:scale-95"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Next button clicked directly');
                    nextImage();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition hover:bg-black/70 hover:scale-110 active:scale-95"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
                  {allImages.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        goToImage(index);
                      }}
                      className={`h-2 w-2 rounded-full transition hover:scale-125 ${
                        index === currentImageIndex ? 'bg-cyan-400 scale-125' : 'bg-white/50 hover:bg-white/70'
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}
        
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Project Overview */}
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.65, delay: 0.3, ease: [0.22, 1, 0.36, 1] as const }}
              className="tech-glass-panel rounded-2xl border border-white/10 p-6 md:p-8"
            >
              <h2 className="mb-4 text-2xl font-bold text-white">Project Overview</h2>
              <p className="whitespace-pre-wrap text-slate-300 leading-relaxed">{work.fullDescription}</p>
            </motion.div>
            
            {/* Technologies Used */}
            {work.technologiesUsed && work.technologiesUsed.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 32 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.65, delay: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
                className="tech-glass-panel rounded-2xl border border-white/10 p-6 md:p-8"
              >
                <h3 className="mb-4 text-lg font-semibold text-white">Technologies Used</h3>
                <div className="flex flex-wrap gap-2">
                  {work.technologiesUsed.map((tech, index) => (
                    <motion.span
                      key={tech}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + index * 0.05 }}
                      whileHover={{ scale: 1.05, rotate: 2 }}
                      className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-sm text-cyan-300 cursor-default transition"
                    >
                      {tech}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}
            
            {/* Project Gallery Grid */}
            {allImages.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 32 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.65, delay: 0.5, ease: [0.22, 1, 0.36, 1] as const }}
              >
                <h2 className="mb-4 text-2xl font-bold text-white">Project Gallery</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {allImages.map((image, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => goToImage(index)}
                      className="relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-slate-800/50 cursor-pointer transition"
                    >
                      <ProductImage src={image} alt={`${work.title} - Image ${index + 1}`} />
                      <div className="absolute inset-0 bg-black/0 transition hover:bg-black/20" />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Details */}
            <motion.div
              initial={{ opacity: 0, x: 32 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.65, delay: 0.3, ease: [0.22, 1, 0.36, 1] as const }}
              className="tech-glass-panel rounded-2xl border border-white/10 p-6"
            >
              <h3 className="mb-4 text-lg font-semibold text-white">Project Details</h3>
              
              {work.clientName && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                  className="mb-4"
                >
                  <p className="text-sm text-slate-400">Client</p>
                  <p className="font-medium text-white flex items-center gap-2">
                    <User className="h-4 w-4 text-cyan-400" />
                    {work.clientName}
                  </p>
                </motion.div>
              )}
              
              {work.completionDate && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mb-4"
                >
                  <p className="text-sm text-slate-400">Completed</p>
                  <p className="font-medium text-white flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-cyan-400" />
                    {formatDate(work.completionDate)}
                  </p>
                </motion.div>
              )}
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
              >
                <p className="text-sm text-slate-400">Category</p>
                <p className="font-medium text-white">{work.category}</p>
              </motion.div>
            </motion.div>
            
            {/* Links */}
            {(work.githubLink || work.liveDemoLink) && (
              <motion.div
                initial={{ opacity: 0, x: 32 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.65, delay: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
                className="tech-glass-panel rounded-2xl border border-white/10 p-6"
              >
                <h3 className="mb-4 text-lg font-semibold text-white">Links</h3>
                <div className="space-y-3">
                  {work.githubLink && (
                    <motion.a
                      href={work.githubLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-cyan-300 transition hover:bg-cyan-500/20"
                    >
                      <GithubIcon className="h-5 w-5" />
                      <span>View on GitHub</span>
                      <ExternalLink className="ml-auto h-4 w-4" />
                    </motion.a>
                  )}
                  {work.liveDemoLink && (
                    <motion.a
                      href={work.liveDemoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-2 rounded-lg border border-purple-500/30 bg-purple-500/10 px-4 py-3 text-purple-300 transition hover:bg-purple-500/20"
                    >
                      <ExternalLink className="h-5 w-5" />
                      <span>Live Demo</span>
                      <ExternalLink className="ml-auto h-4 w-4" />
                    </motion.a>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
        
        {/* Related Projects */}
        {relatedWorks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.65, delay: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
            className="mt-16"
          >
            <h2 className="mb-8 text-2xl font-bold text-white">Related Projects</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedWorks.map((relatedWork, index) => (
                <motion.div
                  key={relatedWork.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="h-full"
                >
                  <WorkCard work={relatedWork} index={index} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
