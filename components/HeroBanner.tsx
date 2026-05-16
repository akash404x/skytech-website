'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';

const slides = [
  {
    id: 1,
    title: 'Arduino & IoT Solutions',
    subtitle: 'Build Your Projects',
    description: 'Arduino Boards, Sensors, Modules & Components',
    bgColor: 'from-blue-600 to-cyan-600',
    textColor: 'text-white'
  },
  {
    id: 2,
    title: 'Robotics & Automation',
    subtitle: 'Smart Technology',
    description: 'Motors, Drivers, Controllers & DIY Kits',
    bgColor: 'from-purple-600 to-pink-600',
    textColor: 'text-white'
  },
  {
    id: 3,
    title: 'Professional Services',
    subtitle: 'Expert Support',
    description: 'IoT Development, PCB Design & Project Assistance',
    bgColor: 'from-green-600 to-teal-600',
    textColor: 'text-white'
  }
];

export default function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-all duration-700 ease-in-out transform ${
            index === currentSlide ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
          }`}
        >
          <div className={`w-full h-full bg-gradient-to-r ${slide.bgColor} flex items-center justify-center`}>
            <div className="text-center px-4">
              <h2 className={`text-4xl md:text-6xl font-bold mb-2 ${slide.textColor} animate-fadeIn`}>
                {slide.title}
              </h2>
              <p className={`text-2xl md:text-4xl font-semibold mb-3 ${slide.textColor} animate-slideUp`}>
                {slide.subtitle}
              </p>
              <p className={`text-lg md:text-xl ${slide.textColor} opacity-90 animate-slideUp`}>
                {slide.description}
              </p>
              <button className="mt-6 bg-white text-gray-900 px-8 py-3 rounded-full font-semibold hover:bg-yellow-400 transition-all transform hover:scale-105 shadow-lg">
                Shop Now
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all hover:scale-110"
      >
        <ChevronLeft className="h-6 w-6 text-gray-800" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all hover:scale-110"
      >
        <ChevronRight className="h-6 w-6 text-gray-800" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-3 w-3 rounded-full transition-all ${
              index === currentSlide ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
