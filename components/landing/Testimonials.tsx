"use client";

import { Star } from "lucide-react";

interface Testimonial {
  name: string;
  role: string;
  text: string;
  rating: number;
  avatar: string;
}

const testimonials: Testimonial[] = [
  {
    name: "Fatima Ahmed",
    role: "Customer",
    text: "Great service! Medicines arrived on time and in perfect condition. The prescription upload process was very smooth.",
    rating: 5,
    avatar: "👩‍⚕️",
  },
  {
    name: "Karim Hassan",
    role: "Customer",
    text: "Best online pharmacy in Bangladesh. Genuine medicines, affordable prices, and excellent customer support.",
    rating: 5,
    avatar: "👨‍💼",
  },
  {
    name: "Sara Khan",
    role: "Customer",
    text: "Very satisfied with the 2-hour prescription review. Licensed pharmacists make me feel secure buying online.",
    rating: 5,
    avatar: "👩",
  },
];

export default function Testimonials() {
  return (
    <div className="py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          What Our Customers Say
        </h2>
        <p className="text-gray-600">
          Trusted by thousands of customers across Bangladesh
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
          >
            {/* Stars */}
            <div className="flex items-center space-x-1 mb-4">
              {Array.from({ length: testimonial.rating }).map((_, i) => (
                <Star
                  key={i}
                  className="w-4 h-4 fill-yellow-400 text-yellow-400"
                />
              ))}
            </div>

            {/* Review Text */}
            <p className="text-gray-700 mb-4 leading-relaxed">
              "{testimonial.text}"
            </p>

            {/* Author */}
            <div className="flex items-center space-x-3">
              <div className="text-3xl">{testimonial.avatar}</div>
              <div>
                <p className="font-semibold text-gray-900">
                  {testimonial.name}
                </p>
                <p className="text-xs text-gray-500">{testimonial.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
