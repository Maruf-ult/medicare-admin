"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

interface Banner {
  id: number;
  title: string;
  subtitle: string;
  bgColor: string;
  buttonText: string;
}

const banners: Banner[] = [
  {
    id: 1,
    title: "Genuine Medicines",
    subtitle: "Verified & Licensed Pharmacists",
    bgColor: "from-blue-100 to-blue-50",
    buttonText: "Shop Now",
  },
  {
    id: 2,
    title: "Free Delivery",
    subtitle: "On orders above ৳500",
    bgColor: "from-green-100 to-green-50",
    buttonText: "Explore",
  },
  {
    id: 3,
    title: "2-Hour Prescription Review",
    subtitle: "Fast approval for medicines requiring prescription",
    bgColor: "from-amber-100 to-amber-50",
    buttonText: "Upload Rx",
  },
  {
    id: 4,
    title: "24/7 Customer Support",
    subtitle: "Always here to help",
    bgColor: "from-purple-100 to-purple-50",
    buttonText: "Contact Us",
  },
];

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  useEffect(() => {
    if (!isAutoPlay) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 2000);

    return () => clearInterval(timer);
  }, [isAutoPlay]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlay(false);
    setTimeout(() => setIsAutoPlay(true), 5000);
  };

  const previousSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
    setIsAutoPlay(false);
    setTimeout(() => setIsAutoPlay(true), 5000);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
    setIsAutoPlay(false);
    setTimeout(() => setIsAutoPlay(true), 5000);
  };

  const banner = banners[currentSlide];

  return (
    <div
      className="relative w-full h-80 md:h-96 bg-gradient-to-r overflow-hidden rounded-lg"
      onMouseEnter={() => setIsAutoPlay(false)}
      onMouseLeave={() => setIsAutoPlay(true)}
    >
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-r ${banner.bgColor}`} />

      {/* Content */}
      <div className="relative h-full flex items-center justify-center text-center px-8 z-10">
        <div className="max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {banner.title}
          </h2>
          <p className="text-lg text-gray-600 mb-6">{banner.subtitle}</p>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-11">
            {banner.buttonText}
          </Button>
        </div>
      </div>

      {/* Left Arrow */}
      <button
        onClick={previousSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-md transition-all"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      {/* Right Arrow */}
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-md transition-all"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide
                ? "bg-blue-600 w-8"
                : "bg-white/60 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
