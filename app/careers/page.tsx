'use client';

import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Briefcase, Mail, Users, Target, Zap, GraduationCap } from 'lucide-react';

export default function CareersPage() {
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
                <Briefcase className="h-10 w-10 text-[#020617]" />
              </div>
            </div>
            <h1 className="tech-heading-gradient text-4xl md:text-5xl font-bold mb-4">
              Careers at SkyTech
            </h1>
            <p className="text-xl text-[#d6e4ff]/80 max-w-2xl mx-auto">
              Build the future with us. Join a team that's passionate about innovation, technology, and making a difference.
            </p>
          </div>
        </motion.div>

        {/* Current Openings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-12"
        >
          <div className="tech-glass-card p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#00bfff]/10 border border-[#00bfff]/20 flex items-center justify-center">
                <Users className="h-6 w-6 text-[#00bfff]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Current Openings</h2>
                <p className="text-sm text-[#d6e4ff]/60">No positions available at the moment</p>
              </div>
            </div>
            
            <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-6 text-center">
              <Zap className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Current Openings</h3>
              <p className="text-[#d6e4ff]/80 mb-4">
                We're not actively hiring right now, but we're always looking for talented individuals who share our passion.
              </p>
              <p className="text-sm text-[#d6e4ff]/60">
                Check back later or send us your resume for future opportunities.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Internship Opportunities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mb-12"
        >
          <div className="tech-glass-card p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#00bfff]/10 border border-[#00bfff]/20 flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-[#00bfff]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Internship Opportunities</h2>
                <p className="text-sm text-[#d6e4ff]/60">Learn and grow with us</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="rounded-2xl border border-[#00bfff]/30 bg-[#00bfff]/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Why Intern at SkyTech?</h3>
                <ul className="space-y-2 text-[#d6e4ff]/80">
                  <li className="flex items-start gap-2">
                    <span className="text-[#00e5ff] mt-1">•</span>
                    <span>Hands-on experience with real projects</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#00e5ff] mt-1">•</span>
                    <span>Mentorship from experienced professionals</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#00e5ff] mt-1">•</span>
                    <span>Exposure to cutting-edge technologies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#00e5ff] mt-1">•</span>
                    <span>Certificate of completion</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#00e5ff] mt-1">•</span>
                    <span>Potential for full-time opportunities</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Available Internship Areas</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-[#020617]/50 border border-cyan-500/20">
                    <span className="text-cyan-300">Web Development</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#020617]/50 border border-cyan-500/20">
                    <span className="text-cyan-300">Mobile Development</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#020617]/50 border border-cyan-500/20">
                    <span className="text-cyan-300">UI/UX Design</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#020617]/50 border border-cyan-500/20">
                    <span className="text-cyan-300">Digital Marketing</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Why Join Us */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-12"
        >
          <div className="tech-glass-card p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#00bfff]/10 border border-[#00bfff]/20 flex items-center justify-center">
                <Target className="h-6 w-6 text-[#00bfff]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Why Join SkyTech?</h2>
                <p className="text-sm text-[#d6e4ff]/60">Be part of something extraordinary</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-[#00bfff]/20 bg-[#020617]/50">
                <h3 className="font-semibold text-white mb-2">Innovation First</h3>
                <p className="text-sm text-[#d6e4ff]/70">Work on cutting-edge projects that push the boundaries of technology.</p>
              </div>
              <div className="p-4 rounded-2xl border border-[#00bfff]/20 bg-[#020617]/50">
                <h3 className="font-semibold text-white mb-2">Growth Opportunities</h3>
                <p className="text-sm text-[#d6e4ff]/70">Continuous learning and career advancement in a supportive environment.</p>
              </div>
              <div className="p-4 rounded-2xl border border-[#00bfff]/20 bg-[#020617]/50">
                <h3 className="font-semibold text-white mb-2">Collaborative Culture</h3>
                <p className="text-sm text-[#d6e4ff]/70">Work with talented individuals who inspire and challenge each other.</p>
              </div>
              <div className="p-4 rounded-2xl border border-[#00bfff]/20 bg-[#020617]/50">
                <h3 className="font-semibold text-white mb-2">Impactful Work</h3>
                <p className="text-sm text-[#d6e4ff]/70">Build products that make a real difference in people's lives.</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Join Our Team Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mb-12"
        >
          <div className="tech-glass-card p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#00bfff]/10 border border-[#00bfff]/20 flex items-center justify-center">
                <Mail className="h-6 w-6 text-[#00bfff]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Join Our Team</h2>
                <p className="text-sm text-[#d6e4ff]/60">Send us your resume</p>
              </div>
            </div>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Full Name</label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  className="tech-input w-full rounded-xl border border-[#00bfff]/20 bg-[#020617]/50 px-4 py-3 text-white placeholder-gray-500 focus:border-[#00bfff]/40 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">Email Address</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="tech-input w-full rounded-xl border border-[#00bfff]/20 bg-[#020617]/50 px-4 py-3 text-white placeholder-gray-500 focus:border-[#00bfff]/40 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">Phone Number</label>
                <input
                  type="tel"
                  placeholder="Enter your phone number"
                  className="tech-input w-full rounded-xl border border-[#00bfff]/20 bg-[#020617]/50 px-4 py-3 text-white placeholder-gray-500 focus:border-[#00bfff]/40 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">Position of Interest</label>
                <select className="tech-input w-full rounded-xl border border-[#00bfff]/20 bg-[#020617]/50 px-4 py-3 text-white focus:border-[#00bfff]/40 focus:outline-none">
                  <option value="">Select a position</option>
                  <option value="intern">Internship</option>
                  <option value="fulltime">Full-time</option>
                  <option value="parttime">Part-time</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">Resume (PDF)</label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf"
                    className="tech-input w-full rounded-xl border border-[#00bfff]/20 bg-[#020617]/50 px-4 py-3 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#00bfff]/10 file:text-[#00e5ff] file:cursor-pointer focus:border-[#00bfff]/40 focus:outline-none"
                  />
                </div>
                <p className="text-xs text-[#d6e4ff]/60 mt-1">Maximum file size: 5MB</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">Cover Letter (Optional)</label>
                <textarea
                  placeholder="Tell us about yourself and why you want to join SkyTech"
                  rows={4}
                  className="tech-input w-full rounded-xl border border-[#00bfff]/20 bg-[#020617]/50 px-4 py-3 text-white placeholder-gray-500 focus:border-[#00bfff]/40 focus:outline-none resize-none"
                />
              </div>
              
              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-[#00bfff] to-[#00e5ff] px-6 py-3 font-semibold text-[#020617] transition-all hover:opacity-90 hover:shadow-[0_0_30px_rgba(0,191,255,0.3)]"
              >
                Submit Application
              </button>
            </form>
            
            <div className="mt-6 p-4 rounded-xl border border-[#00bfff]/10 bg-[#020617]/30">
              <p className="text-sm text-[#d6e4ff]/80 text-center">
                Or email your resume directly to{' '}
                <a href="mailto:contact@theskytechnology.in" className="text-[#00e5ff] hover:underline">
                  contact@theskytechnology.in
                </a>
              </p>
            </div>
          </div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
}
