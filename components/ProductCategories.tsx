'use client';

import { Cpu, Radio, Bot, Cpu as RaspberryPi, Monitor, Zap, Wrench, Home, Wifi, Package, Cable } from 'lucide-react';

const categories = [
  { id: 1, name: 'Arduino Boards', icon: Cpu, color: 'bg-blue-100 text-blue-600' },
  { id: 2, name: 'Sensors', icon: Radio, color: 'bg-purple-100 text-purple-600' },
  { id: 3, name: 'Robotics', icon: Bot, color: 'bg-pink-100 text-pink-600' },
  { id: 4, name: 'Raspberry Pi', icon: RaspberryPi, color: 'bg-green-100 text-green-600' },
  { id: 5, name: 'Displays', icon: Monitor, color: 'bg-orange-100 text-orange-600' },
  { id: 6, name: 'Motors & Drivers', icon: Zap, color: 'bg-red-100 text-red-600' },
  { id: 7, name: 'DIY Kits', icon: Wrench, color: 'bg-yellow-100 text-yellow-600' },
  { id: 8, name: 'IoT Modules', icon: Wifi, color: 'bg-indigo-100 text-indigo-600' },
  { id: 9, name: 'Smart Home', icon: Home, color: 'bg-teal-100 text-teal-600' },
  { id: 10, name: 'Power Supplies', icon: Package, color: 'bg-cyan-100 text-cyan-600' },
  { id: 11, name: 'Cables & Connectors', icon: Cable, color: 'bg-rose-100 text-rose-600' },
  { id: 12, name: 'Components', icon: Cpu, color: 'bg-amber-100 text-amber-600' },
];

export default function ProductCategories() {
  return (
    <section className="py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Shop by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <div
                key={category.id}
                className="flex flex-col items-center p-4 rounded-xl bg-gray-50 hover:bg-white hover:shadow-lg transition-all duration-300 cursor-pointer group transform hover:-translate-y-1"
              >
                <div className={`p-4 rounded-full ${category.color} mb-3 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="h-8 w-8" />
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                  {category.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
