'use client';

type Variant = 'particles' | 'grid' | 'circuit';

interface HeroSlideEffectsProps {
  variant: Variant;
  active?: boolean;
}

export default function HeroSlideEffects({ variant, active = true }: HeroSlideEffectsProps) {
  if (!active) return null;

  if (variant === 'particles') {
    return (
      <div className="hero-fx-particles pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="hero-fx-gradient-shift absolute inset-0" />
        <div className="hero-fx-glow-pulse absolute left-1/4 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="hero-fx-glow-pulse-delay absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-blue-600/25 blur-3xl" />
        {Array.from({ length: 14 }).map((_, i) => (
          <span
            key={i}
            className="hero-fx-particle-dot absolute rounded-full bg-cyan-400/30"
            style={{
              left: `${8 + (i * 6.5) % 88}%`,
              top: `${12 + (i * 11) % 76}%`,
              width: 2 + (i % 3),
              height: 2 + (i % 3),
              animationDelay: `${i * 0.45}s`,
              animationDuration: `${5 + (i % 4)}s`,
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'grid') {
    return (
      <div className="hero-fx-grid pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="hero-fx-grid-lines absolute inset-0 opacity-40" />
        <div className="hero-fx-orb absolute right-[12%] top-[18%] h-56 w-56 rounded-full bg-purple-500/25 blur-3xl md:h-80 md:w-80" />
        <div className="hero-fx-wave absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-fuchsia-500/10 to-transparent" />
      </div>
    );
  }

  return (
    <div className="hero-fx-circuit pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="hero-fx-circuit-bg absolute inset-0 opacity-50" />
      <div className="hero-fx-circuit-pulse absolute inset-0" />
      {Array.from({ length: 10 }).map((_, i) => (
        <span
          key={i}
          className="hero-fx-neon-dot absolute rounded-full bg-emerald-400/40 shadow-[0_0_8px_rgba(52,211,153,0.35)]"
          style={{
            left: `${10 + (i * 9) % 82}%`,
            top: `${18 + (i * 13) % 70}%`,
            width: 3,
            height: 3,
            animationDelay: `${i * 0.6}s`,
          }}
        />
      ))}
    </div>
  );
}
