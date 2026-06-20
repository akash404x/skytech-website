'use client';

import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FileText, Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export default function TermsOfServicePage() {
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
                <FileText className="h-10 w-10 text-[#020617]" />
              </div>
            </div>
            <h1 className="tech-heading-gradient text-4xl md:text-5xl font-bold mb-4">
              Terms of Service
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
              Welcome to SkyTech. By accessing or using our website, products, and services, you agree to be bound by these Terms of Service ("Terms"). Please read them carefully before using our services.
            </p>
            <p className="text-[#d6e4ff]/80">
              If you do not agree to these Terms, please do not use our services. We reserve the right to modify these Terms at any time, and your continued use of our services constitutes acceptance of any changes.
            </p>
          </motion.div>

          {/* Acceptance of Terms */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="tech-glass-card p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#00bfff]/10 border border-[#00bfff]/20 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-[#00bfff]" />
              </div>
              <h2 className="text-2xl font-bold text-white">Acceptance of Terms</h2>
            </div>
            
            <p className="text-[#d6e4ff]/80 mb-4">
              By using SkyTech's services, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you are using our services on behalf of a company or organization, you represent that you have the authority to bind that entity to these Terms.
            </p>
          </motion.div>

          {/* Account Registration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="tech-glass-card p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#00bfff]/10 border border-[#00bfff]/20 flex items-center justify-center">
                <Shield className="h-6 w-6 text-[#00bfff]" />
              </div>
              <h2 className="text-2xl font-bold text-white">Account Registration</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Account Requirements</h3>
                <ul className="space-y-2 text-[#d6e4ff]/80 list-disc list-inside">
                  <li>You must be at least 18 years old to create an account</li>
                  <li>You must provide accurate, complete, and current information</li>
                  <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                  <li>You are responsible for all activities that occur under your account</li>
                </ul>
              </div>
              
              <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[#d6e4ff]/80">
                    <strong>Important:</strong> You agree to notify us immediately of any unauthorized use of your account or any other breach of security.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Products and Services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="tech-glass-card p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#00bfff]/10 border border-[#00bfff]/20 flex items-center justify-center">
                <FileText className="h-6 w-6 text-[#00bfff]" />
              </div>
              <h2 className="text-2xl font-bold text-white">Products and Services</h2>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-[#00bfff]/20 bg-[#020617]/50">
                <h3 className="font-semibold text-white mb-2">Product Descriptions</h3>
                <p className="text-[#d6e4ff]/80">
                  We strive to provide accurate product descriptions and images. However, we do not warrant that descriptions are error-free. Colors may vary slightly due to monitor settings.
                </p>
              </div>
              
              <div className="p-4 rounded-xl border border-[#00bfff]/20 bg-[#020617]/50">
                <h3 className="font-semibold text-white mb-2">Pricing</h3>
                <p className="text-[#d6e4ff]/80">
                  Prices are subject to change without notice. We reserve the right to modify prices or discontinue products at any time. The price displayed at checkout is the final price.
                </p>
              </div>
              
              <div className="p-4 rounded-xl border border-[#00bfff]/20 bg-[#020617]/50">
                <h3 className="font-semibold text-white mb-2">Availability</h3>
                <p className="text-[#d6e4ff]/80">
                  Product availability is not guaranteed. We cannot guarantee that items will be in stock at the time of your order. If an item is unavailable, we will notify you and provide options.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Orders and Payments */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="tech-glass-card p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#00bfff]/10 border border-[#00bfff]/20 flex items-center justify-center">
                <FileText className="h-6 w-6 text-[#00bfff]" />
              </div>
              <h2 className="text-2xl font-bold text-white">Orders and Payments</h2>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-[#00bfff]/20 bg-[#020617]/50">
                <h3 className="font-semibold text-white mb-2">Order Acceptance</h3>
                <p className="text-[#d6e4ff]/80">
                  We reserve the right to refuse or cancel any order for any reason, including product availability, errors in pricing, or suspected fraud.
                </p>
              </div>
              
              <div className="p-4 rounded-xl border border-[#00bfff]/20 bg-[#020617]/50">
                <h3 className="font-semibold text-white mb-2">Payment Terms</h3>
                <p className="text-[#d6e4ff]/80">
                  Payment is due at the time of purchase. We accept various payment methods as specified on our website. All payments are processed securely through Razorpay.
                </p>
              </div>
              
              <div className="p-4 rounded-xl border border-[#00bfff]/20 bg-[#020617]/50">
                <h3 className="font-semibold text-white mb-2">Coupon Codes</h3>
                <p className="text-[#d6e4ff]/80">
                  Coupon codes are subject to terms and conditions specified at the time of issuance. Orders placed using coupon codes cannot be cancelled by customers and require support assistance.
                </p>
              </div>
            </div>
          </motion.div>

          {/* User Conduct */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="tech-glass-card p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <XCircle className="h-6 w-6 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Prohibited Activities</h2>
            </div>
            
            <p className="text-[#d6e4ff]/80 mb-4">
              You agree not to engage in any of the following prohibited activities:
            </p>
            
            <ul className="space-y-2 text-[#d6e4ff]/80">
              <li className="flex items-start gap-3">
                <span className="text-red-400 mt-1">•</span>
                <span>Use the services for any illegal or unauthorized purpose</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 mt-1">•</span>
                <span>Violate any laws in your jurisdiction</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 mt-1">•</span>
                <span>Infringe on intellectual property rights of others</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 mt-1">•</span>
                <span>Upload malicious code, viruses, or harmful content</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 mt-1">•</span>
                <span>Attempt to gain unauthorized access to our systems</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 mt-1">•</span>
                <span>Interfere with or disrupt our services or servers</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 mt-1">•</span>
                <span>Use automated tools to access our services without permission</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 mt-1">•</span>
                <span>Forge headers or manipulate identifiers to disguise the origin of any content</span>
              </li>
            </ul>
          </motion.div>

          {/* Intellectual Property */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="tech-glass-card p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#00bfff]/10 border border-[#00bfff]/20 flex items-center justify-center">
                <Shield className="h-6 w-6 text-[#00bfff]" />
              </div>
              <h2 className="text-2xl font-bold text-white">Intellectual Property</h2>
            </div>
            
            <p className="text-[#d6e4ff]/80 mb-4">
              All content on our website, including text, graphics, logos, images, and software, is the property of SkyTech or its content suppliers and is protected by intellectual property laws.
            </p>
            
            <div className="p-4 rounded-xl border border-[#00bfff]/20 bg-[#020617]/50">
              <h3 className="font-semibold text-white mb-2">License to Use</h3>
              <p className="text-[#d6e4ff]/80">
                We grant you a limited, non-exclusive, non-transferable license to access and use our website for personal, non-commercial purposes. You may not reproduce, distribute, modify, or create derivative works without our express written consent.
              </p>
            </div>
          </motion.div>

          {/* Limitation of Liability */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="tech-glass-card p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-yellow-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Limitation of Liability</h2>
            </div>
            
            <div className="p-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 mb-4">
              <p className="text-[#d6e4ff]/80">
                To the maximum extent permitted by law, SkyTech shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
              </p>
            </div>
            
            <p className="text-[#d6e4ff]/80">
              In no event shall our total liability to you for all claims exceed the amount you paid to us for the specific product or service giving rise to the claim.
            </p>
          </motion.div>

          {/* Indemnification */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="tech-glass-card p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#00bfff]/10 border border-[#00bfff]/20 flex items-center justify-center">
                <Shield className="h-6 w-6 text-[#00bfff]" />
              </div>
              <h2 className="text-2xl font-bold text-white">Indemnification</h2>
            </div>
            
            <p className="text-[#d6e4ff]/80">
              You agree to indemnify, defend, and hold harmless SkyTech, its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses arising from your use of our services or violation of these Terms.
            </p>
          </motion.div>

          {/* Termination */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="tech-glass-card p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#00bfff]/10 border border-[#00bfff]/20 flex items-center justify-center">
                <XCircle className="h-6 w-6 text-[#00bfff]" />
              </div>
              <h2 className="text-2xl font-bold text-white">Termination</h2>
            </div>
            
            <p className="text-[#d6e4ff]/80 mb-4">
              We reserve the right to terminate or suspend your account and access to our services at our sole discretion, without prior notice, for any reason, including but not limited to:
            </p>
            
            <ul className="space-y-2 text-[#d6e4ff]/80 mb-4">
              <li className="flex items-start gap-3">
                <span className="text-[#00e5ff] mt-1">•</span>
                <span>Violation of these Terms</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#00e5ff] mt-1">•</span>
                <span>Fraudulent or illegal activities</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#00e5ff] mt-1">•</span>
                <span>Non-payment of fees</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#00e5ff] mt-1">•</span>
                <span>Extended period of inactivity</span>
              </li>
            </ul>
            
            <p className="text-[#d6e4ff]/80">
              Upon termination, your right to use our services will immediately cease. All provisions of these Terms shall survive termination.
            </p>
          </motion.div>

          {/* Governing Law */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.1 }}
            className="tech-glass-card p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#00bfff]/10 border border-[#00bfff]/20 flex items-center justify-center">
                <FileText className="h-6 w-6 text-[#00bfff]" />
              </div>
              <h2 className="text-2xl font-bold text-white">Governing Law</h2>
            </div>
            
            <p className="text-[#d6e4ff]/80">
              These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts in Prayagraj, Uttar Pradesh, India.
            </p>
          </motion.div>

          {/* Changes to Terms */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="tech-glass-card p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#00bfff]/10 border border-[#00bfff]/20 flex items-center justify-center">
                <FileText className="h-6 w-6 text-[#00bfff]" />
              </div>
              <h2 className="text-2xl font-bold text-white">Changes to Terms</h2>
            </div>
            
            <p className="text-[#d6e4ff]/80">
              We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting on our website. Your continued use of our services after changes constitutes acceptance of the modified Terms.
            </p>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.3 }}
            className="tech-glass-card p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#00bfff]/10 border border-[#00bfff]/20 flex items-center justify-center">
                <FileText className="h-6 w-6 text-[#00bfff]" />
              </div>
              <h2 className="text-2xl font-bold text-white">Contact Us</h2>
            </div>
            
            <p className="text-[#d6e4ff]/80 mb-4">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            
            <div className="space-y-2">
              <p className="text-[#d6e4ff]/80">
                <strong>Email:</strong>{' '}
                <a href="mailto:contact@theskytechnology.in" className="text-[#00e5ff] hover:underline">
                  contact@theskytechnology.in
                </a>
              </p>
              <p className="text-[#d6e4ff]/80">
                <strong>Phone:</strong> +91 5334357055
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
