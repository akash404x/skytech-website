'use client';

import { doc, getDoc, getDocs, query, collection, orderBy, limit } from 'firebase/firestore';
import { useParams, useRouter } from 'next/navigation';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import ProductImage from '@/components/ProductImage';
import { db } from '@/lib/firebase';
import { mapWork } from '@/lib/firestore-mappers';
import { formatDate } from '@/lib/format';
import type { Work } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, Calendar, User, Tag, ArrowLeft, AlertCircle, Video, Link as LinkIcon } from 'lucide-react';

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
        <div className="mb-4 h-8 w-32 animate-pulse rounded bg-slate-700" />
        <div className="mb-4 h-12 w-3/4 animate-pulse rounded bg-slate-700" />
        <div className="mb-8 h-6 w-1/2 animate-pulse rounded bg-slate-700" />
        <div className="mb-8 aspect-video w-full animate-pulse rounded-2xl bg-slate-700" />
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <div className="h-64 animate-pulse rounded-2xl bg-slate-700" />
            <div className="h-32 animate-pulse rounded-2xl bg-slate-700" />
          </div>
          <div className="space-y-6">
            <div className="h-40 animate-pulse rounded-2xl bg-slate-700" />
            <div className="h-32 animate-pulse rounded-2xl bg-slate-700" />
          </div>
        </div>
      </div>
    </section>
  );
}

function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <section className="relative overflow-hidden py-12 md:py-20">
      <div className="tech-section-backdrop" aria-hidden />
      <div className="relative z-[1] mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="tech-glass-panel rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center">
          <AlertCircle className="mx-auto mb-4 h-16 w-16 text-red-400" />
          <h2 className="mb-2 text-2xl font-bold text-white">Error Loading Project</h2>
          <p className="mb-6 text-slate-300">{error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="rounded-lg bg-cyan-500 px-6 py-3 text-white transition hover:bg-cyan-600"
          >
            Try Again
          </button>
        </div>
      </div>
    </section>
  );
}

function NotFoundState() {
  const router = useRouter();
  
  return (
    <section className="relative overflow-hidden py-12 md:py-20">
      <div className="tech-section-backdrop" aria-hidden />
      <div className="relative z-[1] mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="tech-glass-panel rounded-2xl border border-white/10 p-8 text-center">
          <AlertCircle className="mx-auto mb-4 h-16 w-16 text-slate-400" />
          <h2 className="mb-2 text-2xl font-bold text-white">Project Not Found</h2>
          <p className="mb-6 text-slate-300">The project you're looking for doesn't exist or is not available.</p>
          <button
            type="button"
            onClick={() => router.push('/works')}
            className="rounded-lg bg-cyan-500 px-6 py-3 text-white transition hover:bg-cyan-600"
          >
            <ArrowLeft className="mr-2 inline h-4 w-4" />
            Back to Projects
          </button>
        </div>
      </div>
    </section>
  );
}

