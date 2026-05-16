'use client';

import Link from 'next/link';
import { Cpu, Bot, Home, Wrench, Code, CircuitBoard, ArrowRight } from 'lucide-react';

const services = [
  {
    id: 1,
    title: 'IoT Project Development',
    description: 'Complete IoT solutions from concept to deployment',
    icon: Cpu,
    price: 'Starting ₹5,000'
  },
  {
    id: 2,
    title: 'Arduino Programming',
    description: 'Expert Arduino programming for your projects',
    icon: Code,
    price: 'Starting ₹2,000'
  },
  {
    id: 3,
    title: 'Robotics Projects',
    description: 'Custom robots for education and industry',
    icon: Bot,
    price: 'Starting ₹10,000'
  },
  {
    id: 4,
    title: 'PCB Designing',
    description: 'Professional PCB design services',
    icon: CircuitBoard,
    price: 'Starting ₹3,000'
  },
  {
    id: 5,
    title: 'Smart Home Automation',
    description: 'Transform your home into a smart home',
    icon: Home,
    price: 'Starting ₹8,000'
  },
  {
    id: 6,
    title: 'Embedded Systems',
    description: 'Custom embedded system development',
    icon: Wrench,
    price: 'Starting ₹7,000'
  },
];

export default function Services() {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Our Services</h2>
            <p className="text-gray-600 mt-1">Professional tech solutions for your projects</p>
          </div>
          <Link
            href="/services"
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors flex items-center gap-1"
          >
            View All Services
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.id}
                className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 hover:shadow-lg transition-all border border-blue-100 hover:border-blue-300 group"
              >
                <div className="bg-blue-600 text-white p-3 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{service.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{service.description}</p>
                <p className="text-blue-600 font-semibold">{service.price}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
