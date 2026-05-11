"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { ApiResponse } from "@/types";
import { Loader2 } from "lucide-react";

type Category = {
  id: number;
  name: string;
  slug: string;
  imageUrl?: string | null;
  description?: string | null;
  parentCategoryId?: number | null;
  sortOrder: number;
  isActive: boolean;
  subCategories: Category[];
};

const fallbackCategories: Category[] = [
  {
    id: 1,
    name: "Medicines",
    slug: "medicines",
    imageUrl: null,
    description: "Prescription and OTC medicines",
    parentCategoryId: null,
    sortOrder: 1,
    isActive: true,
    subCategories: [],
  },
  {
    id: 2,
    name: "Baby Care",
    slug: "baby-care",
    imageUrl: null,
    description: "Baby health and care products",
    parentCategoryId: null,
    sortOrder: 2,
    isActive: true,
    subCategories: [],
  },
  {
    id: 3,
    name: "Vitamins",
    slug: "vitamins",
    imageUrl: null,
    description: "Vitamins and supplements",
    parentCategoryId: null,
    sortOrder: 3,
    isActive: true,
    subCategories: [],
  },
  {
    id: 4,
    name: "Skin Care",
    slug: "skin-care",
    imageUrl: null,
    description: "Skin care products",
    parentCategoryId: null,
    sortOrder: 4,
    isActive: true,
    subCategories: [],
  },
  {
    id: 5,
    name: "Health Devices",
    slug: "health-devices",
    imageUrl: null,
    description: "Medical and health devices",
    parentCategoryId: null,
    sortOrder: 5,
    isActive: true,
    subCategories: [],
  },
];

export default function CategoryTabs() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getCategories = async () => {
    try {
      setIsLoading(true);

      const response = await api.get<ApiResponse<Category[]>>("/categories");

      if (response.data.success && response.data.data?.length) {
        const activeCategories = response.data.data
          .filter((category) => category.isActive)
          .sort((a, b) => a.sortOrder - b.sortOrder);

        setCategories(
          activeCategories.length > 0 ? activeCategories : fallbackCategories
        );
      } else {
        setCategories(fallbackCategories);
      }
    } catch (error) {
      console.error("Failed to load categories:", error);
      setCategories(fallbackCategories);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getCategories();
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
      <div className="flex items-center space-x-2 overflow-x-auto pb-4 scrollbar-hide">
        <Link
          href="/shop"
          className="whitespace-nowrap rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
        >
          All Products
        </Link>

        {isLoading ? (
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading...
          </div>
        ) : (
          categories.map((category) => (
            <Link
              key={category.id}
              href={`/shop?categoryId=${category.id}`}
              className="whitespace-nowrap rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-bold text-gray-700 transition-colors hover:border-blue-600 hover:bg-blue-50 hover:text-blue-600"
            >
              {category.name}
            </Link>
          ))
        )}
      </div>
    </section>
  );
}