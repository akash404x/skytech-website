'use client';

import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Building2, 
  Briefcase, 
  FileText, 
  Mail, 
  HelpCircle, 
  MessageCircle, 
  Truck, 
  RotateCcw, 
  Shield, 
  Scale, 
  Cookie,
  ArrowRight
} from 'lucide-react';

const resourceCategories = [
  {
    title: 'Company',
    description: 'Learn about Sky Tech, our team, and how to get in touch',
    color: 'cyan',
    resources: [
      {
        title: 'About Us',
        description: 'Discover our story, mission, and the team behind Sky Tech',
        icon: Building2,
        href: '/about',
      },
      {
        title: 'Careers',
        description: 'Join our team and build the future with us',
        icon: Briefcase,
        href: '/careers',
      },
      {
        title: 'Blog',
        description: 'Stay updated with our latest news and insights',
        icon: FileText,
        href: '/blog',
      },
      {
        title: 'Contact',
        description: 'Get in touch with our team for inquiries',
        icon: Mail,
        href: '/contact',
      },
    ],
  },
  {
    title: 'Support',
    description: 'Get help with orders, shipping, returns, and common questions',
    color: 'blue',
    resources: [
      {
        title: 'Help Center',
        description: 'Find comprehensive guides and support articles',
        icon: HelpCircle,
        href: '/help-center',
      },
      {
        title: 'FAQ',
        description: 'Quick answers to frequently asked questions',
        icon: MessageCircle,
        href: '/faq',
      },
      {
        title: 'Shipping Policy',
        description: 'Learn about our shipping options and delivery times',
        icon: Truck,
        href: '/shipping',
      },
      {
        title: 'Returns & Refunds',
        description: 'Understand our return policy and refund process',
        icon: RotateCcw,
        href: '/returns',
      },
    ],
  },
  {
    title: 'Legal',
    description: 'Important legal information about our services',
    color: 'purple',
    resources: [
      {
        title: 'Privacy Policy',
        description: 'How we collect, use, and protect your data',
        icon: Shield,
        href: '/privacy-policy',
      },
      {
        title: 'Terms of Service',
        description: 'Terms and conditions for using our platform',
        icon: Scale,
        href: '/terms-of-service',
      },
      {
        title: 'Cookie Policy',
        description: 'Information about cookies and tracking technologies',
        icon: Cookie,
        href: '/cookie-policy',
      },
    ],
  },
];

const colorGradients = {
  cyan: 'from-cyan-400 to-cyan-600',
  blue: 'from-blue-400 to-blue-600',
  purple: 'from-purple-400 to-purple-600',
};

const bgColors = {
  cyan: 'bg-cyan-500/10',
  blue: 'bg-blue-500/10',
  purple: 'bg-purple-500/10',
};

const borderColors = {
  cyan: 'border-cyan-500/30',
  blue: 'border-blue-500/30',
  purple: 'border-purple-500/30',
};

const glowColors = {
  cyan: 'hover:shadow-[0_0_40px_rgba(0,191,255,0.3)]',
  blue: 'hover:shadow-[0_0_40px_rgba(59,130,246,0.3)]',
  purple: 'hover:shadow-[0_0_40px_rgba(168,85,247,0.3)]',
};

export default function ResourcesPage() {
  return (
    <div className="tech-page min-h-screen">
      <Navbar />
      
      <main className="tech-main">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <div className="tech-glass-card p-8 md:p-16 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-6 flex justify-center"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#00bfff] to-[#00e5ff] blur-3xl opacity-30 animate-pulse" />
                <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-[#00bfff] to-[#00e5ff] flex items-center justify-center shadow-[0_0_50px_rgba(0,191,255,0.5)]">
                  <svg className="w-12 h-12 text-[#020617]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              </div>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="tech-heading-gradient text-5xl md:text-6xl font-bold mb-4"
            >
              Resources Hub
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-xl text-[#d6e4ff]/80 max-w-2xl mx-auto mb-8"
            >
              Everything you need to know about Sky Tech in one place
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-wrap justify-center gap-4"
            >
              <div className="flex items-center gap-2 text-[#d6e4ff]/60">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-sm">Company Info</span>
              </div>
              <div className="flex items-center gap-2 text-[#d6e4ff]/60">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                <span className="text-sm">Support Center</span>
              </div>
              <div className="flex items-center gap-2 text-[#d6e4ff]/60">
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                <span className="text-sm">Legal Documents</span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Resource Categories */}
        <div className="space-y-12 mb-16">
          {resourceCategories.map((category, categoryIndex) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
            >
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-white mb-2">{category.title}</h2>
                <p className="text-[#d6e4ff]/70">{category.description}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {category.resources.map((resource, resourceIndex) => {
                  const ResourceIcon = resource.icon;
                  
                  return (
                    <motion.a
                      key={resource.href}
                      href={resource.href}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: categoryIndex * 0.1 + resourceIndex * 0.05 }}
                      whileHover={{ y: -8 }}
                      className="group relative"
                    >
                      <div className={`tech-glass-card p-6 h-full transition-all duration-300 ${glowColors[category.color as keyof typeof glowColors]} hover:border-[#00bfff]/50`}>
                        {/* Icon */}
                        <div className={`mb-4 inline-flex rounded-2xl bg-gradient-to-br ${colorGradients[category.color as keyof typeof colorGradients]} p-3 shadow-lg`}>
                          <ResourceIcon className="h-6 w-6 text-white" />
                        </div>
                        
                        {/* Title */}
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#00e5ff] transition-colors">
                          {resource.title}
                        </h3>
                        
                        {/* Description */}
                        <p className="text-[#d6e4ff]/70 text-sm mb-4 line-clamp-2">
                          {resource.description}
                        </p>
                        
                        {/* Explore Button */}
                        <div className={`inline-flex items-center gap-2 rounded-lg ${bgColors[category.color as keyof typeof bgColors]} ${borderColors[category.color as keyof typeof borderColors]} border px-4 py-2 text-sm font-semibold text-[#00e5ff] transition-all group-hover:bg-[#00bfff]/20`}>
                          <span>Explore</span>
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    </motion.a>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Access Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16"
        >
          <div className="tech-glass-card p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Need Quick Help?</h3>
                <p className="text-[#d6e4ff]/70">
                  Can't find what you're looking for? Our support team is here to help.
                </p>
              </div>
              <a
                href="/contact"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#00bfff] to-[#00e5ff] px-8 py-4 font-semibold text-[#020617] transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(0,191,255,0.5)]"
              >
                Contact Support
                <ArrowRight className="h-5 w-5" />
              </a>
            </div>
          </div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
}
