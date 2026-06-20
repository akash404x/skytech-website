'use client';

import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { HelpCircle, Package, CreditCard, Truck, RotateCcw, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

const faqCategories = [
  {
    id: 'product',
    name: 'Product Help',
    icon: Package,
    color: 'cyan',
    faqs: [
      {
        question: 'How do I know which product is right for me?',
        answer: 'Each product page includes detailed specifications, features, and compatibility information. You can also contact our support team for personalized recommendations based on your needs.',
      },
      {
        question: 'Are your products genuine and authentic?',
        answer: 'Yes, all products sold on SkyTech are 100% genuine and sourced directly from authorized distributors. We provide warranty cards and proper documentation with every purchase.',
      },
      {
        question: 'Do you offer installation services?',
        answer: 'Currently, we don\'t offer installation services. However, our products come with detailed user manuals and setup guides. For complex installations, we can recommend trusted service providers in your area.',
      },
      {
        question: 'What if I receive a damaged or defective product?',
        answer: 'If you receive a damaged or defective product, please contact us within 48 hours of delivery. We\'ll arrange for a replacement or full refund, including return shipping costs.',
      },
    ],
  },
  {
    id: 'order',
    name: 'Order Help',
    icon: Package,
    color: 'blue',
    faqs: [
      {
        question: 'How can I track my order?',
        answer: 'Once your order is shipped, you\'ll receive an email with tracking information. You can also track your order from the "My Orders" section in your account dashboard.',
      },
      {
        question: 'Can I modify my order after placing it?',
        answer: 'Orders can be modified only within 1 hour of placement, provided they haven\'t been processed for shipping. Contact our support team immediately if you need to make changes.',
      },
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit/debit cards (Visa, MasterCard), UPI payments, net banking, and Cash on Delivery (COD) for eligible orders.',
      },
      {
        question: 'How do I cancel my order?',
        answer: 'Orders can be cancelled from the "My Orders" section before they are shipped. Note: Orders placed using coupon codes cannot be cancelled by customers and require support assistance.',
      },
    ],
  },
  {
    id: 'payment',
    name: 'Payment Help',
    icon: CreditCard,
    color: 'green',
    faqs: [
      {
        question: 'Is my payment information secure?',
        answer: 'Absolutely. We use industry-standard SSL encryption and partner with Razorpay, a PCI DSS compliant payment gateway, to ensure your payment information is completely secure.',
      },
      {
        question: 'Can I use my wallet balance for purchases?',
        answer: 'Yes, if you have wallet balance from refunds or credits, you can use it during checkout. The wallet amount will be automatically applied to your order total.',
      },
      {
        question: 'What if my payment fails?',
        answer: 'If your payment fails, please try again with a different payment method. If the issue persists, contact your bank or our support team. No amount is deducted from your account on failed transactions.',
      },
      {
        question: 'Do you offer EMI options?',
        answer: 'Yes, we offer EMI options on select credit cards and through partner financing services. EMI options are displayed during checkout for eligible orders.',
      },
    ],
  },
  {
    id: 'shipping',
    name: 'Shipping Help',
    icon: Truck,
    color: 'purple',
    faqs: [
      {
        question: 'What are your shipping charges?',
        answer: 'Shipping charges vary based on your location and order value. Orders above ₹999 may qualify for free shipping. Exact shipping costs are calculated during checkout.',
      },
      {
        question: 'How long does delivery take?',
        answer: 'Standard delivery takes 3-7 business days for most locations in India. Express delivery options are available for select pin codes with delivery in 1-3 business days.',
      },
      {
        question: 'Do you ship internationally?',
        answer: 'Currently, we only ship within India. We\'re working on expanding our international shipping capabilities and will announce when available.',
      },
      {
        question: 'What shipping partners do you use?',
        answer: 'We partner with reliable courier services including BlueDart, Delhivery, Ecom Express, and India Post to ensure safe and timely delivery.',
      },
    ],
  },
  {
    id: 'return',
    name: 'Return Help',
    icon: RotateCcw,
    color: 'orange',
    faqs: [
      {
        question: 'What is your return policy?',
        answer: 'We accept returns within 7 days of delivery for most products. Items must be unused, in original packaging, and accompanied by proof of purchase. Some categories like software and personalized items are non-returnable.',
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
];

export default function HelpCenterPage() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = faqCategories.map(category => ({
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
              Help Center
            </h1>
            <p className="text-xl text-[#d6e4ff]/80 max-w-2xl mx-auto mb-8">
              Find answers to your questions about products, orders, payments, shipping, and returns.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <input
                type="text"
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="tech-input w-full rounded-2xl border border-[#00bfff]/20 bg-[#020617]/50 px-6 py-4 text-white placeholder-gray-500 focus:border-[#00bfff]/40 focus:outline-none text-lg"
              />
            </div>
          </div>
        </motion.div>

        {/* FAQ Categories */}
        <div className="space-y-6 mb-12">
          {filteredCategories.map((category, categoryIndex) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
            >
              <div className="tech-glass-card overflow-hidden">
                <button
                  onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
                  className="w-full p-6 flex items-center justify-between hover:bg-[#00bfff]/5 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-${category.color}-500/10 border border-${category.color}-500/20 flex items-center justify-center`}>
                      <category.icon className={`h-6 w-6 text-${category.color}-400`} />
                    </div>
                    <h2 className="text-xl font-bold text-white">{category.name}</h2>
                  </div>
                  {expandedCategory === category.id ? (
                    <ChevronUp className="h-6 w-6 text-[#00bfff]" />
                  ) : (
                    <ChevronDown className="h-6 w-6 text-[#00bfff]" />
                  )}
                </button>
                
                {expandedCategory === category.id && (
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
                            onClick={() => setExpandedFaq(expandedFaq === `${category.id}-${faqIndex}` ? null : `${category.id}-${faqIndex}`)}
                            className="w-full p-4 text-left flex items-center justify-between hover:bg-[#00bfff]/5 transition-colors"
                          >
                            <span className="font-medium text-white">{faq.question}</span>
                            {expandedFaq === `${category.id}-${faqIndex}` ? (
                              <ChevronUp className="h-5 w-5 text-[#00bfff] flex-shrink-0 ml-4" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-[#00bfff] flex-shrink-0 ml-4" />
                            )}
                          </button>
                          {expandedFaq === `${category.id}-${faqIndex}` && (
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

        {/* Contact Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="tech-glass-card p-6 md:p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00bfff] to-[#00e5ff] flex items-center justify-center">
                <MessageCircle className="h-8 w-8 text-[#020617]" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Still Need Help?</h2>
            <p className="text-[#d6e4ff]/80 mb-6 max-w-xl mx-auto">
              Can't find the answer you're looking for? Our support team is here to help you.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#00bfff] to-[#00e5ff] px-8 py-3 font-semibold text-[#020617] transition-all hover:opacity-90 hover:shadow-[0_0_30px_rgba(0,191,255,0.3)]"
            >
              <MessageCircle className="h-5 w-5" />
              Contact Support
            </a>
          </div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
}
