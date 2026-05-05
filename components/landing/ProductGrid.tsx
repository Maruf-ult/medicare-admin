"use client";

import { Button } from "@/components/ui/button";
import { Heart, Pill, ShoppingCart } from "lucide-react";
import Link from "next/link";

interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  dosage: string;
  requiresPrescription: boolean;
  badge?: "hot" | "sale" | "new";
  image: string;
}

interface ProductGridProps {
  title?: string;
  products?: Product[];
}

const defaultProducts: Product[] = [
  {
    id: 1,
    name: "Aspirin 500mg",
    brand: "Beximco",
    price: 50,
    originalPrice: 75,
    dosage: "10 tablets",
    requiresPrescription: false,
    badge: "sale",
    image: "/product-placeholder.png",
  },
  {
    id: 2,
    name: "Amoxicillin 500mg",
    brand: "Square",
    price: 120,
    originalPrice: 150,
    dosage: "12 capsules",
    requiresPrescription: true,
    badge: "hot",
    image: "/product-placeholder.png",
  },
  {
    id: 3,
    name: "Vitamin D3 1000IU",
    brand: "Renata",
    price: 200,
    dosage: "30 tablets",
    requiresPrescription: false,
    badge: "new",
    image: "/product-placeholder.png",
  },
  {
    id: 4,
    name: "Metformin 500mg",
    brand: "ACI",
    price: 100,
    originalPrice: 130,
    dosage: "20 tablets",
    requiresPrescription: true,
    image: "/product-placeholder.png",
  },
  {
    id: 5,
    name: "Cough Syrup",
    brand: "Eskayef",
    price: 85,
    dosage: "100ml bottle",
    requiresPrescription: false,
    image: "/product-placeholder.png",
  },
  {
    id: 6,
    name: "Paracetamol 500mg",
    brand: "Acme",
    price: 45,
    originalPrice: 60,
    dosage: "20 tablets",
    requiresPrescription: false,
    image: "/product-placeholder.png",
  },
  {
    id: 7,
    name: "Ciprofloxacin 500mg",
    brand: "Opso",
    price: 140,
    dosage: "10 tablets",
    requiresPrescription: true,
    image: "/product-placeholder.png",
  },
  {
    id: 8,
    name: "Calcium Supplement",
    brand: "Square",
    price: 180,
    originalPrice: 220,
    dosage: "30 tablets",
    requiresPrescription: false,
    badge: "sale",
    image: "/product-placeholder.png",
  },
];

export default function ProductGrid({
  title = "Featured Products",
  products = defaultProducts,
}: ProductGridProps) {
  return (
    <div>
      {title && (
        <h2 className="text-2xl font-bold text-gray-900 mb-8">{title}</h2>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Link key={product.id} href={`/products/${product.id}`}>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col cursor-pointer">
              {/* Image Container */}
              <div className="relative bg-gray-100 h-48 flex items-center justify-center overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                />

                {/* Badges */}
                <div className="absolute top-3 left-3 space-y-2">
                  {product.badge && (
                    <div
                      className={`px-3 py-1 text-xs font-semibold text-white rounded-full ${
                        product.badge === "hot"
                          ? "bg-red-500"
                          : product.badge === "sale"
                            ? "bg-orange-500"
                            : "bg-green-500"
                      }`}
                    >
                      {product.badge === "hot"
                        ? "🔥 Hot"
                        : product.badge === "sale"
                          ? "Sale"
                          : "New"}
                    </div>
                  )}
                  {product.requiresPrescription && (
                    <div className="inline-flex items-center space-x-1 bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-semibold">
                      <Pill className="w-3 h-3" />
                      <span>Rx</span>
                    </div>
                  )}
                </div>

                {/* Wishlist Button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  className="absolute top-3 right-3 bg-white rounded-full p-2 hover:bg-red-50 transition-colors shadow-sm"
                >
                  <Heart className="w-5 h-5 text-gray-400 hover:text-red-500 transition-colors" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 flex-1 flex flex-col">
                <p className="text-xs text-gray-500 font-medium mb-1">
                  {product.brand}
                </p>
                <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-xs text-gray-500 mb-3">{product.dosage}</p>

                {/* Price */}
                <div className="flex items-baseline space-x-2 mb-4">
                  <span className="text-lg font-bold text-gray-900">
                    ৳{product.price}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-gray-400 line-through">
                      ৳{product.originalPrice}
                    </span>
                  )}
                </div>

                {/* Add to Cart Button */}
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white space-x-1 h-10 mt-auto"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart</span>
                </Button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