export default function WorkPage() {
  const params = useParams();
  const router = useRouter();
  const [work, setWork] = useState<Work | null>(null);
  const [relatedWorks, setRelatedWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const id = params.id as string;

  const fetchWork = async () => {
    if (!id) {
      console.error('No work ID provided');
      setError('Invalid project ID');
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching work with ID:', id);
      setLoading(true);
      setError(null);
      
      const docRef = doc(db, 'works', id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        console.error('Work document does not exist:', id);
        setError('Project not found');
        setLoading(false);
        return;
      }
      
      const workData = docSnap.data();
      console.log('Raw work data:', workData);
      
      const mappedWork = mapWork(docSnap.id, workData);
      console.log('Mapped work:', mappedWork);
      console.log('Loaded links:', mappedWork.links);
      
      if (mappedWork.status !== 'active') {
        console.error('Work is not active:', mappedWork.status);
        setError('Project is not available');
        setLoading(false);
        return;
      }
      
      setWork(mappedWork);
      
      // Fetch related works (same category, excluding current work)
      try {
        const relatedQuery = query(
          collection(db, 'works'),
          orderBy('title'),
          limit(6)
        );
        const relatedSnapshot = await getDocs(relatedQuery);
        const allWorks = relatedSnapshot.docs.map((doc) => {
          try {
            return mapWork(doc.id, doc.data());
          } catch (err) {
            console.error('Error mapping related work:', doc.id, err);
            return null;
          }
        }).filter((w): w is Work => w !== null);
        
        const filteredRelatedWorks = allWorks
          .filter((w) => w.id !== id && w.status === 'active' && w.category === mappedWork.category)
          .slice(0, 3);
        
        console.log('Related works:', filteredRelatedWorks);
        setRelatedWorks(filteredRelatedWorks);
      } catch (relatedError) {
        console.error('Error fetching related works:', relatedError);
        // Don't fail the main page if related works fail
        setRelatedWorks([]);
      }
    } catch (err) {
      console.error('Error fetching work:', err);
      setError('Failed to load project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWork();
  }, [id]);

  const nextImage = () => {
    if (!work) return;
    const allImages = work.images || [];
    if (allImages.length === 0) return;
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };
  
  const prevImage = () => {
    if (!work) return;
    const allImages = work.images || [];
    if (allImages.length === 0) return;
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  if (loading) {
    return (
      <div className="tech-page flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
          <LoadingSkeleton />
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="tech-page flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
          <ErrorState error={error} onRetry={fetchWork} />
        </main>
        <Footer />
      </div>
    );
  }

  if (!work) {
    return (
      <div className="tech-page flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
          <NotFoundState />
        </main>
        <Footer />
      </div>
    );
  }

  // Handle backward compatibility: use media array if available, otherwise use images array
  const allMedia = work.media && work.media.length > 0 
    ? work.media 
    : (work.images || []).map((url) => ({ type: 'image' as const, url }));
  
  const displayMedia = allMedia[currentImageIndex] || (work.thumbnail ? { type: 'image' as const, url: work.thumbnail } : null);

  // Handle backward compatibility: convert old githubLink and liveDemoLink to links array
  const displayLinks = work.links && work.links.length > 0
    ? work.links
    : [
        ...(work.githubLink ? [{ text: 'GitHub Repository', url: work.githubLink }] : []),
        ...(work.liveDemoLink ? [{ text: 'Live Demo', url: work.liveDemoLink }] : []),
      ];

  return (
    <div className="tech-page flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="relative overflow-hidden py-12 md:py-20">
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
            {/* Back Button */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              type="button"
              onClick={() => router.push('/works')}
              className="mb-6 flex items-center gap-2 text-cyan-300 transition hover:text-cyan-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Projects
            </motion.button>

            {/* Header Section */}
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] as const }}
              className="mb-8"
            >
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-sm font-medium text-cyan-300 backdrop-blur-sm"
              >
                <Tag className="h-4 w-4" />
                {work.category || 'Uncategorized'}
              </motion.span>
              <h1 className="tech-heading-gradient text-3xl font-bold md:text-4xl lg:text-5xl">
                {work.title || 'Untitled Project'}
              </h1>
              <p className="mt-4 text-lg tech-text">{work.shortDescription || 'No description available'}</p>
            </motion.div>
            
            {/* Hero Media Gallery */}
            {displayMedia && (
              <motion.div
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.2, ease: [0.22, 1, 0.36, 1] as const }}
                className="relative mb-8 aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-800/50"
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
                    {displayMedia.type === 'video' ? (
                      <video
                        src={displayMedia.url}
                        className="h-full w-full object-cover"
                        controls
                        autoPlay
                        muted
                        loop
                      />
                    ) : (
                      <ProductImage src={displayMedia.url} alt={`${work.title} - Media ${currentImageIndex + 1}`} />
                    )}
                  </motion.div>
                </AnimatePresence>
                
                {allMedia.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition hover:bg-black/70"
                      aria-label="Previous media"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      type="button"
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition hover:bg-black/70"
                      aria-label="Next media"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {allMedia.map((media, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setCurrentImageIndex(index)}
                          className={`h-2 w-2 rounded-full transition ${
                            index === currentImageIndex ? 'bg-cyan-400' : 'bg-white/50'
                          }`}
                          aria-label={`Go to media ${index + 1}`}
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
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.65, delay: 0.3, ease: [0.22, 1, 0.36, 1] as const }}
                  className="tech-glass-panel rounded-2xl border border-white/10 p-6 md:p-8"
                >
                  <h2 className="mb-4 text-2xl font-bold text-white">Project Overview</h2>
                  <p className="whitespace-pre-wrap text-slate-300 leading-relaxed">
                    {work.fullDescription || work.shortDescription || 'No description available.'}
                  </p>
                </motion.div>
                
                {/* Technologies Used */}
                {work.technologiesUsed && work.technologiesUsed.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 32 }}
                    animate={{ opacity: 1, y: 0 }}
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
                {allMedia.length > 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 32 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.65, delay: 0.5, ease: [0.22, 1, 0.36, 1] as const }}
                  >
                    <h2 className="mb-4 text-2xl font-bold text-white">Project Gallery</h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {allMedia.map((media, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 + index * 0.05 }}
                          whileHover={{ scale: 1.02 }}
                          onClick={() => setCurrentImageIndex(index)}
                          className="relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-slate-800/50 cursor-pointer transition"
                        >
                          {media.type === 'video' ? (
                            <video
                              src={media.url}
                              className="h-full w-full object-cover"
                              muted
                            />
                          ) : (
                            <ProductImage src={media.url} alt={`${work.title} - Media ${index + 1}`} />
                          )}
                          <div className="absolute inset-0 bg-black/0 transition hover:bg-black/20" />
                          {media.type === 'video' && (
                            <div className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-1">
                              <Video className="h-3 w-3 text-white" />
                            </div>
                          )}
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
                  animate={{ opacity: 1, x: 0 }}
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
                    <p className="text-sm text-slate-400">Status</p>
                    <p className="font-medium text-white capitalize">{work.status || 'Unknown'}</p>
                  </motion.div>
                </motion.div>
                
                {/* Links */}
                {displayLinks.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: 32 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.65, delay: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
                    className="tech-glass-panel rounded-2xl border border-white/10 p-6"
                  >
                    <h3 className="mb-4 text-lg font-semibold text-white">Links</h3>
                    <div className="space-y-3">
                      {displayLinks.map((link, index) => (
                        <motion.a
                          key={index}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-cyan-300 transition hover:bg-cyan-500/20"
                        >
                          <LinkIcon className="h-5 w-5" />
                          <span>{link.text}</span>
                          <ExternalLink className="ml-auto h-4 w-4" />
                        </motion.a>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
