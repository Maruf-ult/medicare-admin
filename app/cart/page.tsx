"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Pill, ShoppingCart, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface CartItem {
  id: number;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  requiresPrescription: boolean;
  prescriptionApproved: boolean;
  image: string;
  dosage: string;
}

const mockCartItems: CartItem[] = [
  {
    id: 1,
    name: "Amoxicillin 500mg",
    brand: "Square",
    price: 120,
    originalPrice: 150,
    quantity: 2,
    requiresPrescription: true,
    prescriptionApproved: true,
    image: "/product-placeholder.png",
    dosage: "12 capsules",
  },
  {
    id: 2,
    name: "Paracetamol 500mg",
    brand: "Beximco",
    price: 45,
    originalPrice: 60,
    quantity: 1,
    requiresPrescription: false,
    prescriptionApproved: false,
    image: "/product-placeholder.png",
    dosage: "20 tablets",
  },
  {
    id: 3,
    name: "Vitamin D3 1000IU",
    brand: "Renata",
    price: 200,
    quantity: 1,
    requiresPrescription: false,
    prescriptionApproved: false,
    image: "/product-placeholder.png",
    dosage: "30 tablets",
  },
];

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>(mockCartItems);
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [couponInput, setCouponInput] = useState("");

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity < 1) return;
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item)),
    );
  };

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const deliveryCharge = subtotal > 500 ? 0 : 50;
  const discount = appliedCoupon ? Math.round(subtotal * 0.1) : 0; // 10% for demo
  const total = subtotal + deliveryCharge - discount;

  const applyCoupon = () => {
    if (couponInput.trim()) {
      setAppliedCoupon(couponInput);
      setCouponInput("");
    }
  };

  const needsRxApproval = items.some(
    (item) => item.requiresPrescription && !item.prescriptionApproved,
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-b border-gray-200 bg-white">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
        <p className="text-gray-600">
          {items.length} item{items.length !== 1 ? "s" : ""} in your cart
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {items.length === 0 ? (
          // Empty Cart
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-6">
              Add some medicines to get started
            </p>
            <Link href="/shop">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Continue Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              {/* Rx Warning */}
              {needsRxApproval && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <p className="text-yellow-900 font-medium flex items-start space-x-2">
                    <span>⚠️</span>
                    <span>
                      Some items in your cart require prescription approval.
                      <Link
                        href="/upload-prescription"
                        className="text-blue-600 hover:underline ml-1"
                      >
                        Upload your prescription
                      </Link>
                    </span>
                  </p>
                </div>
              )}

              {/* Cart Items List */}
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      {/* Product Image */}
                      <div className="sm:col-span-1">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-24 h-24 object-contain bg-gray-100 rounded-lg"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="sm:col-span-2">
                        <Link
                          href={`/products/${item.id}`}
                          className="hover:text-blue-600"
                        >
                          <p className="font-semibold text-gray-900 hover:text-blue-600">
                            {item.name}
                          </p>
                        </Link>
                        <p className="text-sm text-gray-500 mb-1">
                          {item.brand}
                        </p>
                        <p className="text-xs text-gray-600 mb-3">
                          {item.dosage}
                        </p>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-2">
                          {item.requiresPrescription && (
                            <div
                              className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold ${
                                item.prescriptionApproved
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              <Pill className="w-3 h-3" />
                              <span>
                                {item.prescriptionApproved
                                  ? "Rx Approved"
                                  : "Pending Approval"}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Price & Quantity */}
                      <div className="sm:col-span-1 flex flex-col items-end justify-between">
                        <div className="text-right">
                          <p className="font-bold text-gray-900">
                            ৳{item.price * item.quantity}
                          </p>
                          {item.originalPrice && (
                            <p className="text-xs text-gray-500 line-through">
                              ৳{item.originalPrice * item.quantity}
                            </p>
                          )}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2 border border-gray-300 rounded-lg">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="p-1 hover:bg-gray-100"
                          >
                            −
                          </button>
                          <span className="px-2 font-medium text-gray-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="p-1 hover:bg-gray-100"
                          >
                            +
                          </button>
                        </div>

                        {/* Delete */}
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-700 mt-2"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Continue Shopping */}
              <Link
                href="/shop"
                className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 mt-8"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Continue Shopping</span>
              </Link>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg border border-gray-200 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Order Summary
                </h2>

                {/* Coupon */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <p className="text-sm text-gray-700 font-medium mb-2">
                    Have a coupon?
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter code"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Button
                      onClick={applyCoupon}
                      variant="outline"
                      className="text-sm"
                    >
                      Apply
                    </Button>
                  </div>
                  {appliedCoupon && (
                    <p className="text-sm text-green-600 mt-2">
                      ✓ Coupon "{appliedCoupon}" applied
                    </p>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal</span>
                    <span>৳{subtotal}</span>
                  </div>
                  {deliveryCharge > 0 && (
                    <div className="flex justify-between text-gray-700">
                      <span>Delivery Charge</span>
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
                      <span>Discount (10%)</span>
                      <span>-৳{discount}</span>
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="flex justify-between items-center mb-6 text-lg font-bold">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-blue-600">৳{total}</span>
                </div>

                {/* Checkout Button */}
                <Link href="/checkout">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 font-semibold">
                    Proceed to Checkout
                  </Button>
                </Link>

                {/* Info */}
                <p className="text-xs text-gray-600 text-center mt-4">
                  💳 Secure checkout. Multiple payment options available.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
