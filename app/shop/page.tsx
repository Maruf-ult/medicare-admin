"use client";

import ProductGrid from "@/components/landing/ProductGrid";
import { Filter } from "lucide-react";
import { useState } from "react";

const categories = [
  { id: 1, name: "Medicines", count: 45 },
  { id: 2, name: "Baby Care", count: 28 },
  { id: 3, name: "Vitamins", count: 32 },
  { id: 4, name: "Skin Care", count: 56 },
  { id: 5, name: "Devices", count: 15 },
];

const brands = [
  { id: 1, name: "Beximco" },
  { id: 2, name: "Square" },
  { id: 3, name: "Renata" },
  { id: 4, name: "ACI" },
  { id: 5, name: "Eskayef" },
  { id: 6, name: "Acme" },
  { id: 7, name: "Opso" },
];

const priceRanges = [
  { id: 1, label: "Under ৳100", min: 0, max: 100 },
  { id: 2, label: "৳100 - ৳500", min: 100, max: 500 },
  { id: 3, label: "৳500 - ৳1000", min: 500, max: 1000 },
  { id: 4, label: "Above ৳1000", min: 1000, max: 999999 },
];

export default function ShopPage() {
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<number[]>([]);
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [showOtc, setShowOtc] = useState(true);
  const [showRx, setShowRx] = useState(true);
  const [sortBy, setSortBy] = useState("relevance");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleCategory = (id: number) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const toggleBrand = (id: number) => {
    setSelectedBrands((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id],
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedPrice(null);
    setShowOtc(true);
    setShowRx(true);
    setSortBy("relevance");
  };

  const activeFiltersCount =
    selectedCategories.length +
    selectedBrands.length +
    (selectedPrice ? 1 : 0) +
    (!showOtc || !showRx ? 1 : 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-b border-gray-200 bg-white">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Shop</h1>
        <p className="text-gray-600">
          Browse all our medicines and healthcare products
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Filters */}
          <div className="lg:col-span-1">
            <div
              className={`${
                isSidebarOpen ? "block" : "hidden"
              } lg:block bg-white p-6 rounded-lg border border-gray-200 h-fit sticky top-24`}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Filters</h2>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Clear all ({activeFiltersCount})
                  </button>
                )}
              </div>

              {/* Categories Filter */}
              <div className="mb-8 pb-8 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <label
                      key={cat.id}
                      className="flex items-center space-x-3 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat.id)}
                        onChange={() => toggleCategory(cat.id)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">{cat.name}</span>
                      <span className="text-xs text-gray-500 ml-auto">
                        ({cat.count})
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="mb-8 pb-8 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Price</h3>
                <div className="space-y-2">
                  {priceRanges.map((range) => (
                    <label
                      key={range.id}
                      className="flex items-center space-x-3 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="price"
                        checked={selectedPrice === range.id}
                        onChange={() => setSelectedPrice(range.id)}
                        className="w-4 h-4 border-gray-300 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">
                        {range.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Brands Filter */}
              <div className="mb-8 pb-8 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Brand</h3>
                <div className="space-y-2">
                  {brands.map((brand) => (
                    <label
                      key={brand.id}
                      className="flex items-center space-x-3 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand.id)}
                        onChange={() => toggleBrand(brand.id)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">
                        {brand.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Type Filter */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Type</h3>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showOtc}
                      onChange={(e) => setShowOtc(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">
                      OTC (No Rx needed)
                    </span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showRx}
                      onChange={(e) => setShowRx(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">
                      Prescription Required
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden w-full flex items-center justify-center space-x-2 bg-white border border-gray-200 px-4 py-2 rounded-lg mb-6 text-gray-900 font-medium"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="ml-auto bg-blue-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {/* Main Content - Products */}
          <div className="lg:col-span-3">
            {/* Sort Bar */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 mb-8 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold">1-12</span> of{" "}
                <span className="font-semibold">156</span> products
              </p>
              <div className="flex items-center space-x-2">
                <label htmlFor="sort" className="text-sm text-gray-600">
                  Sort by:
                </label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="relevance">Relevance</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">Newest</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            <ProductGrid title="" />

            {/* Pagination */}
            <div className="flex items-center justify-center space-x-2 mt-12">
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                Previous
              </button>
              {[1, 2, 3, 4, 5].map((page) => (
                <button
                  key={page}
                  className={`px-4 py-2 rounded-lg ${
                    page === 1
                      ? "bg-blue-600 text-white"
                      : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
