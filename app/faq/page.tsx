'use client';

import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { HelpCircle, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { useState } from 'react';

const faqData = [
  {
    category: 'General',
    faqs: [
      {
        question: 'What is SkyTech?',
        answer: 'SkyTech is a technology company specializing in advanced electronics, IoT solutions, and innovative digital experiences. We provide cutting-edge products and services to help businesses and individuals embrace the future of technology.',
      },
      {
        question: 'Where is SkyTech located?',
        answer: 'SkyTech is headquartered in Prayagraj, Uttar Pradesh, India. We serve customers across India through our online platform.',
      },
      {
        question: 'How can I contact SkyTech?',
        answer: 'You can reach us through our contact page, email us at contact@theskytechnology.in, or call us at +91 8429372020. Our support team is available Monday-Friday, 9AM-6PM IST.',
      },
    ],
  },
  {
    category: 'Products',
    faqs: [
      {
        question: 'Are your products genuine?',
        answer: 'Yes, all products sold on SkyTech are 100% genuine and sourced directly from authorized distributors. We provide warranty cards and proper documentation with every purchase.',
      },
      {
        question: 'Do you offer warranty on products?',
        answer: 'Yes, most products come with manufacturer warranty. The warranty period varies by product and is mentioned on the product page. We also assist with warranty claims.',
      },
      {
        question: 'Can I get technical support for products?',
        answer: 'Yes, we provide technical support for all products purchased from SkyTech. You can contact our support team through the Help Center or by email.',
      },
    ],
  },
  {
    category: 'Orders',
    faqs: [
      {
        question: 'How do I place an order?',
        answer: 'Browse our products, add items to your cart, proceed to checkout, fill in shipping details, select payment method, and complete the payment. You\'ll receive an order confirmation email.',
      },
      {
        question: 'How can I track my order?',
        answer: 'Once your order is shipped, you\'ll receive an email with tracking information. You can also track your order from the "My Orders" section in your account.',
      },
      {
        question: 'Can I cancel my order?',
        answer: 'Orders can be cancelled from the "My Orders" section before they are shipped. Note: Orders placed using coupon codes cannot be cancelled by customers and require support assistance.',
      },
      {
        question: 'What if I receive a wrong or damaged product?',
        answer: 'If you receive a wrong or damaged product, contact us within 48 hours of delivery. We\'ll arrange for a free replacement or full refund, including return shipping.',
      },
    ],
  },
  {
    category: 'Payments',
    faqs: [
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit/debit cards (Visa, MasterCard), UPI payments, net banking, and Cash on Delivery (COD) for eligible orders.',
      },
      {
        question: 'Is my payment information secure?',
        answer: 'Absolutely. We use industry-standard SSL encryption and partner with Razorpay, a PCI DSS compliant payment gateway, to ensure your payment information is completely secure.',
      },
      {
        question: 'Can I use my wallet balance?',
        answer: 'Yes, if you have wallet balance from refunds or credits, you can use it during checkout. The wallet amount will be automatically applied to your order total.',
      },
      {
        question: 'Do you offer EMI options?',
        answer: 'Yes, we offer EMI options on select credit cards and through partner financing services. EMI options are displayed during checkout for eligible orders.',
      },
    ],
  },
  {
    category: 'Shipping',
    faqs: [
      {
        question: 'What are your shipping charges?',
        answer: 'Shipping charges vary based on your location and order value. Orders above ₹999 may qualify for free shipping. Exact shipping costs are calculated during checkout.',
      },
      {
        question: 'How long does delivery take?',
        answer: 'Standard delivery takes 3-7 business days for most locations in India. Metro cities typically receive orders in 2-4 business days.',
      },
      {
        question: 'Do you ship internationally?',
        answer: 'Currently, we only ship within India. We\'re working on expanding our international shipping capabilities.',
      },
      {
        question: 'What if I\'m not available when the delivery arrives?',
        answer: 'The courier will attempt delivery 2-3 times. If you\'re unavailable, you can contact the courier directly to reschedule or collect from their local office.',
      },
    ],
  },
  {
    category: 'Returns & Refunds',
    faqs: [
      {
        question: 'What is your return policy?',
        answer: 'We accept returns within 7 days of delivery for most products. Items must be unused, in original packaging, and accompanied by proof of purchase.',
      },
      {
        question: 'How do I initiate a return?',
        answer: 'Go to "My Orders", select the order you want to return, and click on "Return Order". Fill in the reason and submit. Our team will review and approve your return request.',
      },
      {
        question: 'How are refunds processed?',
        answer: 'Refunds are processed within 5-7 business days after we receive and inspect the returned item. The amount is credited to your original payment method or wallet balance.',
      },
      {
        question: 'Who pays for return shipping?',
        answer: 'If the return is due to a defective or wrong product, we cover return shipping. For other returns, the customer is responsible for return shipping costs.',
      },
    ],
  },
  {
    category: 'Account',
    faqs: [
      {
        question: 'How do I create an account?',
        answer: 'Click on "Sign Up" in the top right corner, fill in your details, and verify your email. You can also sign up using Google for quick registration.',
      },
      {
        question: 'What are the benefits of creating an account?',
        answer: 'With an account, you can track orders, save addresses, view order history, manage wallet balance, and receive exclusive offers and discounts.',
      },
      {
        question: 'I forgot my password. What should I do?',
        answer: 'Click on "Forgot Password" on the login page, enter your email, and we\'ll send you a password reset link. Follow the instructions to reset your password.',
      },
      {
        question: 'Can I delete my account?',
        answer: 'Yes, you can request account deletion from your profile settings or by contacting our support team. Note that account deletion is permanent and cannot be undone.',
      },
    ],
  },
];

