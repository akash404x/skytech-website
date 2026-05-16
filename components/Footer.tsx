'use client';

import { MessageCircle, Share2, Mail, Phone, MapPin, Globe } from 'lucide-react';

const footerLinks: { [key: string]: Array<{ name: string; href: string; icon?: any }> } = {
  About: [
    { name: 'About Us', href: '#' },
    { name: 'Careers', href: '#' },
    { name: 'Press', href: '#' },
    { name: 'Blog', href: '#' },
  ],
  Help: [
    { name: 'Payments', href: '#' },
    { name: 'Shipping', href: '#' },
    { name: 'Returns', href: '#' },
    { name: 'FAQ', href: '#' },
  ],
  Policy: [
    { name: 'Return Policy', href: '#' },
    { name: 'Terms of Use', href: '#' },
    { name: 'Security', href: '#' },
    { name: 'Privacy', href: '#' },
  ],
  Social: [
    { name: 'Facebook', href: '#', icon: MessageCircle },
    { name: 'Twitter', href: '#', icon: Share2 },
    { name: 'Instagram', href: '#', icon: Globe },
    { name: 'LinkedIn', href: '#', icon: Share2 },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="text-2xl font-bold italic text-white mb-4">
              Sky<span className="text-yellow-400">Tech</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-sm">
              Your one-stop destination for all your shopping needs. Quality products, best prices, and exceptional service.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-blue-400" />
                <span className="text-sm">+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-blue-400" />
                <span className="text-sm">support@skytech.com</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-blue-400" />
                <span className="text-sm">Mumbai, Maharashtra, India</span>
              </div>
            </div>
          </div>

          {/* Link Sections */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-white font-semibold mb-4">{title}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-sm hover:text-blue-400 transition-colors flex items-center gap-2"
                    >
                      {link.icon && <link.icon className="h-4 w-4" />}
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Payment Methods */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-400">
              © 2024 SkyTech. All rights reserved.
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">Payment Methods:</span>
              <div className="flex gap-2">
                <div className="bg-white rounded px-3 py-1 text-xs font-bold text-gray-900">VISA</div>
                <div className="bg-white rounded px-3 py-1 text-xs font-bold text-gray-900">MasterCard</div>
                <div className="bg-white rounded px-3 py-1 text-xs font-bold text-gray-900">UPI</div>
                <div className="bg-white rounded px-3 py-1 text-xs font-bold text-gray-900">COD</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
