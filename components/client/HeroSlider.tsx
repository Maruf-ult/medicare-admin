"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const slides = [
  {
    label: "This Week's Deal",
    title: "Up to 20% Off",
    highlight: "on Medicines",
    description:
      "Stock up on everyday medicines, oral saline, vitamins, and health essentials.",
    primaryHref: "/shop",
    primaryText: "Shop Now",
    icon: "💊",
    bgClass: "from-blue-50 via-white to-blue-100",
    badgeClass: "bg-blue-100 text-blue-700",
  },
  {
    label: "Prescription Service",
    title: "Upload Your",
    highlight: "Prescription",
    description:
      "Upload a prescription. Our pharmacist reviews it and prepares your order.",
    primaryHref: "/upload-prescription",
    primaryText: "Upload Rx",
    icon: "📋",
    bgClass: "from-green-50 via-white to-green-100",
    badgeClass: "bg-green-100 text-green-700",
  },
  {
    label: "Fast Delivery",
    title: "Fast & Reliable",
    highlight: "Delivery",
    description:
      "Get your medicines delivered safely to your door within 24 hours.",
    primaryHref: "/shop",
    primaryText: "Browse Products",
    icon: "🚚",
    bgClass: "from-orange-50 via-white to-orange-100",
    badgeClass: "bg-orange-100 text-orange-700",
  },
  {
    label: "Trusted Pharmacy",
    title: "Genuine & Licensed",
    highlight: "Medicines",
    description:
      "100% authentic medicines from trusted brands with pharmacist support.",
    primaryHref: "/shop",
    primaryText: "Shop Now",
    icon: "🛡️",
    bgClass: "from-purple-50 via-white to-purple-100",
    badgeClass: "bg-purple-100 text-purple-700",
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);

  const next = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const prev = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div
              key={index}
              className={cn(
                "relative flex min-w-full items-center overflow-hidden bg-gradient-to-r px-6 py-7 sm:px-10 sm:py-9 lg:px-14 lg:py-10",
                slide.bgClass
              )}
            >
              <div className="relative z-10 max-w-2xl">
                <span
                  className={cn(
                    "mb-3 inline-flex rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider",
                    slide.badgeClass
                  )}
                >
                  {slide.label}
                </span>

                <h1 className="mb-3 text-2xl font-black leading-tight text-gray-900 sm:text-3xl lg:text-4xl">
                  {slide.title}
                  <br />
                  <span className="text-blue-600">{slide.highlight}</span>
                </h1>

                <p className="mb-5 max-w-lg text-sm leading-6 text-gray-600 sm:text-base">
                  {slide.description}
                </p>

                <Link
                  href={slide.primaryHref}
                  className="inline-flex items-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md"
                >
                  {slide.primaryText}
                </Link>
              </div>

              <div className="absolute right-8 top-1/2 hidden -translate-y-1/2 select-none text-6xl opacity-20 sm:block lg:right-16 lg:text-7xl">
                {slide.icon}
              </div>

              <div className="absolute -right-20 -top-20 h-44 w-44 rounded-full bg-white/40" />
              <div className="absolute -bottom-24 right-24 h-52 w-52 rounded-full bg-white/30" />
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={prev}
          className="absolute left-4 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg border border-gray-200 bg-white/90 text-gray-700 shadow-sm transition hover:bg-white hover:text-blue-600 sm:flex"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={next}
          className="absolute right-4 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg border border-gray-200 bg-white/90 text-gray-700 shadow-sm transition hover:bg-white hover:text-blue-600 sm:flex"
          aria-label="Next slide"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrent(index)}
              className={`h-2 rounded-full transition-all ${
                current === index
                  ? "w-7 bg-blue-600"
                  : "w-2 bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}