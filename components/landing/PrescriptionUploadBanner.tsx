"use client";

import { Button } from "@/components/ui/button";
import { Check, ShoppingCart, Upload, User } from "lucide-react";
import Link from "next/link";

const steps = [
  {
    number: 1,
    title: "Upload Prescription",
    description: "Upload a clear image of your prescription",
    icon: Upload,
  },
  {
    number: 2,
    title: "Admin Review",
    description: "Licensed pharmacist verifies within 2 hours",
    icon: Check,
  },
  {
    number: 3,
    title: "Get Approval",
    description: "Receive instant notification when approved",
    icon: User,
  },
  {
    number: 4,
    title: "Order & Checkout",
    description: "Buy approved medicines safely",
    icon: ShoppingCart,
  },
];

export default function PrescriptionUploadBanner() {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-8 md:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Need a Prescription?
          </h2>
          <p className="text-gray-600">
            Easy process for buying prescription-only medicines
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="text-center">
                {/* Circle with Number */}
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white border-2 border-blue-600 rounded-full mb-4 mx-auto">
                  <Icon className="w-8 h-8 text-blue-600" />
                </div>

                {/* Arrow connector (except last one) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute right-0 top-1/3 transform translate-x-1/2 -translate-y-1/2 text-blue-600 text-2xl">
                    →
                  </div>
                )}

                <h3 className="font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
            );
          })}
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <Link href="/upload-prescription">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-12 text-base">
              <Upload className="w-5 h-5 mr-2" />
              Upload Your Prescription
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
