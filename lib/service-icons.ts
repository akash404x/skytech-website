import {
  Bot,
  Briefcase,
  CircuitBoard,
  Code,
  Cpu,
  Globe,
  GraduationCap,
  Home,
  Image,
  Layers,
  MessageSquare,
  Mic,
  Package,
  Settings,
  Smartphone,
  Video,
  Wrench,
  type LucideIcon,
} from 'lucide-react';

export const SERVICE_ICON_OPTIONS = [
  { key: 'cpu', label: 'Arduino / IoT', icon: Cpu, gradient: 'from-blue-500 to-cyan-500' },
  { key: 'code', label: 'Development', icon: Code, gradient: 'from-indigo-500 to-violet-500' },
  { key: 'bot', label: 'Robotics', icon: Bot, gradient: 'from-purple-500 to-pink-500' },
  { key: 'circuit', label: 'PCB / Circuit', icon: CircuitBoard, gradient: 'from-indigo-500 to-blue-500' },
  { key: 'home', label: 'Smart Home', icon: Home, gradient: 'from-teal-500 to-cyan-500' },
  { key: 'wrench', label: 'Hardware', icon: Wrench, gradient: 'from-slate-500 to-blue-500' },
  { key: 'graduation', label: 'Training', icon: GraduationCap, gradient: 'from-amber-500 to-orange-500' },
  { key: 'briefcase', label: 'Consulting', icon: Briefcase, gradient: 'from-violet-500 to-purple-500' },
  { key: 'message', label: 'Support', icon: MessageSquare, gradient: 'from-blue-600 to-indigo-600' },
  { key: 'globe', label: 'Web', icon: Globe, gradient: 'from-emerald-500 to-cyan-500' },
  { key: 'smartphone', label: 'Mobile App', icon: Smartphone, gradient: 'from-fuchsia-500 to-violet-500' },
  { key: 'image', label: 'Photo', icon: Image, gradient: 'from-rose-500 to-orange-500' },
  { key: 'video', label: 'Video', icon: Video, gradient: 'from-red-500 to-pink-500' },
  { key: 'settings', label: 'Setup', icon: Settings, gradient: 'from-sky-500 to-blue-500' },
  { key: 'layers', label: 'Custom', icon: Layers, gradient: 'from-blue-600 to-indigo-600' },
  { key: 'package', label: 'Components', icon: Package, gradient: 'from-lime-500 to-green-500' },
  { key: 'mic', label: 'AI / Voice', icon: Mic, gradient: 'from-teal-500 to-emerald-500' },
] as const;

export type ServiceIconKey = (typeof SERVICE_ICON_OPTIONS)[number]['key'];

export function getServiceIcon(key: string): LucideIcon {
  return SERVICE_ICON_OPTIONS.find((option) => option.key === key)?.icon ?? Wrench;
}

export function getServiceIconGradient(key: string): string {
  return SERVICE_ICON_OPTIONS.find((option) => option.key === key)?.gradient ?? 'from-blue-500 to-cyan-500';
}
