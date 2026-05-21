import { Bot, Briefcase, CheckCircle, CircuitBoard, Code, Cpu, GraduationCap, Home, MessageSquare, Wrench } from 'lucide-react';
import type { Service } from '@/lib/types';

interface ServiceCardProps {
  service: Service;
  compact?: boolean;
}

function ServiceIcon({ iconKey }: { iconKey: string }) {
  const className = 'h-6 w-6';

  switch (iconKey) {
    case 'cpu':
      return <Cpu className={className} />;
    case 'code':
      return <Code className={className} />;
    case 'bot':
      return <Bot className={className} />;
    case 'circuit':
      return <CircuitBoard className={className} />;
    case 'home':
      return <Home className={className} />;
    case 'graduation':
      return <GraduationCap className={className} />;
    case 'briefcase':
      return <Briefcase className={className} />;
    case 'message':
      return <MessageSquare className={className} />;
    default:
      return <Wrench className={className} />;
  }
}

export default function ServiceCard({ service, compact = false }: ServiceCardProps) {
  return (
    <article className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="rounded-lg bg-blue-600 p-3 text-white">
          <ServiceIcon iconKey={service.iconKey} />
        </div>
        {service.featured && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
            Featured
          </span>
        )}
      </div>
      <h3 className="text-lg font-bold text-gray-900">{service.title}</h3>
      <p className="mt-2 line-clamp-3 text-sm text-gray-600">{service.description}</p>
      <p className="mt-4 font-semibold text-blue-700">{service.priceLabel}</p>
      {!compact && service.features.length > 0 && (
        <ul className="mt-4 space-y-2">
          {service.features.slice(0, 4).map((feature) => (
            <li key={feature} className="flex items-center text-sm text-gray-700">
              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
              {feature}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
