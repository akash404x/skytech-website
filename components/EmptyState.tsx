import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export default function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="tech-glass-card flex flex-col items-center justify-center border-dashed px-6 py-12 text-center">
      <div className="mb-4 rounded-full border border-white/10 bg-white/5 p-4 text-blue-300">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-1 max-w-md text-sm tech-muted">{description}</p>
    </div>
  );
}
