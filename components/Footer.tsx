'use client';

import { motion } from 'framer-motion';
import { MessageCircle, Share2, Mail, Phone, MapPin, Globe, Zap, Cpu, Loader2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const footerLinks: Record<string, Array<{ name: string; href: string; icon?: LucideIcon }>> = {
  Company: [
    { name: 'About Us', href: '/about' },
    { name: 'Careers', href: '/careers' },
    { name: 'Contact', href: '/contact' },
  ],
  Support: [
    { name: 'Help Center', href: '/help-center' },
    { name: 'Shipping Policy', href: '/shipping' },
    { name: 'Returns & Refunds', href: '/returns' },
    { name: 'FAQ', href: '/faq' },
  ],
  Legal: [
    { name: 'Privacy Policy', href: '/privacy-policy' },
    { name: 'Terms of Service', href: '/terms-of-service' },
    { name: 'Cookie Policy', href: '/cookie-policy' },
  ],
  Social: [
    { name: 'Twitter', href: '#', icon: Share2 },
    { name: 'Instagram', href: '#', icon: Globe },
    { name: 'LinkedIn', href: '#', icon: Share2 },
    { name: 'Facebook', href: '#', icon: MessageCircle },
  ],
};

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Please enter your email');
      return;
    }

    setSubscribing(true);
    try {
      console.log('Writing to collection: newsletter_subscribers');
      const docRef = await addDoc(collection(db, 'newsletter_subscribers'), {
        email: email.trim(),
        status: 'active',
        subscribedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      });
      console.log('Document written with ID:', docRef.id);
      
      toast.success('Subscribed successfully!');
      setEmail('');
    } catch (error: any) {
      console.error('Subscription error:');
      console.error('Error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      toast.error('Failed to subscribe. Please try again.');
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <footer className="relative overflow-hidden">
      {/* Circuit Background */}
      <div className="absolute inset-0 bg-[#020617]">
        <div className="absolute inset-0 opacity-5">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(0, 191, 255, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 191, 255, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
            }}
          />
        </div>
        
        {/* Circuit Pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="circuit" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <circle cx="50" cy="50" r="2" fill="#00bfff" />
              <path d="M50 50 L50 0 M50 50 L100 50" stroke="#00bfff" strokeWidth="0.5" fill="none" />
              <circle cx="0" cy="0" r="1" fill="#00e5ff" />
              <circle cx="100" cy="100" r="1" fill="#00e5ff" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#circuit)" />
        </svg>

        {/* Glowing Orbs */}
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#00bfff] rounded-full blur-[200px] opacity-10" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#00e5ff] rounded-full blur-[200px] opacity-10" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="text-3xl font-bold italic text-white mb-4">
                Sky<span className="bg-gradient-to-r from-[#00bfff] to-[#00e5ff] bg-clip-text text-transparent">Tech</span>
              </div>
              <p className="text-[#d6e4ff]/70 mb-8 max-w-sm leading-relaxed">
                Building the future through technology. Advanced electronics, IoT solutions, and innovative digital experiences.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#00bfff]/10 border border-[#00bfff]/20 flex items-center justify-center">
                    <Phone className="h-5 w-5 text-[#00bfff]" />
                  </div>
                  <span className="text-[#d6e4ff]">+91 8429372020</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#00bfff]/10 border border-[#00bfff]/20 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-[#00bfff]" />
                  </div>
                  <span className="text-[#d6e4ff]">contact@theskytechnology.in</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#00bfff]/10 border border-[#00bfff]/20 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-[#00bfff]" />
                  </div>
                  <span className="text-[#d6e4ff]">Prayagraj, Uttar Pradesh, India</span>
                </div>
              </div>

              {/* Newsletter */}
              <div className="p-4 rounded-xl bg-[#06122d]/40 border border-[#00bfff]/10">
                <p className="text-sm font-semibold text-white mb-2">Stay Updated</p>
                <p className="text-xs text-[#d6e4ff]/60 mb-3">Get the latest news and updates</p>
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={subscribing}
                    className="flex-1 px-3 py-2 rounded-lg bg-[#020617]/50 border border-[#00bfff]/20 text-white text-sm focus:outline-none focus:border-[#00bfff]/40 disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={subscribing}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#00bfff] to-[#00e5ff] text-[#020617] font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {subscribing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </>
                    ) : (
                      'Subscribe'
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>

          {/* Link Sections */}
          {Object.entries(footerLinks).map(([title, links], index) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <h3 className="text-white font-semibold mb-4">{title}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-sm text-[#d6e4ff]/70 hover:text-[#00e5ff] transition-colors flex items-center gap-2"
                    >
                      {link.icon && <link.icon className="h-4 w-4" />}
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="border-t border-[#00bfff]/10 mt-16 pt-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-sm text-[#d6e4ff]/60">
              © 2026 SkyTech. All rights reserved.
            </div>
            
            {/* Slogan */}
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#00bfff]" />
              <span className="text-sm text-[#d6e4ff]/80 font-medium">Building The Future Through Technology</span>
              <Cpu className="w-4 h-4 text-[#00e5ff]" />
            </div>

            {/* Payment Methods */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#d6e4ff]/60">Payment:</span>
              <div className="flex gap-2">
                <div className="px-3 py-1 rounded bg-[#06122d]/40 border border-[#00bfff]/10 text-xs font-semibold text-[#00e5ff]">VISA</div>
                <div className="px-3 py-1 rounded bg-[#06122d]/40 border border-[#00bfff]/10 text-xs font-semibold text-[#00e5ff]">MasterCard</div>
                <div className="px-3 py-1 rounded bg-[#06122d]/40 border border-[#00bfff]/10 text-xs font-semibold text-[#00e5ff]">UPI</div>
                <div className="px-3 py-1 rounded bg-[#06122d]/40 border border-[#00bfff]/10 text-xs font-semibold text-[#00e5ff]">COD</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
