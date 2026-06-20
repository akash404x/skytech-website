'use client';

import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { RotateCcw, Clock, CheckCircle, AlertCircle, XCircle, CreditCard } from 'lucide-react';

export default function ReturnsPage() {
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
                <RotateCcw className="h-10 w-10 text-[#020617]" />
              </div>
            </div>
            <h1 className="tech-heading-gradient text-4xl md:text-5xl font-bold mb-4">
              Returns & Refunds
            </h1>
            <p className="text-xl text-[#d6e4ff]/80 max-w-2xl mx-auto">
              Our hassle-free return policy ensures you can shop with confidence.
            </p>
          </div>
        </motion.div>

        <div className="grid gap-8 mb-12">
          {/* Return Policy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="tech-glass-card p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#00bfff]/10 border border-[#00bfff]/20 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-[#00bfff]" />
                </div>
                <h2 className="text-2xl font-bold text-white">Return Policy</h2>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-green-500/30 bg-green-500/10">
                  <h3 className="font-semibold text-white mb-2">Return Period</h3>
                  <p className="text-[#d6e4ff]/80">
                    You can return most items within 7 days of delivery. The return period begins from the date you receive the product.
                  </p>
                </div>
                
                <div className="p-4 rounded-xl border border-[#00bfff]/20 bg-[#020617]/50">
                  <h3 className="font-semibold text-white mb-2">Return Conditions</h3>
                  <ul className="space-y-2 text-[#d6e4ff]/80 list-disc list-inside">
                    <li>Item must be unused and in original packaging</li>
                    <li>All tags, labels, and accessories must be intact</li>
                    <li>Original invoice or proof of purchase required</li>
                    <li>Item should not be damaged or tampered with</li>
                  </ul>
                </div>
                
                <div className="p-4 rounded-xl border border-[#00bfff]/20 bg-[#020617]/50">
                  <h3 className="font-semibold text-white mb-2">How to Initiate a Return</h3>
                  <ol className="space-y-2 text-[#d6e4ff]/80 list-decimal list-inside">
                    <li>Log in to your SkyTech account</li>
                    <li>Go to "My Orders" section</li>
                    <li>Select the order you want to return</li>
                    <li>Click on "Return Order" button</li>
                    <li>Select the items and provide reason</li>
                    <li>Submit the return request</li>
                  </ol>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Refund Process */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="tech-glass-card p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#00bfff]/10 border border-[#00bfff]/20 flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-[#00bfff]" />
                </div>
                <h2 className="text-2xl font-bold text-white">Refund Process</h2>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-[#00bfff]/20 bg-[#020617]/50">
                  <h3 className="font-semibold text-white mb-2">Refund Timeline</h3>
                  <p className="text-[#d6e4ff]/80">
                    Once we receive and inspect the returned item, refunds are processed within 5-7 business days. The actual time for the amount to reflect in your account depends on your bank or payment provider.
                  </p>
                </div>
                
                <div className="p-4 rounded-xl border border-[#00bfff]/20 bg-[#020617]/50">
                  <h3 className="font-semibold text-white mb-2">Refund Methods</h3>
                  <ul className="space-y-2 text-[#d6e4ff]/80">
                    <li className="flex items-start gap-2">
                      <span className="text-[#00e5ff] mt-1">•</span>
                      <span><strong>Original Payment Method:</strong> Refunded to the same card/account used for purchase</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#00e5ff] mt-1">•</span>
                      <span><strong>Wallet Credit:</strong> Credited to your SkyTech wallet for future purchases</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#00e5ff] mt-1">•</span>
                      <span><strong>Bank Transfer:</strong> Direct transfer to your bank account (for COD orders)</span>
                    </li>
                  </ul>
                </div>
                
                <div className="p-4 rounded-xl border border-[#00bfff]/20 bg-[#020617]/50">
                  <h3 className="font-semibold text-white mb-2">Refund Confirmation</h3>
                  <p className="text-[#d6e4ff]/80">
                    You'll receive an email confirmation once your refund is processed. The email will include the refund amount, method, and expected timeline for the amount to reflect in your account.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Non-Returnable Items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="tech-glass-card p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <XCircle className="h-6 w-6 text-red-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Non-Returnable Items</h2>
              </div>
              
              <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 mb-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[#d6e4ff]/80">
                    The following items cannot be returned or refunded once purchased:
                  </p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-red-500/20 bg-[#020617]/50">
                  <h3 className="font-semibold text-white mb-2">Software & Digital Products</h3>
                  <p className="text-sm text-[#d6e4ff]/60">License keys, software downloads, digital content</p>
                </div>
                
                <div className="p-4 rounded-xl border border-red-500/20 bg-[#020617]/50">
                  <h3 className="font-semibold text-white mb-2">Personalized Items</h3>
                  <p className="text-sm text-[#d6e4ff]/60">Custom-made products, engraved items</p>
                </div>
                
                <div className="p-4 rounded-xl border border-red-500/20 bg-[#020617]/50">
                  <h3 className="font-semibold text-white mb-2">Hygiene Products</h3>
                  <p className="text-sm text-[#d6e4ff]/60">Personal care items, earphones (for hygiene reasons)</p>
                </div>
                
                <div className="p-4 rounded-xl border border-red-500/20 bg-[#020617]/50">
                  <h3 className="font-semibold text-white mb-2">Clearance Items</h3>
                  <p className="text-sm text-[#d6e4ff]/60">Items marked as "Final Sale" or "No Returns"</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Refund Timelines */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="tech-glass-card p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#00bfff]/10 border border-[#00bfff]/20 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-[#00bfff]" />
                </div>
                <h2 className="text-2xl font-bold text-white">Refund Timelines</h2>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-[#00bfff]/20 bg-[#020617]/50">
                  <h3 className="font-semibold text-white mb-2">Credit/Debit Cards</h3>
                  <p className="text-[#d6e4ff]/80">5-7 business days after processing</p>
                </div>
                
                <div className="p-4 rounded-xl border border-[#00bfff]/20 bg-[#020617]/50">
                  <h3 className="font-semibold text-white mb-2">Net Banking</h3>
                  <p className="text-[#d6e4ff]/80">5-7 business days after processing</p>
                </div>
                
                <div className="p-4 rounded-xl border border-[#00bfff]/20 bg-[#020617]/50">
                  <h3 className="font-semibold text-white mb-2">UPI</h3>
                  <p className="text-[#d6e4ff]/80">1-3 business days after processing</p>
                </div>
                
                <div className="p-4 rounded-xl border border-[#00bfff]/20 bg-[#020617]/50">
                  <h3 className="font-semibold text-white mb-2">Wallet Balance</h3>
                  <p className="text-[#d6e4ff]/80">Immediate credit after processing</p>
                </div>
                
                <div className="p-4 rounded-xl border border-[#00bfff]/20 bg-[#020617]/50">
                  <h3 className="font-semibold text-white mb-2">Cash on Delivery</h3>
                  <p className="text-[#d6e4ff]/80">7-10 business days via bank transfer</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Return Shipping */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="tech-glass-card p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#00bfff]/10 border border-[#00bfff]/20 flex items-center justify-center">
                  <RotateCcw className="h-6 w-6 text-[#00bfff]" />
                </div>
                <h2 className="text-2xl font-bold text-white">Return Shipping</h2>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-green-500/30 bg-green-500/10">
                  <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    Free Return Shipping
                  </h3>
                  <p className="text-[#d6e4ff]/80">
                    If the return is due to a defective product, wrong item delivered, or damage during transit, we cover the return shipping costs. We'll arrange a pickup from your location.
                  </p>
                </div>
                
                <div className="p-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10">
                  <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-400" />
                    Customer-Paid Returns
                  </h3>
                  <p className="text-[#d6e4ff]/80">
                    For returns due to change of mind, wrong size/color selection, or other reasons not related to product defects, the customer is responsible for return shipping costs. We recommend using a reliable courier service with tracking.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Exchange Policy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="tech-glass-card p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#00bfff]/10 border border-[#00bfff]/20 flex items-center justify-center">
                  <RotateCcw className="h-6 w-6 text-[#00bfff]" />
                </div>
                <h2 className="text-2xl font-bold text-white">Exchange Policy</h2>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-[#00bfff]/20 bg-[#020617]/50">
                  <h3 className="font-semibold text-white mb-2">Size/Color Exchange</h3>
                  <p className="text-[#d6e4ff]/80">
                    For apparel and accessories, we offer one-time size or color exchange within 7 days of delivery, subject to availability. The customer is responsible for return shipping costs.
                  </p>
                </div>
                
                <div className="p-4 rounded-xl border border-[#00bfff]/20 bg-[#020617]/50">
                  <h3 className="font-semibold text-white mb-2">Defective Item Exchange</h3>
                  <p className="text-[#d6e4ff]/80">
                    If you receive a defective item, we'll exchange it for a new one at no additional cost. We'll also cover return shipping for the defective item.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <div className="tech-glass-card p-6 md:p-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-3">Need Help with Returns?</h2>
              <p className="text-[#d6e4ff]/80 mb-6 max-w-xl mx-auto">
                If you have any questions about our return policy or need assistance with a return, our support team is here to help.
              </p>
              <a
                href="/contact"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#00bfff] to-[#00e5ff] px-8 py-3 font-semibold text-[#020617] transition-all hover:opacity-90 hover:shadow-[0_0_30px_rgba(0,191,255,0.3)]"
              >
                Contact Support
              </a>
            </div>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
