'use client';

import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  left: number;
  top: number;
  size: number;
  duration: number;
  delay: number;
}

function buildParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, id) => ({
    id,
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: Math.random() * 2 + 1.5,
    duration: 6 + Math.random() * 8,
    delay: Math.random() * 6,
  }));
}

export default function TechParticles() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 768;
    const count = reducedMotion ? 12 : isMobile ? 20 : 32;

    setEnabled(!reducedMotion);
    queueMicrotask(() => setParticles(buildParticles(count)));
  }, []);

  if (particles.length === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      {particles.map((particle) => (
        <span
          key={particle.id}
          className={`absolute rounded-full bg-blue-300/40 shadow-[0_0_6px_rgba(96,165,250,0.35)] ${enabled ? 'tech-particle' : 'opacity-20'}`}
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            width: particle.size,
            height: particle.size,
            ['--tech-duration' as string]: `${particle.duration}s`,
            ['--tech-delay' as string]: `${particle.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
