"use client";

import { Clock, Pill, RotateCcw, Truck } from "lucide-react";

const badges = [
  {
    icon: Truck,
    title: "Free Delivery",
    description: "On orders above ৳500",
  },
  {
    icon: Pill,
    title: "Genuine Medicines",
    description: "100% authentic products",
  },
  {
    icon: Clock,
    title: "2-Hour Rx Review",
    description: "Fast prescription approval",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    description: "7-day return policy",
  },
];

export default function TrustBadges() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {badges.map((badge, index) => {
        const Icon = badge.icon;
        return (
          <div
            key={index}
            className="bg-white p-6 rounded-lg border border-gray-200 text-center hover:shadow-md transition-shadow"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-lg mb-4">
              <Icon className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{badge.title}</h3>
            <p className="text-sm text-gray-500">{badge.description}</p>
          </div>
        );
      })}
    </div>
  );
}
