'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Building2, 
  Briefcase, 
  FileText, 
  Mail, 
  HelpCircle, 
  Truck, 
  RotateCcw, 
  MessageCircle, 
  Shield, 
  Scale, 
  Cookie,
  PackageSearch,
  BookOpen,
  Send,
  ChevronDown,
  Rocket,
  Sparkles
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const menuSections = [
  {
    title: 'Company',
    icon: Building2,
    color: 'cyan',
    links: [
      { href: '/about', label: 'About Us', icon: Building2 },
      { href: '/careers', label: 'Careers', icon: Briefcase },
      { href: '/blog', label: 'Blog', icon: FileText },
      { href: '/contact', label: 'Contact', icon: Mail },
    ],
  },
  {
    title: 'Support',
    icon: HelpCircle,
    color: 'blue',
    links: [
      { href: '/help-center', label: 'Help Center', icon: HelpCircle },
      { href: '/shipping', label: 'Shipping Policy', icon: Truck },
      { href: '/returns', label: 'Returns & Refunds', icon: RotateCcw },
      { href: '/faq', label: 'FAQ', icon: MessageCircle },
    ],
  },
  {
    title: 'Legal',
    icon: Shield,
    color: 'purple',
    links: [
      { href: '/privacy-policy', label: 'Privacy Policy', icon: Shield },
      { href: '/terms-of-service', label: 'Terms of Service', icon: Scale },
      { href: '/cookie-policy', label: 'Cookie Policy', icon: Cookie },
    ],
  },
  {
    title: 'Extra',
    icon: Sparkles,
    color: 'emerald',
    links: [
      { href: '/orders', label: 'Track Order', icon: PackageSearch },
      { href: '/docs', label: 'Documentation', icon: BookOpen },
      { href: '/contact', label: 'Project Inquiry', icon: Send },
    ],
  },
];

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MegaMenu({ isOpen, onClose }: MegaMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const colorMap = {
    cyan: 'from-cyan-400 to-cyan-600',
    blue: 'from-blue-400 to-blue-600',
    purple: 'from-purple-400 to-purple-600',
    emerald: 'from-emerald-400 to-emerald-600',
  };

  const bgColorMap = {
    cyan: 'bg-cyan-500/10',
    blue: 'bg-blue-500/10',
    purple: 'bg-purple-500/10',
    emerald: 'bg-emerald-500/10',
  };

  const borderColorMap = {
    cyan: 'border-cyan-500/30',
    blue: 'border-blue-500/30',
    purple: 'border-purple-500/30',
    emerald: 'border-emerald-500/30',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Mega Menu */}
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 right-0 top-full z-50 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
          >
            <div className="overflow-hidden rounded-2xl border border-[#00bfff]/30 bg-[#020617]/95 backdrop-blur-xl shadow-[0_0_60px_rgba(0,191,255,0.3)]">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#00bfff]/5 via-transparent to-[#00e5ff]/5" />
              
              <div className="relative p-6 md:p-8">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                  {menuSections.map((section) => (
                    <motion.div
                      key={section.title}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: 0.1 }}
                    >
                      <div className="mb-4 flex items-center gap-2">
                        <div className={`rounded-lg bg-gradient-to-br ${colorMap[section.color as keyof typeof colorMap]} p-2`}>
                          <section.icon className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-white">{section.title}</h3>
                      </div>
                      
                      <div className="space-y-2">
                        {section.links.map((link) => {
                          const LinkIcon = link.icon;
                          const isActive = pathname === link.href;
                          
                          return (
                            <Link
                              key={link.href}
                              href={link.href}
                              onClick={onClose}
                              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 ${
                                isActive 
                                  ? `${bgColorMap[section.color as keyof typeof bgColorMap]} ${borderColorMap[section.color as keyof typeof borderColorMap]} border` 
                                  : 'hover:bg-white/5'
                              }`}
                            >
                              <LinkIcon className={`h-4 w-4 transition-colors ${
                                isActive 
                                  ? `text-[#00e5ff]` 
                                  : 'text-[#d6e4ff]/60 group-hover:text-[#00e5ff]'
                              }`} />
                              <span className={`text-sm font-medium transition-colors ${
                                isActive 
                                  ? 'text-white' 
                                  : 'text-[#d6e4ff]/80 group-hover:text-white'
                              }`}>
                                {link.label}
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Bottom Banner */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="mt-6 rounded-xl border border-[#00bfff]/20 bg-gradient-to-r from-[#00bfff]/10 to-[#00e5ff]/10 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <Rocket className="h-5 w-5 text-[#00e5ff]" />
                      <div>
                        <p className="text-sm font-semibold text-white">Need help getting started?</p>
                        <p className="text-xs text-[#d6e4ff]/70">Explore our documentation and resources</p>
                      </div>
                    </div>
                    <Link
                      href="/help-center"
                      onClick={onClose}
                      className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#00bfff] to-[#00e5ff] px-4 py-2 text-sm font-semibold text-[#020617] transition-all hover:opacity-90 hover:shadow-[0_0_20px_rgba(0,191,255,0.4)]"
                    >
                      Get Started
                      <Sparkles className="h-4 w-4" />
                    </Link>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Mobile Mega Menu Component
export function MobileMegaMenu({ isOpen, onClose }: MegaMenuProps) {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const pathname = usePathname();

  const colorMap = {
    cyan: 'from-cyan-400 to-cyan-600',
    blue: 'from-blue-400 to-blue-600',
    purple: 'from-purple-400 to-purple-600',
    emerald: 'from-emerald-400 to-emerald-600',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden border-t border-white/5 bg-[#020617]/95 backdrop-blur-xl"
        >
          <div className="p-4 space-y-2">
            {menuSections.map((section) => {
              const SectionIcon = section.icon;
              const isSectionOpen = openSection === section.title;
              
              return (
                <div key={section.title}>
                  <button
                    onClick={() => setOpenSection(isSectionOpen ? null : section.title)}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-3 transition-colors hover:bg-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`rounded-lg bg-gradient-to-br ${colorMap[section.color as keyof typeof colorMap]} p-2`}>
                        <SectionIcon className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-semibold text-white">{section.title}</span>
                    </div>
                    <ChevronDown 
                      className={`h-4 w-4 text-[#d6e4ff]/60 transition-transform ${
                        isSectionOpen ? 'rotate-180' : ''
                      }`} 
                    />
                  </button>
                  
                  <AnimatePresence>
                    {isSectionOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="ml-4 mt-2 space-y-1 overflow-hidden"
                      >
                        {section.links.map((link) => {
                          const LinkIcon = link.icon;
                          const isActive = pathname === link.href;
                          
                          return (
                            <Link
                              key={link.href}
                              href={link.href}
                              onClick={() => {
                                onClose();
                                setOpenSection(null);
                              }}
                              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                                isActive ? 'bg-[#00bfff]/10 text-[#00e5ff]' : 'text-[#d6e4ff]/80 hover:bg-white/5 hover:text-white'
                              }`}
                            >
                              <LinkIcon className="h-4 w-4" />
                              <span className="text-sm font-medium">{link.label}</span>
                            </Link>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