export default function FAQPage() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = faqData.map(category => ({
    ...category,
    faqs: category.faqs.filter(faq =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(category => category.faqs.length > 0);

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
                <HelpCircle className="h-10 w-10 text-[#020617]" />
              </div>
            </div>
            <h1 className="tech-heading-gradient text-4xl md:text-5xl font-bold mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-[#d6e4ff]/80 max-w-2xl mx-auto mb-8">
              Find answers to common questions about SkyTech products, services, and policies.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#00bfff]" />
              <input
                type="text"
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="tech-input w-full rounded-2xl border border-[#00bfff]/20 bg-[#020617]/50 pl-12 pr-6 py-4 text-white placeholder-gray-500 focus:border-[#00bfff]/40 focus:outline-none text-lg"
              />
            </div>
          </div>
        </motion.div>

        {/* FAQ Categories */}
        <div className="space-y-6 mb-12">
          {filteredData.map((category, categoryIndex) => (
            <motion.div
              key={category.category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
            >
              <div className="tech-glass-card overflow-hidden">
                <button
                  onClick={() => setExpandedCategory(expandedCategory === category.category ? null : category.category)}
                  className="w-full p-6 flex items-center justify-between hover:bg-[#00bfff]/5 transition-colors"
                >
                  <h2 className="text-xl font-bold text-white">{category.category}</h2>
                  {expandedCategory === category.category ? (
                    <ChevronUp className="h-6 w-6 text-[#00bfff]" />
                  ) : (
                    <ChevronDown className="h-6 w-6 text-[#00bfff]" />
                  )}
                </button>
                
                {expandedCategory === category.category && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-[#00bfff]/10"
                  >
                    <div className="p-6 space-y-4">
                      {category.faqs.map((faq, faqIndex) => (
                        <div key={faqIndex} className="border border-[#00bfff]/10 rounded-xl overflow-hidden">
                          <button
                            onClick={() => setExpandedFaq(expandedFaq === `${category.category}-${faqIndex}` ? null : `${category.category}-${faqIndex}`)}
                            className="w-full p-4 text-left flex items-center justify-between hover:bg-[#00bfff]/5 transition-colors"
                          >
                            <span className="font-medium text-white">{faq.question}</span>
                            {expandedFaq === `${category.category}-${faqIndex}` ? (
                              <ChevronUp className="h-5 w-5 text-[#00bfff] flex-shrink-0 ml-4" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-[#00bfff] flex-shrink-0 ml-4" />
                            )}
                          </button>
                          {expandedFaq === `${category.category}-${faqIndex}` && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="p-4 pt-0 text-[#d6e4ff]/80 border-t border-[#00bfff]/10"
                            >
                              {faq.answer}
                            </motion.div>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Still Have Questions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="tech-glass-card p-6 md:p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-3">Still Have Questions?</h2>
            <p className="text-[#d6e4ff]/80 mb-6 max-w-xl mx-auto">
              Can't find the answer you're looking for? Our support team is here to help you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/help-center"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00bfff] to-[#00e5ff] px-8 py-3 font-semibold text-[#020617] transition-all hover:opacity-90 hover:shadow-[0_0_30px_rgba(0,191,255,0.3)]"
              >
                Visit Help Center
              </a>
              <a
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#00bfff]/30 bg-[#00bfff]/10 px-8 py-3 font-semibold text-[#00e5ff] transition-all hover:bg-[#00bfff]/20"
              >
                Contact Us
              </a>
            </div>
          </div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
}
