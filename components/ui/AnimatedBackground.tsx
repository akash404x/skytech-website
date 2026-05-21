'use client';

import { motion } from 'framer-motion';
import TechParticles from '@/components/ui/TechParticles';

const GRID_PATTERN =
  'linear-gradient(rgba(59,130,246,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.04)_1px,transparent_1px)';

const CIRCUIT_PATTERN =
  "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg stroke='%233b82f6' stroke-opacity='0.06' stroke-width='1'%3E%3Cpath d='M36 34v-4h-4v4h-4v4h4v4h4v-4h4v-4h-4zm0-30V0h-4v4h-4v4h4v4h4V6h4V0h-4zM6 34v-4H2v4H0v4h2v4h4v-4h4v-4H6zM6 4V0H2v4H0v4h2v4h4V6h4V0H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")";

/** Global premium tech background — matches About page atmosphere */
export default function AnimatedBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 tech-gradient-base" />

      <div className="tech-radial-glow-a absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(59,130,246,0.2),transparent_55%)]" />
      <div className="tech-radial-glow-b absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_80%_100%,rgba(147,51,234,0.14),transparent_50%)]" />
      <div className="tech-radial-glow-c absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_20%_80%,rgba(6,182,212,0.1),transparent_45%)]" />

      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.25, 0.4, 0.25] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl will-change-transform"
      />
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.18, 0.32, 0.18] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl will-change-transform"
      />
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute top-1/2 right-1/3 h-80 w-80 rounded-full bg-cyan-500/15 blur-3xl will-change-transform"
      />

      <TechParticles />

      <div
        className="absolute inset-0 opacity-80"
        style={{ backgroundImage: GRID_PATTERN, backgroundSize: '50px 50px' }}
      />
      <div
        className="absolute inset-0 opacity-60"
        style={{ backgroundImage: CIRCUIT_PATTERN, backgroundSize: '60px 60px' }}
      />

      <div className="absolute inset-0 tech-dots-overlay" />

      <motion.div
        animate={{ x: ['-100%', '100%'], opacity: [0, 0.4, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        className="absolute top-1/3 left-0 h-px w-1/2 bg-gradient-to-r from-transparent via-blue-400/60 to-transparent"
      />
      <motion.div
        animate={{ x: ['100%', '-100%'], opacity: [0, 0.25, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear', delay: 2 }}
        className="absolute right-0 bottom-1/3 h-px w-1/2 bg-gradient-to-r from-transparent via-purple-400/50 to-transparent"
      />
    </div>
  );
}
