"use client";

import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface WishlistItem {
  id: number;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  inStock: boolean;
  requiresPrescription: boolean;
}

const mockWishlistItems: WishlistItem[] = [
  {
    id: 1,
    name: "Amoxicillin 500mg",
    brand: "Square",
    price: 120,
    originalPrice: 150,
    image: "/product-placeholder.png",
    inStock: true,
    requiresPrescription: true,
  },
  {
    id: 2,
    name: "Ibuprofen 400mg",
    brand: "Beximco",
    price: 75,
    originalPrice: 100,
    image: "/product-placeholder.png",
    inStock: true,
    requiresPrescription: false,
  },
  {
    id: 3,
    name: "Multivitamin Syrup",
    brand: "Renata",
    price: 180,
    image: "/product-placeholder.png",
    inStock: false,
    requiresPrescription: false,
  },
];

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>(mockWishlistItems);

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-b border-gray-200 bg-white">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
        <p className="text-gray-600">
          {items.length} item{items.length !== 1 ? "s" : ""} saved
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {items.length === 0 ? (
          // Empty Wishlist
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-gray-600 mb-6">
              Save your favorite medicines to your wishlist
            </p>
            <Link href="/shop">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Browse Products
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Image */}
                <div className="relative bg-gray-100 h-48 flex items-center justify-center">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-contain"
                  />
                  {!item.inStock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white font-semibold">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <p className="text-xs text-gray-500 font-medium mb-1">
                    {item.brand}
                  </p>
                  <Link href={`/products/${item.id}`}>
                    <h3 className="font-semibold text-gray-900 mb-2 hover:text-blue-600 line-clamp-2">
                      {item.name}
                    </h3>
                  </Link>

                  {/* Price */}
                  <div className="flex items-baseline space-x-2 mb-4">
                    <span className="font-bold text-gray-900">
                      ৳{item.price}
                    </span>
                    {item.originalPrice && (
                      <span className="text-sm text-gray-400 line-through">
                        ৳{item.originalPrice}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <Button
                      disabled={!item.inStock}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="w-full py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg font-medium flex items-center justify-center space-x-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
