"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { ApiResponse, PagedResponse } from "@/types";

import HeroSlider from "@/components/client/HeroSlider";
import CategoryTabs from "@/components/client/CategoryTabs";
import ProductCard, { ClientProduct } from "@/components/client/ProductCard";
import MiniPromoBanners from "@/components/client/MiniPromoBanners";
import TrustBadges from "@/components/client/TrustBadges";
import PrescriptionBanner from "@/components/client/PrescriptionBanner";

import { Loader2 } from "lucide-react";
import Link from "next/link";

function extractItems<T>(data: T[] | PagedResponse<T>): T[] {
  return Array.isArray(data) ? data : data.items ?? [];
}

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<ClientProduct[]>([]);
  const [hotDeals, setHotDeals] = useState<ClientProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);

        const [featuredResult, hotDealsResult] = await Promise.allSettled([
          api.get<ApiResponse<ClientProduct[] | PagedResponse<ClientProduct>>>(
            "/products",
            {
              params: {
                isFeatured: true,
                pageNumber: 1,
                pageSize: 10,
              },
            }
          ),

          api.get<ApiResponse<ClientProduct[] | PagedResponse<ClientProduct>>>(
            "/products",
            {
              params: {
                pageNumber: 1,
                pageSize: 5,
              },
            }
          ),
        ]);

        if (
          featuredResult.status === "fulfilled" &&
          featuredResult.value.data.success &&
          featuredResult.value.data.data
        ) {
          setFeaturedProducts(extractItems(featuredResult.value.data.data));
        } else {
          setFeaturedProducts([]);
        }

        if (
          hotDealsResult.status === "fulfilled" &&
          hotDealsResult.value.data.success &&
          hotDealsResult.value.data.data
        ) {
          const products = extractItems(hotDealsResult.value.data.data);

          const discountedProducts = products.filter(
            (product) =>
              product.discountPrice !== null &&
              product.discountPrice !== undefined &&
              product.discountPrice < product.price
          );

          setHotDeals(
            discountedProducts.length > 0 ? discountedProducts : products
          );
        } else {
          setHotDeals([]);
        }
      } catch (error) {
        console.error("Failed to load homepage products:", error);
        setFeaturedProducts([]);
        setHotDeals([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <main>
      <HeroSlider />

      <CategoryTabs />

      <ProductSection
        title="Featured Products"
        description="Popular medicines and healthcare essentials."
        products={featuredProducts}
        isLoading={isLoading}
        emptyMessage="No featured products found."
        loadingText="Loading products..."
      />

      <MiniPromoBanners />

      <TrustBadges />

      <PrescriptionBanner />

      <ProductSection
        title="Hot Deals"
        description="Discounted products and special offers."
        products={hotDeals}
        isLoading={isLoading}
        emptyMessage="No hot deals found."
        loadingText="Loading deals..."
      />
    </main>
  );
}

function ProductSection({
  title,
  description,
  products,
  isLoading,
  emptyMessage,
  loadingText,
}: {
  title: string;
  description: string;
  products: ClientProduct[];
  isLoading: boolean;
  emptyMessage: string;
  loadingText: string;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900">{title}</h2>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>

        <Link
          href="/shop"
          className="text-sm font-bold text-blue-600 hover:underline"
        >
          View all
        </Link>
      </div>

      {isLoading ? (
        <div className="flex min-h-40 items-center justify-center">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          {loadingText}
        </div>
      ) : products.length === 0 ? (
        <EmptyProducts message={emptyMessage} />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}

function EmptyProducts({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
      <h3 className="font-bold text-gray-900">{message}</h3>
      <p className="mt-1 text-sm text-gray-500">
        Add products from the admin dashboard or check the backend API.
      </p>
    </div>
  );
}