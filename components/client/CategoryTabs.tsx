"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { ApiResponse, PagedResponse } from "@/types";
import { Loader2 } from "lucide-react";
import type { ClientProduct } from "@/components/client/ProductCard";

function extractItems<T>(data: T[] | PagedResponse<T>): T[] {
  return Array.isArray(data) ? data : data.items ?? [];
}

export default function CategoryTabs() {
  const [labels, setLabels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const response = await api.get<
          ApiResponse<ClientProduct[] | PagedResponse<ClientProduct>>
        >("/products", { params: { pageNumber: 1, pageSize: 200 } });

        if (response.data.success && response.data.data) {
          const items = extractItems(response.data.data);
          const unique = new Set<string>();
          for (const p of items) {
            const c =
              (typeof p.category === "string" && p.category.trim()) ||
              p.categoryName?.trim();
            if (c) unique.add(c);
          }
          setLabels(Array.from(unique).sort((a, b) => a.localeCompare(b)));
        } else {
          setLabels([]);
        }
      } catch (error) {
        console.error("Failed to load category labels:", error);
        setLabels([]);
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between space-x-2 overflow-x-auto pb-4 scrollbar-hide">
        <div className="flex items-center space-x-2">
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
            labels.map((label) => (
              <Link
                key={label}
                href={`/shop?category=${encodeURIComponent(label)}`}
                className="whitespace-nowrap rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-bold text-gray-700 transition-colors hover:border-blue-600 hover:bg-blue-50 hover:text-blue-600"
              >
                {label}
              </Link>
            ))
          )}
        </div>

        <Link
          href="/shop"
          className="ml-auto whitespace-nowrap rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-bold text-gray-700 transition-colors hover:border-blue-600 hover:bg-blue-50 hover:text-blue-600"
        >
          See All
        </Link>
      </div>
    </section>
  );
}
