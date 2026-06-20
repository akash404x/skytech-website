'use client';

import ProductImage from '@/components/ProductImage';
import { useRouter } from 'next/navigation';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Calendar, ExternalLink, Star, Video, Link as LinkIcon } from 'lucide-react';
import { useRef } from 'react';
import { formatDate } from '@/lib/format';
import type { Work } from '@/lib/types';

interface WorkCardProps {
  work: Work;
  index: number;
  priority?: boolean;
}

function BriefcaseIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

export default function WorkCard({ work, index, priority = false }: WorkCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const isInView = useInView(ref, { once: true, amount: 0.15 });

  const handleCardClick = () => {
    router.push(`/works/${work.id}`);
  };

  // Determine if thumbnail is a video by checking media array or file extension
  const isVideoThumbnail = (() => {
    if (work.media && work.media.length > 0) {
      const firstMedia = work.media[0];
      return firstMedia.type === 'video';
    }
    if (work.thumbnail) {
      return work.thumbnail.match(/\.(mp4|mov|webm|ogg)$/i) !== null;
    }
    return false;
  })();

  // Handle backward compatibility: convert old githubLink and liveDemoLink to links array
  const displayLinks = work.links && work.links.length > 0
    ? work.links
    : [
        ...(work.githubLink ? [{ text: 'GitHub', url: work.githubLink }] : []),
        ...(work.liveDemoLink ? [{ text: 'Live Demo', url: work.liveDemoLink }] : []),
      ];

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] as const }}
      style={{ perspective: 1200 }}
      className="work-card-3d group relative rounded-2xl bg-gradient-to-br from-blue-500/35 via-purple-500/25 to-cyan-500/35 p-[1px] transition-shadow duration-500 hover:shadow-[0_0_32px_rgba(59,130,246,0.2)] cursor-pointer"
      onClick={handleCardClick}
    >
      <motion.div
        className="work-card-inner relative flex h-full flex-col rounded-[15px] p-6 md:p-7"
        whileHover={{ y: -10, rotateX: 6, rotateY: -6, scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {work.thumbnail ? (
          <div className="relative mb-5 h-48 w-full overflow-hidden rounded-xl border border-white/10 bg-slate-800/50">
            {isVideoThumbnail ? (
              <video
                src={work.thumbnail}
                className="h-full w-full object-cover"
                muted
                loop
                autoPlay
                playsInline
              />
            ) : (
              <ProductImage src={work.thumbnail} alt={work.title} />
            )}
            {work.featured && (
              <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2 py-1 text-xs font-semibold text-white shadow-lg shadow-amber-500/30 animate-pulse">
                <Star className="h-3 w-3 fill-current" />
              </div>
            )}
            {isVideoThumbnail && (
              <div className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-1">
                <Video className="h-3 w-3 text-white" />
              </div>
            )}
          </div>
        ) : (
          <div className="relative mb-5 h-48 w-full overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
                <BriefcaseIcon className="h-8 w-8 text-cyan-300" />
              </div>
              <p className="text-sm text-slate-400">No image</p>
            </div>
          </div>
        )}

        <span className="mb-2 inline-flex w-fit rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-medium text-cyan-300/90">
          {work.category}
        </span>

        <h3 className="mb-2 text-lg font-bold text-white transition-colors duration-300 group-hover:text-blue-200 md:text-xl">
          {work.title}
        </h3>
        <p className="flex-1 text-sm leading-relaxed tech-muted md:text-[0.9375rem] line-clamp-2">{work.shortDescription}</p>

        {work.technologiesUsed && work.technologiesUsed.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {work.technologiesUsed.slice(0, 3).map((tech) => (
              <span key={tech} className="inline-flex items-center rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 text-xs text-cyan-300">
                {tech}
              </span>
            ))}
            {work.technologiesUsed.length > 3 && (
              <span className="inline-flex items-center rounded-full border border-slate-500/20 bg-slate-500/10 px-2 py-0.5 text-xs text-slate-400">
                +{work.technologiesUsed.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="mt-5 flex items-center justify-between">
          {work.completionDate && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formatDate(work.completionDate)}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            {displayLinks.slice(0, 2).map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-900/70 hover:text-white"
                aria-label={link.text}
              >
                <LinkIcon className="h-4 w-4" />
              </a>
            ))}
            <ArrowRight className="h-4 w-4 text-cyan-400 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
          </div>
        </div>

        <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-blue-500/30 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        </motion.div>
      </motion.article>
  );
}
