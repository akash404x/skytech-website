'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Mail, Zap, Cpu, Lightbulb, Gift, Rocket, Loader2, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function SubscribePage() {
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

  const benefits = [
    {
      icon: Zap,
      title: 'Latest Product Updates',
      description: 'Be the first to know about new Arduino boards, sensors, and IoT modules',
    },
    {
      icon: Lightbulb,
      title: 'Arduino Tutorials',
      description: 'Step-by-step guides and project tutorials for all skill levels',
    },
    {
      icon: Cpu,
      title: 'IoT Project Ideas',
      description: 'Innovative project ideas to spark your creativity and learning',
    },
    {
      icon: Gift,
      title: 'Exclusive Offers',
      description: 'Special discounts and deals available only to subscribers',
    },
    {
      icon: Rocket,
      title: 'Early Access',
      description: 'Get early access to new products and limited edition items',
    },
  ];

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
                  <Mail className="w-12 h-12 text-[#020617]" />
                </div>
              </div>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="tech-heading-gradient text-5xl md:text-6xl font-bold mb-4"
            >
              Subscribe to Sky Tech
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-xl text-[#d6e4ff]/80 max-w-2xl mx-auto mb-8"
            >
              Stay updated with the latest in electronics, Arduino projects, IoT innovations, and exclusive offers
            </motion.p>
          </div>
        </motion.div>

        {/* Subscription Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="max-w-2xl mx-auto mb-16"
        >
          <div className="tech-glass-card p-8 md:p-12">
            <h2 className="text-2xl font-bold text-white mb-4 text-center">
              Join Our Newsletter
            </h2>
            <p className="text-[#d6e4ff]/70 text-center mb-8">
              Enter your email below to subscribe and never miss an update
            </p>
            
            <form onSubmit={handleSubscribe} className="space-y-4">
              <div>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={subscribing}
                  className="w-full px-6 py-4 rounded-xl bg-slate-900/50 border border-[#00bfff]/20 text-white placeholder-gray-500 focus:border-[#00bfff]/40 focus:outline-none text-lg disabled:opacity-50"
                />
              </div>
              <button
                type="submit"
                disabled={subscribing}
                className="w-full rounded-xl bg-gradient-to-r from-[#00bfff] to-[#00e5ff] text-[#020617] font-bold py-4 text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {subscribing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Subscribing...
                  </>
                ) : (
                  <>
                    Subscribe Now
                    <Mail className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>

            <p className="text-xs text-[#d6e4ff]/50 text-center mt-6">
              By subscribing, you agree to receive marketing emails from Sky Tech. You can unsubscribe at any time.
            </p>
          </div>
        </motion.div>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">What You'll Get</h2>
            <p className="text-[#d6e4ff]/70 max-w-2xl mx-auto">
              Join thousands of electronics enthusiasts who stay ahead with our newsletter
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                  className="tech-glass-card p-6 hover:border-[#00bfff]/50 transition-all"
                >
                  <div className="mb-4 inline-flex rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-600 p-3 shadow-lg">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{benefit.title}</h3>
                  <p className="text-[#d6e4ff]/70 text-sm">{benefit.description}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Privacy Assurance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="max-w-3xl mx-auto mb-16"
        >
          <div className="tech-glass-card p-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                  <Check className="h-6 w-6 text-green-400" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Your Privacy Matters</h3>
                <p className="text-[#d6e4ff]/70">
                  We respect your privacy and will never share your email address with third parties. 
                  You can unsubscribe from our newsletter at any time with a single click. 
                  Read our <a href="/privacy-policy" className="text-cyan-400 hover:text-cyan-300 underline">Privacy Policy</a> for more details.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
}
