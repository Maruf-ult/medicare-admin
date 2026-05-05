"use client";

import ProductGrid from "@/components/landing/ProductGrid";
import { Button } from "@/components/ui/button";
import { Check, Heart, Pill, Share2, ShoppingCart, Star } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface ProductDetailPageProps {
  params: {
    id: string;
  };
}

// Mock product data - in real app, this would come from API
const mockProduct = {
  id: 1,
  name: "Amoxicillin 500mg",
  brand: "Square",
  category: "Medicines",
  price: 120,
  originalPrice: 150,
  discount: 20,
  rating: 4.5,
  reviews: 124,
  inStock: true,
  requiresPrescription: true,
  dosage: "12 capsules per strip",
  description:
    "Amoxicillin is a penicillin-type antibiotic used to treat many different types of infections caused by bacteria, such as ear infections, bladder infections, pneumonia, strep throat, and gonorrhea.",
  uses: [
    "Bacterial infections",
    "Ear infections",
    "Respiratory tract infections",
    "Urinary tract infections",
    "Skin infections",
  ],
  dosage_info:
    "Take as directed by your doctor. Usually 250-500mg three times daily.",
  sideEffects: ["Nausea", "Vomiting", "Diarrhea", "Allergic reactions (rare)"],
  warnings: [
    "Do not use if allergic to penicillin",
    "Inform doctor about all medications",
    "Not recommended during pregnancy without doctor consultation",
  ],
  images: [
    "/product-placeholder.png",
    "/product-placeholder.png",
    "/product-placeholder.png",
  ],
};

const reviews = [
  {
    id: 1,
    author: "Saiful Islam",
    rating: 5,
    date: "2 days ago",
    title: "Very effective medicine",
    text: "Received the medicine quickly and it worked as expected. Highly recommended!",
    helpful: 24,
  },
  {
    id: 2,
    author: "Maria Khan",
    rating: 4,
    date: "1 week ago",
    title: "Good quality, fast delivery",
    text: "Product quality is good and delivery was faster than expected.",
    helpful: 18,
  },
  {
    id: 3,
    author: "Ahmed Hassan",
    rating: 5,
    date: "2 weeks ago",
    title: "Licensed pharmacist verified my prescription",
    text: "Great service! The pharmacist reviewed my prescription very quickly and approved it.",
    helpful: 42,
  },
];

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  const handleAddToCart = () => {
    // In real app, this would add to cart context/state
    alert(`Added ${quantity} x ${mockProduct.name} to cart`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-gray-900">
            Home
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-gray-900">
            Shop
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{mockProduct.name}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
              <img
                src={mockProduct.images[selectedImage]}
                alt={mockProduct.name}
                className="w-full h-96 object-contain"
              />
            </div>
            <div className="flex space-x-2">
              {mockProduct.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-16 h-16 border-2 rounded-lg overflow-hidden ${
                    selectedImage === index
                      ? "border-blue-600"
                      : "border-gray-300"
                  }`}
                >
                  <img
                    src={mockProduct.images[index]}
                    alt={`View ${index + 1}`}
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            {/* Brand and Badges */}
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-sm text-gray-500 font-medium">
                {mockProduct.brand}
              </span>
              {mockProduct.requiresPrescription && (
                <div className="inline-flex items-center space-x-1 bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-semibold">
                  <Pill className="w-3 h-3" />
                  <span>Rx Required</span>
                </div>
              )}
            </div>

            {/* Product Name */}
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {mockProduct.name}
            </h1>

            {/* Dosage */}
            <p className="text-gray-600 mb-4">{mockProduct.dosage}</p>

            {/* Rating */}
            <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-gray-200">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(mockProduct.rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="font-semibold text-gray-900">
                {mockProduct.rating}
              </span>
              <span className="text-gray-600">
                ({mockProduct.reviews} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <div className="flex items-baseline space-x-3">
                <span className="text-4xl font-bold text-gray-900">
                  ৳{mockProduct.price}
                </span>
                {mockProduct.originalPrice && (
                  <>
                    <span className="text-lg text-gray-400 line-through">
                      ৳{mockProduct.originalPrice}
                    </span>
                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">
                      {mockProduct.discount}% OFF
                    </span>
                  </>
                )}
              </div>
              {mockProduct.inStock && (
                <p className="text-green-600 font-medium mt-2 flex items-center space-x-1">
                  <Check className="w-4 h-4" />
                  <span>In Stock</span>
                </p>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-2">Quantity</p>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-100"
                >
                  −
                </button>
                <span className="text-lg font-semibold text-gray-900 w-8 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col space-y-3">
              <Button
                onClick={handleAddToCart}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-base flex items-center justify-center space-x-2"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Add to Cart</span>
              </Button>
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`w-full py-3 rounded-lg border-2 font-semibold transition-all flex items-center justify-center space-x-2 ${
                  isWishlisted
                    ? "border-red-600 text-red-600 bg-red-50"
                    : "border-gray-300 text-gray-700 hover:border-red-600 hover:text-red-600"
                }`}
              >
                <Heart
                  className={`w-5 h-5 ${isWishlisted ? "fill-red-600" : ""}`}
                />
                <span>{isWishlisted ? "Wishlisted" : "Add to Wishlist"}</span>
              </button>
              <button className="w-full py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold flex items-center justify-center space-x-2">
                <Share2 className="w-5 h-5" />
                <span>Share</span>
              </button>
            </div>

            {/* Info Box */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900">
                <span className="font-semibold">📋 Prescription Required:</span>{" "}
                Please upload your valid prescription to proceed with checkout
                for this medicine.
              </p>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Description
              </h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                {mockProduct.description}
              </p>

              {/* Uses */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Uses</h3>
                <ul className="space-y-2">
                  {mockProduct.uses.map((use, index) => (
                    <li
                      key={index}
                      className="flex items-start space-x-3 text-gray-700"
                    >
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>{use}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Dosage Info */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Dosage</h3>
                <p className="text-gray-700">{mockProduct.dosage_info}</p>
              </div>

              {/* Side Effects */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Side Effects
                </h3>
                <p className="text-sm text-gray-600 mb-2">May cause:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {mockProduct.sideEffects.map((effect, index) => (
                    <li key={index}>{effect}</li>
                  ))}
                </ul>
              </div>

              {/* Warnings */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Warnings</h3>
                <ul className="space-y-1 text-sm text-gray-700">
                  {mockProduct.warnings.map((warning, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-red-600 font-bold">⚠</span>
                      <span>{warning}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Customer Reviews
              </h2>
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="pb-6 border-b border-gray-200 last:border-b-0"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {review.author}
                        </p>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            {[...Array(review.rating)].map((_, i) => (
                              <Star
                                key={i}
                                className="w-4 h-4 fill-yellow-400 text-yellow-400"
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500">
                            {review.date}
                          </span>
                        </div>
                      </div>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {review.title}
                    </h4>
                    <p className="text-gray-700 text-sm mb-3">{review.text}</p>
                    <button className="text-xs text-gray-600 hover:text-gray-900">
                      👍 Helpful ({review.helpful})
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Related Products */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg border border-gray-200 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">
                Related Products
              </h3>
              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <Link
                    key={item}
                    href="#"
                    className="block p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <p className="font-medium text-gray-900 text-sm mb-1">
                      Ibuprofen 400mg
                    </p>
                    <p className="text-xs text-gray-600 mb-2">Square</p>
                    <p className="font-bold text-gray-900">৳95</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        <div className="mb-12">
          <ProductGrid title="You Might Also Like" />
        </div>
      </div>
    </div>
  );
}
