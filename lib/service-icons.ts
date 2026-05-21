import {
  Bot,
  Briefcase,
  CircuitBoard,
  Code,
  Cpu,
  GraduationCap,
  Home,
  MessageSquare,
  Wrench,
  type LucideIcon,
} from 'lucide-react';

export const SERVICE_ICON_OPTIONS = [
  { key: 'cpu', label: 'IoT', icon: Cpu },
  { key: 'code', label: 'Code', icon: Code },
  { key: 'bot', label: 'Robotics', icon: Bot },
  { key: 'circuit', label: 'PCB', icon: CircuitBoard },
  { key: 'home', label: 'Smart Home', icon: Home },
  { key: 'wrench', label: 'Embedded', icon: Wrench },
  { key: 'graduation', label: 'Education', icon: GraduationCap },
  { key: 'briefcase', label: 'Business', icon: Briefcase },
  { key: 'message', label: 'Consulting', icon: MessageSquare },
] as const;

export function getServiceIcon(key: string): LucideIcon {
  return SERVICE_ICON_OPTIONS.find((option) => option.key === key)?.icon ?? Wrench;
}
