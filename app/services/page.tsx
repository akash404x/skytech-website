'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Cpu, Bot, Home, Wrench, Code, CircuitBoard, GraduationCap, Briefcase, MessageSquare, CheckCircle } from 'lucide-react';

const services = [
  {
    id: 1,
    title: 'IoT Project Development',
    description: 'Complete IoT solutions from concept to deployment. We build smart devices, sensor networks, and connected systems.',
    price: 'Starting ₹5,000',
    icon: Cpu,
    category: 'IoT',
    featured: true,
    features: ['Hardware Integration', 'Cloud Connectivity', 'Mobile App Development', 'Real-time Monitoring']
  },
  {
    id: 2,
    title: 'Arduino Programming',
    description: 'Expert Arduino programming services for your projects. From simple automation to complex control systems.',
    price: 'Starting ₹2,000',
    icon: Code,
    category: 'Programming',
    featured: true,
    features: ['Custom Code Development', 'Library Integration', 'Debugging & Optimization', 'Documentation']
  },
  {
    id: 3,
    title: 'Robotics Projects',
    description: 'Build custom robots for education, research, or industrial applications. We handle mechanical design, electronics, and programming.',
    price: 'Starting ₹10,000',
    icon: Bot,
    category: 'Robotics',
    featured: true,
    features: ['Custom Robot Design', 'Motor Control Systems', 'Sensor Integration', 'Path Planning']
  },
  {
    id: 4,
    title: 'PCB Designing',
    description: 'Professional PCB design services for your electronic projects. From schematic to manufacturing-ready files.',
    price: 'Starting ₹3,000',
    icon: CircuitBoard,
    category: 'Electronics',
    featured: false,
    features: ['Schematic Design', 'PCB Layout', 'Gerber Files', 'BOM Creation']
  },
  {
    id: 5,
    title: 'Smart Home Automation',
    description: 'Transform your home into a smart home with our automation solutions. Control lights, appliances, and security systems.',
    price: 'Starting ₹8,000',
    icon: Home,
    category: 'IoT',
    featured: true,
    features: ['Lighting Control', 'Climate Control', 'Security Systems', 'Voice Integration']
  },
  {
    id: 6,
    title: 'Raspberry Pi Setup',
    description: 'Complete Raspberry Pi configuration and setup services. From basic setup to complex projects.',
    price: 'Starting ₹1,500',
    icon: Cpu,
    category: 'SBC',
    featured: false,
    features: ['OS Installation', 'Network Configuration', 'Project Setup', 'Remote Access']
  },
  {
    id: 7,
    title: 'Embedded Systems',
    description: 'Custom embedded system development for industrial and consumer applications. Microcontroller programming and hardware design.',
    price: 'Starting ₹7,000',
    icon: Wrench,
    category: 'Embedded',
    featured: false,
    features: ['Firmware Development', 'Hardware Design', 'Testing & Validation', 'Production Support']
  },
  {
    id: 8,
    title: 'College/School Projects',
    description: 'Academic project assistance for electronics, robotics, and IoT projects. Guidance from concept to completion.',
    price: 'Starting ₹3,000',
    icon: GraduationCap,
    category: 'Education',
    featured: false,
    features: ['Project Guidance', 'Documentation', 'Presentation Support', 'Hardware Assembly']
  },
  {
    id: 9,
    title: 'Website Development',
    description: 'Professional website development services for your business or portfolio. Modern, responsive, and SEO-friendly.',
    price: 'Starting ₹5,000',
    icon: Code,
    category: 'Web',
    featured: false,
    features: ['Responsive Design', 'SEO Optimization', 'E-commerce Integration', 'Maintenance']
  },
  {
    id: 10,
    title: 'Technical Consulting',
    description: 'Expert technical consulting for your electronics and IoT projects. Get guidance from industry professionals.',
    price: 'Starting ₹1,000/hour',
    icon: MessageSquare,
    category: 'Consulting',
    featured: false,
    features: ['Project Planning', 'Technical Feasibility', 'Architecture Design', 'Best Practices']
  },
];

export default function ServicesPage() {
  const featuredServices = services.filter(s => s.featured);
  const regularServices = services.filter(s => !s.featured);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Professional Tech Services</h1>
          <p className="text-xl md:text-2xl opacity-90 mb-8">
            Expert solutions for Arduino, IoT, Robotics, and Electronics projects
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-yellow-400 hover:text-blue-900 transition-all">
              Get Started
            </button>
            <button className="border-2 border-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-blue-600 transition-all">
              Contact Us
            </button>
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Services</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our most popular services trusted by students, hobbyists, and professionals
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredServices.map((service) => {
              const Icon = service.icon;
              return (
                <div
                  key={service.id}
                  className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border-2 border-blue-200 hover:border-blue-400"
                >
                  <div className="bg-blue-600 text-white p-3 rounded-xl w-fit mb-4">
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <p className="text-2xl font-bold text-blue-600 mb-4">{service.price}</p>
                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition-all">
                    Inquire Now
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* All Services */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">All Services</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Comprehensive solutions for all your electronics and tech needs
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {regularServices.map((service) => {
              const Icon = service.icon;
              return (
                <div
                  key={service.id}
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all border border-gray-200 hover:border-blue-300"
                >
                  <div className="bg-gray-100 text-blue-600 p-3 rounded-xl w-fit mb-4">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{service.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{service.description}</p>
                  <p className="text-lg font-semibold text-blue-600 mb-3">{service.price}</p>
                  <button className="w-full bg-gray-100 hover:bg-blue-600 hover:text-white text-gray-700 py-2 rounded-lg font-medium transition-all text-sm">
                    Learn More
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Need a Custom Solution?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Contact us for a free consultation. We'll help you find the perfect solution for your project.
          </p>
          <button className="bg-white text-purple-600 px-8 py-3 rounded-full font-semibold hover:bg-yellow-400 hover:text-purple-900 transition-all">
            Get Free Consultation
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
