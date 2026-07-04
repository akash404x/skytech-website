'use client';

import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Cookie, CheckCircle, XCircle, Settings, Eye, Clock } from 'lucide-react';

export default function CookiePolicyPage() {
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
                <Cookie className="h-10 w-10 text-[#020617]" />
              </div>
            </div>
            <h1 className="tech-heading-gradient text-4xl md:text-5xl font-bold mb-4">
              Cookie Policy
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
            <h2 className="text-2xl font-bold text-white mb-4">What Are Cookies?</h2>
            <p className="text-[#d6e4ff]/80 mb-4">
              Cookies are small text files that are stored on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and understanding how you use our site.
            </p>
            <p className="text-[#d6e4ff]/80">
              Cookies are widely used to make websites work more efficiently and to provide information to website owners. This policy explains how SkyTech uses cookies and your choices regarding them.
            </p>
          </motion.div>

          {/* Types of Cookies We Use */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="tech-glass-card p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#00bfff]/10 border border-[#00bfff]/20 flex items-center justify-center">
                <Cookie className="h-6 w-6 text-[#00bfff]" />
              </div>
              <h2 className="text-2xl font-bold text-white">Types of Cookies We Use</h2>
            </div>
            
            <div className="space-y-6">
              <div className="p-4 rounded-xl border border-green-500/30 bg-green-500/10">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <h3 className="text-xl font-semibold text-white">Essential Cookies</h3>
                </div>
                <p className="text-[#d6e4ff]/80 mb-2">
                  These cookies are necessary for the website to function properly. They enable basic functionality such as secure login, shopping cart management, and access to secure areas.
                </p>
                <p className="text-sm text-[#d6e4ff]/60">
                  <strong>Duration:</strong> Session or persistent (as required)
                </p>
                <p className="text-sm text-[#d6e4ff]/60">
                  <strong>Can be disabled:</strong> No (website will not function properly)
                </p>
              </div>
              
              <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/10">
                <div className="flex items-center gap-3 mb-3">
                  <Eye className="h-5 w-5 text-blue-400" />
                  <h3 className="text-xl font-semibold text-white">Analytics Cookies</h3>
                </div>
                <p className="text-[#d6e4ff]/80 mb-2">
                  These cookies help us understand how visitors interact with our website by providing information about metrics such as number of visitors, bounce rate, traffic source, and pages visited.
                </p>
                <p className="text-sm text-[#d6e4ff]/60">
                  <strong>Duration:</strong> Typically 2 years
                </p>
                <p className="text-sm text-[#d6e4ff]/60">
                  <strong>Can be disabled:</strong> Yes
                </p>
              </div>
              
              <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-500/10">
                <div className="flex items-center gap-3 mb-3">
                  <Settings className="h-5 w-5 text-purple-400" />
                  <h3 className="text-xl font-semibold text-white">Functional Cookies</h3>
                </div>
                <p className="text-[#d6e4ff]/80 mb-2">
                  These cookies enable enhanced functionality and personalization, such as remembering your preferences, language settings, and location for better user experience.
                </p>
                <p className="text-sm text-[#d6e4ff]/60">
                  <strong>Duration:</strong> Typically 1 year
                </p>
                <p className="text-sm text-[#d6e4ff]/60">
                  <strong>Can be disabled:</strong> Yes
                </p>
              </div>
              
              <div className="p-4 rounded-xl border border-orange-500/30 bg-orange-500/10">
                <div className="flex items-center gap-3 mb-3">
                  <Eye className="h-5 w-5 text-orange-400" />
                  <h3 className="text-xl font-semibold text-white">Marketing Cookies</h3>
                </div>
                <p className="text-[#d6e4ff]/80 mb-2">
                  These cookies are used to deliver advertisements that are relevant to you and your interests. They track your visit across websites and create a profile of your interests.
                </p>
                <p className="text-sm text-[#d6e4ff]/60">
                  <strong>Duration:</strong> Varies (typically 30 days to 2 years)
                </p>
                <p className="text-sm text-[#d6e4ff]/60">
                  <strong>Can be disabled:</strong> Yes
                </p>
              </div>
            </div>
          </motion.div>

          {/* How We Use Cookies */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="tech-glass-card p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#00bfff]/10 border border-[#00bfff]/20 flex items-center justify-center">
                <Cookie className="h-6 w-6 text-[#00bfff]" />
              </div>
              <h2 className="text-2xl font-bold text-white">How We Use Cookies</h2>
            </div>
            
            <ul className="space-y-3 text-[#d6e4ff]/80">
              <li className="flex items-start gap-3">
                <span className="text-[#00e5ff] mt-1">•</span>
                <span><strong>Authentication:</strong> Keep you logged in during your session</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#00e5ff] mt-1">•</span>
                <span><strong>Shopping Cart:</strong> Remember items in your cart</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#00e5ff] mt-1">•</span>
                <span><strong>Preferences:</strong> Remember your language, currency, and display settings</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#00e5ff] mt-1">•</span>
                <span><strong>Analytics:</strong> Analyze website traffic and user behavior</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#00e5ff] mt-1">•</span>
                <span><strong>Personalization:</strong> Show relevant content and recommendations</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#00e5ff] mt-1">•</span>
                <span><strong>Marketing:</strong> Deliver personalized advertisements</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#00e5ff] mt-1">•</span>
                <span><strong>Security:</strong> Detect and prevent fraudulent activity</span>
              </li>
            </ul>
          </motion.div>

          {/* Third-Party Cookies */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="tech-glass-card p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#00bfff]/10 border border-[#00bfff]/20 flex items-center justify-center">
                <Cookie className="h-6 w-6 text-[#00bfff]" />
              </div>
              <h2 className="text-2xl font-bold text-white">Third-Party Cookies</h2>
            </div>
            
            <p className="text-[#d6e4ff]/80 mb-4">
              We may use third-party services that set cookies on your device. These include:
            </p>
            
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-[#00bfff]/20 bg-[#020617]/50">
                <h3 className="font-semibold text-white mb-2">Payment Processors</h3>
                <p className="text-[#d6e4ff]/80">
                  Razorpay and other payment processors use cookies to secure transactions and prevent fraud.
                </p>
              </div>
              
              <div className="p-4 rounded-xl border border-[#00bfff]/20 bg-[#020617]/50">
                <h3 className="font-semibold text-white mb-2">Analytics Services</h3>
                <p className="text-[#d6e4ff]/80">
                  Google Analytics and similar services use cookies to collect anonymous usage data for website optimization.
                </p>
              </div>
              
              <div className="p-4 rounded-xl border border-[#00bfff]/20 bg-[#020617]/50">
                <h3 className="font-semibold text-white mb-2">Social Media</h3>
                <p className="text-[#d6e4ff]/80">
                  Social media platforms may set cookies when you interact with their features on our website.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Managing Cookies */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="tech-glass-card p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#00bfff]/10 border border-[#00bfff]/20 flex items-center justify-center">
                <Settings className="h-6 w-6 text-[#00bfff]" />
              </div>
              <h2 className="text-2xl font-bold text-white">Managing Your Cookie Preferences</h2>
            </div>
            
            <p className="text-[#d6e4ff]/80 mb-4">
              You have several options to manage cookies:
            </p>
            
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-[#00bfff]/20 bg-[#020617]/50">
                <h3 className="font-semibold text-white mb-2">Browser Settings</h3>
                <p className="text-[#d6e4ff]/80 mb-2">
                  Most web browsers allow you to control cookies through their settings. You can:
                </p>
                <ul className="space-y-1 text-[#d6e4ff]/70 list-disc list-inside">
                  <li>Block all cookies</li>
                  <li>Delete existing cookies</li>
                  <li>Accept only first-party cookies</li>
                  <li>Set notifications when cookies are set</li>
                </ul>
              </div>
              
              <div className="p-4 rounded-xl border border-[#00bfff]/20 bg-[#020617]/50">
                <h3 className="font-semibold text-white mb-2">Cookie Consent Banner</h3>
                <p className="text-[#d6e4ff]/80">
                  When you first visit our website, you'll see a cookie consent banner where you can accept or reject non-essential cookies. You can change your preferences at any time.
                </p>
              </div>
              
              <div className="p-4 rounded-xl border border-[#00bfff]/20 bg-[#020617]/50">
                <h3 className="font-semibold text-white mb-2">Opt-Out Links</h3>
                <p className="text-[#d6e4ff]/80">
                  Some third-party services provide opt-out links for their cookies. You can visit their privacy policies for more information.
                </p>
              </div>
            </div>
            
            <div className="mt-6 p-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10">
              <div className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <p className="text-[#d6e4ff]/80">
                  <strong>Note:</strong> Disabling cookies may affect the functionality of our website and limit your ability to use certain features.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Cookie Lifespan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="tech-glass-card p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#00bfff]/10 border border-[#00bfff]/20 flex items-center justify-center">
                <Clock className="h-6 w-6 text-[#00bfff]" />
              </div>
              <h2 className="text-2xl font-bold text-white">Cookie Lifespan</h2>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-[#00bfff]/20 bg-[#020617]/50">
                <h3 className="font-semibold text-white mb-2">Session Cookies</h3>
                <p className="text-[#d6e4ff]/80">
                  These cookies are temporary and are deleted when you close your browser. They're used for essential functions like maintaining your login session.
                </p>
              </div>
              
              <div className="p-4 rounded-xl border border-[#00bfff]/20 bg-[#020617]/50">
                <h3 className="font-semibold text-white mb-2">Persistent Cookies</h3>
                <p className="text-[#d6e4ff]/80">
                  These cookies remain on your device for a set period or until you delete them. They're used for remembering preferences and analytics.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Updates to Cookie Policy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="tech-glass-card p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#00bfff]/10 border border-[#00bfff]/20 flex items-center justify-center">
                <Cookie className="h-6 w-6 text-[#00bfff]" />
              </div>
              <h2 className="text-2xl font-bold text-white">Updates to This Policy</h2>
            </div>
            
            <p className="text-[#d6e4ff]/80">
              We may update this Cookie Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. We will notify you of any material changes by posting the new policy on our website and updating the "Last updated" date.
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
                <Cookie className="h-6 w-6 text-[#00bfff]" />
              </div>
              <h2 className="text-2xl font-bold text-white">Contact Us</h2>
            </div>
            
            <p className="text-[#d6e4ff]/80 mb-4">
              If you have any questions about our use of cookies, please contact us:
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
