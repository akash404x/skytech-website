import Image from 'next/image';
import { getServiceIcon, getServiceIconGradient } from '@/lib/service-icons';
import type { Service } from '@/lib/types';

interface ServiceCardProps {
  service: Service;
  compact?: boolean;
}

export default function ServiceCard({ service, compact = false }: ServiceCardProps) {
  const Icon = getServiceIcon(service.icon);
  const gradient = getServiceIconGradient(service.icon);

  return (
    <article className="tech-glass-card overflow-hidden p-5 transition hover:border-blue-400/30 hover:shadow-blue-500/10">
      {service.image && !compact && (
        <div className="relative -mx-5 -mt-5 mb-4 h-32 overflow-hidden border-b border-white/10">
          <Image src={service.image} alt={service.title} fill className="object-cover" sizes="400px" />
        </div>
      )}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg shadow-blue-500/20`}>
          <Icon className="h-6 w-6" />
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            service.status === 'active' ? 'bg-green-500/20 text-green-300' : 'bg-slate-500/20 text-slate-400'
          }`}
        >
          {service.status}
        </span>
      </div>
      <span className="text-xs font-medium uppercase tracking-wide text-cyan-300/80">{service.category}</span>
      <h3 className="mt-1 text-lg font-bold text-white">{service.title}</h3>
      <p className={`mt-2 text-sm tech-muted ${compact ? 'line-clamp-2' : 'line-clamp-3'}`}>{service.description}</p>
    </article>
  );
}
