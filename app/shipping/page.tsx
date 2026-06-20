'use client';

import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Truck, Clock, MapPin, Package, CheckCircle, AlertCircle } from 'lucide-react';

export default function ShippingPolicyPage() {
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
                <Truck className="h-10 w-10 text-[#020617]" />
              </div>
            </div>
            <h1 className="tech-heading-gradient text-4xl md:text-5xl font-bold mb-4">
              Shipping Policy
            </h1>
            <p className="text-xl text-[#d6e4ff]/80 max-w-2xl mx-auto">
              Everything you need to know about shipping, delivery, and tracking your orders.
            </p>
          </div>
        </motion.div>

        <div className="grid gap-8 mb-12">
          {/* Processing Times */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="tech-glass-card p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#00bfff]/10 border border-[#00bfff]/20 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-[#00bfff]" />
                </div>
                <h2 className="text-2xl font-bold text-white">Processing Times</h2>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-[#00bfff]/20 bg-[#020617]/50">
                  <h3 className="font-semibold text-white mb-2">Order Processing</h3>
                  <p className="text-[#d6e4ff]/80">
                    Orders are typically processed within 1-2 business days. During peak seasons or sales, processing may take up to 3 business days.
                  </p>
                </div>
                
                <div className="p-4 rounded-xl border border-[#00bfff]/20 bg-[#020617]/50">
                  <h3 className="font-semibold text-white mb-2">Verification Period</h3>
                  <p className="text-[#d6e4ff]/80">
                    For certain high-value items, additional verification may be required before shipping. This can add 1-2 business days to processing time.
                  </p>
                </div>
                
                <div className="p-4 rounded-xl border border-[#00bfff]/20 bg-[#020617]/50">
                  <h3 className="font-semibold text-white mb-2">Order Confirmation</h3>
                  <p className="text-[#d6e4ff]/80">
                    You will receive an email confirmation once your order is processed and shipped, including tracking information.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Delivery Estimates */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="tech-glass-card p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#00bfff]/10 border border-[#00bfff]/20 flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-[#00bfff]" />
                </div>
                <h2 className="text-2xl font-bold text-white">Delivery Estimates</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-green-500/30 bg-green-500/10">
                  <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    Metro Cities
                  </h3>
                  <p className="text-[#d6e4ff]/80">2-4 business days</p>
                  <p className="text-sm text-[#d6e4ff]/60 mt-1">Delhi, Mumbai, Bangalore, Chennai, Hyderabad, Kolkata, etc.</p>
                </div>
                
                <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/10">
                  <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-400" />
                    Tier-2 Cities
                  </h3>
                  <p className="text-[#d6e4ff]/80">3-5 business days</p>
                  <p className="text-sm text-[#d6e4ff]/60 mt-1">State capitals and major cities</p>
                </div>
                
                <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-500/10">
                  <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-purple-400" />
                    Tier-3 Cities
                  </h3>
                  <p className="text-[#d6e4ff]/80">4-7 business days</p>
                  <p className="text-sm text-[#d6e4ff]/60 mt-1">Other cities and towns</p>
                </div>
                
                <div className="p-4 rounded-xl border border-orange-500/30 bg-orange-500/10">
                  <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-orange-400" />
                    Remote Areas
                  </h3>
                  <p className="text-[#d6e4ff]/80">7-10 business days</p>
                  <p className="text-sm text-[#d6e4ff]/60 mt-1">Villages and remote locations</p>
                </div>
              </div>
              
              <div className="mt-6 p-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-white mb-1">Important Note</h3>
                    <p className="text-sm text-[#d6e4ff]/80">
                      Delivery times are estimates and may vary due to weather conditions, holidays, or other unforeseen circumstances. We strive to meet all delivery estimates but cannot guarantee exact delivery dates.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Shipping Partners */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="tech-glass-card p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#00bfff]/10 border border-[#00bfff]/20 flex items-center justify-center">
                  <Package className="h-6 w-6 text-[#00bfff]" />
                </div>
                <h2 className="text-2xl font-bold text-white">Shipping Partners</h2>
              </div>
              
              <p className="text-[#d6e4ff]/80 mb-6">
                We partner with India's leading courier services to ensure safe and timely delivery of your orders.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border border-[#00bfff]/20 bg-[#020617]/50 text-center">
                  <p className="font-semibold text-white">BlueDart</p>
                  <p className="text-xs text-[#d6e4ff]/60 mt-1">Express Delivery</p>
                </div>
                <div className="p-4 rounded-xl border border-[#00bfff]/20 bg-[#020617]/50 text-center">
                  <p className="font-semibold text-white">Delhivery</p>
                  <p className="text-xs text-[#d6e4ff]/60 mt-1">Pan-India Coverage</p>
                </div>
                <div className="p-4 rounded-xl border border-[#00bfff]/20 bg-[#020617]/50 text-center">
                  <p className="font-semibold text-white">Ecom Express</p>
                  <p className="text-xs text-[#d6e4ff]/60 mt-1">Reliable Service</p>
                </div>
                <div className="p-4 rounded-xl border border-[#00bfff]/20 bg-[#020617]/50 text-center">
                  <p className="font-semibold text-white">India Post</p>
                  <p className="text-xs text-[#d6e4ff]/60 mt-1">Remote Areas</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tracking Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="tech-glass-card p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#00bfff]/10 border border-[#00bfff]/20 flex items-center justify-center">
                  <Truck className="h-6 w-6 text-[#00bfff]" />
                </div>
                <h2 className="text-2xl font-bold text-white">Tracking Information</h2>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-[#00bfff]/20 bg-[#020617]/50">
                  <h3 className="font-semibold text-white mb-2">How to Track Your Order</h3>
                  <ol className="space-y-2 text-[#d6e4ff]/80 list-decimal list-inside">
                    <li>Log in to your SkyTech account</li>
                    <li>Navigate to "My Orders" section</li>
                    <li>Click on the order you want to track</li>
                    <li>Click the "Track Order" button</li>
                    <li>You'll be redirected to the courier's tracking page</li>
                  </ol>
                </div>
                
                <div className="p-4 rounded-xl border border-[#00bfff]/20 bg-[#020617]/50">
                  <h3 className="font-semibold text-white mb-2">Tracking Updates</h3>
                  <p className="text-[#d6e4ff]/80">
                    You'll receive email and SMS notifications at key stages: when your order is shipped, out for delivery, and delivered. You can also check real-time status in your account.
                  </p>
                </div>
                
                <div className="p-4 rounded-xl border border-[#00bfff]/20 bg-[#020617]/50">
                  <h3 className="font-semibold text-white mb-2">Tracking Not Working?</h3>
                  <p className="text-[#d6e4ff]/80">
                    If tracking information is not available within 24 hours of receiving the shipping confirmation email, please contact our support team at contact@theskytechnology.in
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* International Shipping */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="tech-glass-card p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#00bfff]/10 border border-[#00bfff]/20 flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-[#00bfff]" />
                </div>
                <h2 className="text-2xl font-bold text-white">International Shipping</h2>
              </div>
              
              <div className="p-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-white mb-1">Currently Not Available</h3>
                    <p className="text-[#d6e4ff]/80">
                      We currently ship only within India. We're actively working on expanding our international shipping capabilities and will announce when international shipping becomes available. Subscribe to our newsletter to stay updated.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Shipping Charges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="tech-glass-card p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#00bfff]/10 border border-[#00bfff]/20 flex items-center justify-center">
                  <Package className="h-6 w-6 text-[#00bfff]" />
                </div>
                <h2 className="text-2xl font-bold text-white">Shipping Charges</h2>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-green-500/30 bg-green-500/10">
                  <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    Free Shipping
                  </h3>
                  <p className="text-[#d6e4ff]/80">
                    Orders above ₹999 qualify for free standard shipping across India.
                  </p>
                </div>
                
                <div className="p-4 rounded-xl border border-[#00bfff]/20 bg-[#020617]/50">
                  <h3 className="font-semibold text-white mb-2">Standard Shipping</h3>
                  <p className="text-[#d6e4ff]/80">
                    Orders below ₹999: ₹80 shipping charge
                  </p>
                </div>
                
                <div className="p-4 rounded-xl border border-[#00bfff]/20 bg-[#020617]/50">
                  <h3 className="font-semibold text-white mb-2">Express Shipping</h3>
                  <p className="text-[#d6e4ff]/80">
                    Available for select locations: ₹150-200 additional charge
                  </p>
                </div>
                
                <div className="p-4 rounded-xl border border-[#00bfff]/20 bg-[#020617]/50">
                  <h3 className="font-semibold text-white mb-2">COD Charges</h3>
                  <p className="text-[#d6e4ff]/80">
                    Additional ₹50 charge for Cash on Delivery orders
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
