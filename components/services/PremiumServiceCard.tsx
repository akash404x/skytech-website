'use client';

import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useRef } from 'react';
import { getServiceIcon, getServiceIconGradient } from '@/lib/service-icons';
import type { Service } from '@/lib/types';

interface PremiumServiceCardProps {
  service: Service;
  index: number;
}

export default function PremiumServiceCard({ service, index }: PremiumServiceCardProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.15 });
  const Icon = getServiceIcon(service.icon);
  const gradient = getServiceIconGradient(service.icon);
  const actionText = service.buttonText?.trim() ?? '';
  const actionLink = service.buttonLink?.trim() ?? '';
  const hasAction = Boolean(actionText && actionLink);
  const isInternalLink = actionLink.startsWith('/');

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] as const }}
      style={{ perspective: 1200 }}
      className="service-card-3d group relative rounded-2xl bg-gradient-to-br from-blue-500/35 via-purple-500/25 to-cyan-500/35 p-[1px] transition-shadow duration-500 hover:shadow-[0_0_32px_rgba(59,130,246,0.2)]"
    >
      <motion.div
        className="service-card-inner relative flex h-full flex-col rounded-[15px] p-6 md:p-7"
        whileHover={{ y: -10, rotateX: 6, rotateY: -6, scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {service.featured && (
          <div className="absolute right-4 top-4 z-10">
            <span className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 px-3 py-1 text-xs font-semibold text-white shadow-lg shadow-yellow-500/40">
              <Sparkles className="h-3 w-3 fill-white" />
              Featured
            </span>
          </div>
        )}

        {service.image ? (
          <div className="relative mb-5 h-36 w-full overflow-hidden rounded-xl border border-white/10 bg-slate-800/50">
            <Image src={service.image} alt={service.title} fill className="object-cover" sizes="(max-width:768px) 100vw, 25vw" />
          </div>
        ) : (
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3.5 + (index % 4) * 0.4, repeat: Infinity, ease: 'easeInOut' }}
            className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} shadow-lg shadow-blue-500/20`}
          >
            <Icon className="h-7 w-7 text-white" />
          </motion.div>
        )}

        <span className="mb-2 inline-flex w-fit rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-medium text-cyan-300/90">
          {service.category}
        </span>

        <h3 className="mb-2 text-lg font-bold text-white transition-colors duration-300 group-hover:text-blue-200 md:text-xl">
          {service.title}
        </h3>
        <p className="flex-1 text-sm leading-relaxed tech-muted md:text-[0.9375rem]">{service.description}</p>

        {hasAction ? (
          <motion.a
            href={actionLink}
            target={isInternalLink ? undefined : '_blank'}
            rel={isInternalLink ? undefined : 'noreferrer noopener'}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="mt-6 inline-flex w-full items-center justify-center rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white backdrop-blur-xl shadow-[0_12px_40px_rgba(59,130,246,0.18)] transition duration-300 hover:border-blue-300/40 hover:bg-white/10 hover:shadow-[0_18px_48px_rgba(96,165,250,0.22)]"
          >
            {actionText}
          </motion.a>
        ) : null}

        <div className="mt-5 h-px w-full bg-gradient-to-r from-transparent via-blue-500/30 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </motion.div>
    </motion.article>
  );
}
