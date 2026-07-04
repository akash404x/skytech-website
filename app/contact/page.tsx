'use client';

import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Mail, Phone, MapPin, MessageCircle, Send } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success('Message sent successfully! We\'ll get back to you soon.');
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      } else {
        toast.error(result.error || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Contact form submission error:', error);
      toast.error('Failed to send message. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

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
                <MessageCircle className="h-10 w-10 text-[#020617]" />
              </div>
            </div>
            <h1 className="tech-heading-gradient text-4xl md:text-5xl font-bold mb-4">
              Contact Us
            </h1>
            <p className="text-xl text-[#d6e4ff]/80 max-w-2xl mx-auto">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="tech-glass-card p-6 md:p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Send us a Message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your full name"
                    className="tech-input w-full rounded-xl border border-[#00bfff]/20 bg-[#020617]/50 px-4 py-3 text-white placeholder-gray-500 focus:border-[#00bfff]/40 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter your email"
                    className="tech-input w-full rounded-xl border border-[#00bfff]/20 bg-[#020617]/50 px-4 py-3 text-white placeholder-gray-500 focus:border-[#00bfff]/40 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter your phone number"
                    className="tech-input w-full rounded-xl border border-[#00bfff]/20 bg-[#020617]/50 px-4 py-3 text-white placeholder-gray-500 focus:border-[#00bfff]/40 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Subject *</label>
                  <select
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="tech-input w-full rounded-xl border border-[#00bfff]/20 bg-[#020617]/50 px-4 py-3 text-white focus:border-[#00bfff]/40 focus:outline-none"
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="support">Product Support</option>
                    <option value="order">Order Related</option>
                    <option value="partnership">Business Partnership</option>
                    <option value="feedback">Feedback</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Message *</label>
                  <textarea
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Write your message here..."
                    rows={5}
                    className="tech-input w-full rounded-xl border border-[#00bfff]/20 bg-[#020617]/50 px-4 py-3 text-white placeholder-gray-500 focus:border-[#00bfff]/40 focus:outline-none resize-none"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl bg-gradient-to-r from-[#00bfff] to-[#00e5ff] px-6 py-3 font-semibold text-[#020617] transition-all hover:opacity-90 hover:shadow-[0_0_30px_rgba(0,191,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? 'Sending...' : (
                    <>
                      <Send className="h-5 w-5" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="space-y-6"
          >
            <div className="tech-glass-card p-6 md:p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Contact Information</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#00bfff]/10 border border-[#00bfff]/20 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-6 w-6 text-[#00bfff]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Phone</h3>
                    <p className="text-[#d6e4ff]/80">+91 8429372020</p>
                    <p className="text-sm text-[#d6e4ff]/60">Mon-Fri, 9AM-6PM IST</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#00bfff]/10 border border-[#00bfff]/20 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 text-[#00bfff]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Email</h3>
                    <a href="mailto:contact@theskytechnology.in" className="text-[#d6e4ff]/80 hover:text-[#00e5ff] transition-colors">
                      contact@theskytechnology.in
                    </a>
                    <p className="text-sm text-[#d6e4ff]/60">We reply within 24 hours</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#00bfff]/10 border border-[#00bfff]/20 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-[#00bfff]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Address</h3>
                    <p className="text-[#d6e4ff]/80">Prayagraj</p>
                    <p className="text-[#d6e4ff]/80">Uttar Pradesh, India</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="tech-glass-card p-6">
              <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <a
                  href="https://wa.me/918429372020"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 rounded-xl border border-green-500/30 bg-green-500/10 hover:bg-green-500/20 transition-colors"
                >
                  <MessageCircle className="h-5 w-5 text-green-400" />
                  <span className="text-white font-medium">Chat on WhatsApp</span>
                </a>
                
                <a
                  href="mailto:contact@theskytechnology.in"
                  className="flex items-center gap-3 p-4 rounded-xl border border-[#00bfff]/30 bg-[#00bfff]/10 hover:bg-[#00bfff]/20 transition-colors"
                >
                  <Mail className="h-5 w-5 text-[#00bfff]" />
                  <span className="text-white font-medium">Send Email</span>
                </a>
              </div>
            </div>

            {/* Google Maps */}
            <div className="tech-glass-card p-4 overflow-hidden rounded-2xl">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1448.123456789!2d81.8463!3d25.4358!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjXCsDI2JzA5LjAiTiA4McKwNTAnNDYuNyJF!5e0!3m2!1sen!2sin!4v1234567890"
                width="100%"
                height="250"
                style={{ border: 0, borderRadius: '12px' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="SkyTech Location"
              />
            </div>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
