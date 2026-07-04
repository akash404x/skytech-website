'use client';

import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Shield, Eye, Lock, Database, Mail, User } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="tech-page min-h-screen">
      <Navbar />
      
      <main className="tech-main">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <div className="tech-glass-card p-8 md:p-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#00bfff] to-[#00e5ff] flex items-center justify-center">
                <Shield className="h-10 w-10 text-[#020617]" />
              </div>
            </div>
            <h1 className="tech-heading-gradient text-4xl md:text-5xl font-bold mb-4">
              Privacy Policy
            </h1>
            <p className="text-xl text-[#d6e4ff]/80 max-w-2xl mx-auto">
              Last updated: January 2026
            </p>
          </div>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-8 mb-12">
          {/* Introduction */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="tech-glass-card p-6 md:p-8"
          >
            <h2 className="text-2xl font-bold text-white mb-4">Introduction</h2>
            <p className="text-[#d6e4ff]/80 mb-4">
              SkyTech ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website, products, and services.
            </p>
            <p className="text-[#d6e4ff]/80">
              By using SkyTech's services, you agree to the collection and use of information in accordance with this policy. If you disagree with any part of this policy, please do not use our services.
            </p>
          </motion.div>

          {/* Information We Collect */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="tech-glass-card p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#00bfff]/10 border border-[#00bfff]/20 flex items-center justify-center">
                <Database className="h-6 w-6 text-[#00bfff]" />
              </div>
              <h2 className="text-2xl font-bold text-white">Information We Collect</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Personal Information</h3>
                <ul className="space-y-2 text-[#d6e4ff]/80 list-disc list-inside">
                  <li>Name and contact information (email, phone, address)</li>
                  <li>Account credentials (username, password)</li>
                  <li>Payment information (processed securely through Razorpay)</li>
                  <li>Profile information and preferences</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Usage Information</h3>
                <ul className="space-y-2 text-[#d6e4ff]/80 list-disc list-inside">
                  <li>IP address and device information</li>
                  <li>Browser type and version</li>
                  <li>Pages visited and time spent on pages</li>
                  <li>Referring website information</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Order Information</h3>
                <ul className="space-y-2 text-[#d6e4ff]/80 list-disc list-inside">
                  <li>Order history and details</li>
                  <li>Shipping and billing addresses</li>
                  <li>Payment transaction records</li>
                  <li>Communication preferences</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* How We Use Your Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="tech-glass-card p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#00bfff]/10 border border-[#00bfff]/20 flex items-center justify-center">
                <Eye className="h-6 w-6 text-[#00bfff]" />
              </div>
              <h2 className="text-2xl font-bold text-white">How We Use Your Information</h2>
            </div>
            
            <ul className="space-y-3 text-[#d6e4ff]/80">
              <li className="flex items-start gap-3">
                <span className="text-[#00e5ff] mt-1">•</span>
                <span><strong>Process and fulfill orders:</strong> To process payments, ship products, and provide customer service</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#00e5ff] mt-1">•</span>
                <span><strong>Improve our services:</strong> To analyze usage patterns and enhance user experience</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#00e5ff] mt-1">•</span>
                <span><strong>Communicate with you:</strong> To send order updates, promotional offers, and support messages</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#00e5ff] mt-1">•</span>
                <span><strong>Security and fraud prevention:</strong> To protect against unauthorized transactions and fraud</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#00e5ff] mt-1">•</span>
                <span><strong>Legal compliance:</strong> To comply with legal obligations and protect our rights</span>
              </li>
            </ul>
          </motion.div>

          {/* Data Security */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="tech-glass-card p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#00bfff]/10 border border-[#00bfff]/20 flex items-center justify-center">
                <Lock className="h-6 w-6 text-[#00bfff]" />
              </div>
              <h2 className="text-2xl font-bold text-white">Data Security</h2>
            </div>
            
            <p className="text-[#d6e4ff]/80 mb-4">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>
            
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-[#00bfff]/20 bg-[#020617]/50">
                <h3 className="font-semibold text-white mb-2">Encryption</h3>
                <p className="text-[#d6e4ff]/80">All sensitive data is encrypted using SSL/TLS during transmission and stored securely using industry-standard encryption methods.</p>
              </div>
              
              <div className="p-4 rounded-xl border border-[#00bfff]/20 bg-[#020617]/50">
                <h3 className="font-semibold text-white mb-2">Payment Security</h3>
                <p className="text-[#d6e4ff]/80">Payment information is processed through Razorpay, a PCI DSS compliant payment gateway. We do not store complete credit card information on our servers.</p>
              </div>
              
              <div className="p-4 rounded-xl border border-[#00bfff]/20 bg-[#020617]/50">
                <h3 className="font-semibold text-white mb-2">Access Control</h3>
                <p className="text-[#d6e4ff]/80">Access to personal information is restricted to authorized personnel who require it for legitimate business purposes.</p>
              </div>
            </div>
          </motion.div>

          {/* Third-Party Services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="tech-glass-card p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#00bfff]/10 border border-[#00bfff]/20 flex items-center justify-center">
                <User className="h-6 w-6 text-[#00bfff]" />
              </div>
              <h2 className="text-2xl font-bold text-white">Third-Party Services</h2>
            </div>
            
            <p className="text-[#d6e4ff]/80 mb-4">
              We may share your information with trusted third-party service providers who assist us in operating our services:
            </p>
            
            <ul className="space-y-3 text-[#d6e4ff]/80">
              <li className="flex items-start gap-3">
                <span className="text-[#00e5ff] mt-1">•</span>
                <span><strong>Payment Processors:</strong> Razorpay for secure payment processing</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#00e5ff] mt-1">•</span>
                <span><strong>Shipping Partners:</strong> Courier services for order delivery</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#00e5ff] mt-1">•</span>
                <span><strong>Analytics Services:</strong> To understand user behavior and improve our services</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#00e5ff] mt-1">•</span>
                <span><strong>Email Services:</strong> For sending transactional and promotional emails</span>
              </li>
            </ul>
            
            <p className="text-[#d6e4ff]/80 mt-4">
              These third parties are contractually obligated to protect your information and are prohibited from using it for any other purpose.
            </p>
          </motion.div>

          {/* Your Rights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="tech-glass-card p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#00bfff]/10 border border-[#00bfff]/20 flex items-center justify-center">
                <User className="h-6 w-6 text-[#00bfff]" />
              </div>
              <h2 className="text-2xl font-bold text-white">Your Rights</h2>
            </div>
            
            <p className="text-[#d6e4ff]/80 mb-4">
              You have the following rights regarding your personal information:
            </p>
            
            <ul className="space-y-3 text-[#d6e4ff]/80">
              <li className="flex items-start gap-3">
                <span className="text-[#00e5ff] mt-1">•</span>
                <span><strong>Access:</strong> Request a copy of your personal information</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#00e5ff] mt-1">•</span>
                <span><strong>Correction:</strong> Request correction of inaccurate information</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#00e5ff] mt-1">•</span>
                <span><strong>Deletion:</strong> Request deletion of your personal information</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#00e5ff] mt-1">•</span>
                <span><strong>Opt-out:</strong> Opt-out of marketing communications</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#00e5ff] mt-1">•</span>
                <span><strong>Data Portability:</strong> Request transfer of your data to another service</span>
              </li>
            </ul>
            
            <p className="text-[#d6e4ff]/80 mt-4">
              To exercise these rights, please contact us at contact@theskytechnology.in
            </p>
          </motion.div>

          {/* Cookies */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="tech-glass-card p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#00bfff]/10 border border-[#00bfff]/20 flex items-center justify-center">
                <Eye className="h-6 w-6 text-[#00bfff]" />
              </div>
              <h2 className="text-2xl font-bold text-white">Cookies and Tracking</h2>
            </div>
            
            <p className="text-[#d6e4ff]/80 mb-4">
              We use cookies and similar technologies to enhance your experience, analyze usage, and assist in our marketing efforts.
            </p>
            
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-[#00bfff]/20 bg-[#020617]/50">
                <h3 className="font-semibold text-white mb-2">Essential Cookies</h3>
                <p className="text-[#d6e4ff]/80">Required for basic website functionality, such as secure login and shopping cart management.</p>
              </div>
              
              <div className="p-4 rounded-xl border border-[#00bfff]/20 bg-[#020617]/50">
                <h3 className="font-semibold text-white mb-2">Analytics Cookies</h3>
                <p className="text-[#d6e4ff]/80">Help us understand how visitors use our website to improve performance and user experience.</p>
              </div>
              
              <div className="p-4 rounded-xl border border-[#00bfff]/20 bg-[#020617]/50">
                <h3 className="font-semibold text-white mb-2">Marketing Cookies</h3>
                <p className="text-[#d6e4ff]/80">Used to deliver relevant advertisements and track marketing campaign effectiveness.</p>
              </div>
            </div>
            
            <p className="text-[#d6e4ff]/80 mt-4">
              You can manage cookie preferences through your browser settings. For more details, please refer to our Cookie Policy.
            </p>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="tech-glass-card p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#00bfff]/10 border border-[#00bfff]/20 flex items-center justify-center">
                <Mail className="h-6 w-6 text-[#00bfff]" />
              </div>
              <h2 className="text-2xl font-bold text-white">Contact Us</h2>
            </div>
            
            <p className="text-[#d6e4ff]/80 mb-4">
              If you have any questions about this Privacy Policy or how we handle your information, please contact us:
            </p>
            
            <div className="space-y-2">
              <p className="text-[#d6e4ff]/80">
                <strong>Email:</strong>{' '}
                <a href="mailto:contact@theskytechnology.in" className="text-[#00e5ff] hover:underline">
                  contact@theskytechnology.in
                </a>
              </p>
              <p className="text-[#d6e4ff]/80">
                <strong>Phone:</strong> +91 8429372020
              </p>
              <p className="text-[#d6e4ff]/80">
                <strong>Address:</strong> Prayagraj, Uttar Pradesh, India
              </p>
            </div>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
