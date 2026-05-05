"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Lock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface CheckoutFormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  paymentMethod: "cod" | "bkash" | "nagad" | "ssl" | "";
}

const orderItems = [
  {
    id: 1,
    name: "Amoxicillin 500mg",
    quantity: 2,
    price: 120,
  },
  {
    id: 2,
    name: "Paracetamol 500mg",
    quantity: 1,
    price: 45,
  },
];

const subtotal = 285;
const deliveryCharge = 0;
const discount = 28;
const total = 257;

export default function CheckoutPage() {
  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    paymentMethod: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate API call
    setTimeout(() => {
      alert("Order placed successfully! Order ID: #MED2024001");
      setIsProcessing(false);
    }, 2000);
  };

  const isFormComplete =
    formData.fullName &&
    formData.email &&
    formData.phone &&
    formData.address &&
    formData.city &&
    formData.postalCode &&
    formData.paymentMethod &&
    agreedToTerms;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-b border-gray-200 bg-white">
        <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Shipping Address */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Shipping Address
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="fullName"
                      className="text-sm font-medium text-gray-700 mb-1"
                    >
                      Full Name
                    </Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="Your full name"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      className="h-11"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="email"
                      className="text-sm font-medium text-gray-700 mb-1"
                    >
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="h-11"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="phone"
                      className="text-sm font-medium text-gray-700 mb-1"
                    >
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+880 1700 000000"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="h-11"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="postalCode"
                      className="text-sm font-medium text-gray-700 mb-1"
                    >
                      Postal Code
                    </Label>
                    <Input
                      id="postalCode"
                      name="postalCode"
                      type="text"
                      placeholder="1000"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label
                      htmlFor="address"
                      className="text-sm font-medium text-gray-700 mb-1"
                    >
                      Street Address
                    </Label>
                    <Input
                      id="address"
                      name="address"
                      type="text"
                      placeholder="123 Main Street, Apartment 4B"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label
                      htmlFor="city"
                      className="text-sm font-medium text-gray-700 mb-1"
                    >
                      City
                    </Label>
                    <select
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-11"
                    >
                      <option value="">Select City</option>
                      <option value="dhaka">Dhaka</option>
                      <option value="chittagong">Chittagong</option>
                      <option value="sylhet">Sylhet</option>
                      <option value="khulna">Khulna</option>
                      <option value="rajshahi">Rajshahi</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Payment Method
                </h2>
                <div className="space-y-3">
                  {[
                    {
                      id: "cod",
                      label: "Cash on Delivery (COD)",
                      description: "Pay when you receive your order",
                    },
                    {
                      id: "bkash",
                      label: "bKash",
                      description: "Fast and secure mobile payment",
                    },
                    {
                      id: "nagad",
                      label: "Nagad",
                      description: "Mobile financial services",
                    },
                    {
                      id: "ssl",
                      label: "Credit/Debit Card (SSL Commerz)",
                      description: "Secure card payment",
                    },
                  ].map((method) => (
                    <label
                      key={method.id}
                      className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:border-blue-600 hover:bg-blue-50 transition-all"
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={formData.paymentMethod === method.id}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600"
                        required
                      />
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">
                          {method.label}
                        </p>
                        <p className="text-sm text-gray-600">
                          {method.description}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Prescription Warning */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-900">
                    Prescription Required Items
                  </p>
                  <p className="text-sm text-yellow-800 mt-1">
                    Please ensure you have uploaded and received approval for
                    prescription-required medicines before placing this order.
                  </p>
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 mt-1"
                />
                <label htmlFor="terms" className="text-sm text-gray-700">
                  I agree to the{" "}
                  <Link href="#" className="text-blue-600 hover:underline">
                    Terms and Conditions
                  </Link>{" "}
                  and{" "}
                  <Link href="#" className="text-blue-600 hover:underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              {/* Place Order Button */}
              <Button
                type="submit"
                disabled={!isFormComplete || isProcessing}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 font-semibold disabled:bg-gray-400 flex items-center justify-center space-x-2"
              >
                <Lock className="w-5 h-5" />
                <span>{isProcessing ? "Processing..." : "Place Order"}</span>
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg border border-gray-200 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Order Summary
              </h2>

              {/* Order Items */}
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-700">
                      {item.name} x{item.quantity}
                    </span>
                    <span className="font-medium text-gray-900">
                      ৳{item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 mb-6 pb-6 border-b border-gray-200">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span>৳{subtotal}</span>
                </div>
                {deliveryCharge > 0 && (
                  <div className="flex justify-between text-gray-700">
                    <span>Delivery</span>
                    <span>৳{deliveryCharge}</span>
                  </div>
                )}
                {deliveryCharge === 0 && (
                  <div className="flex justify-between text-green-600 text-sm">
                    <span>Free Delivery</span>
                    <span>-৳50</span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-৳{discount}</span>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="flex justify-between items-center mb-6 text-lg font-bold">
                <span className="text-gray-900">Total:</span>
                <span className="text-blue-600">৳{total}</span>
              </div>

              {/* Security Badge */}
              <div className="flex items-center justify-center space-x-2 text-xs text-gray-600 p-3 bg-gray-100 rounded-lg">
                <Lock className="w-4 h-4" />
                <span>Secure & encrypted checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
