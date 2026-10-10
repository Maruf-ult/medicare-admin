"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { ApiResponse, PagedResponse } from "@/types";
import ProductCard, { ClientProduct } from "@/components/client/ProductCard";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  Filter,
  Loader2,
  RefreshCcw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

type ProductFilters = {
  search: string;
  category: string;
  brand: string;
  requiresPrescription: string;
  isFeatured: string;
  sortBy: string;
};

function extractItems<T>(data: T[] | PagedResponse<T>): T[] {
  return Array.isArray(data) ? data : data.items ?? [];
}

function getFiltersFromSearchParams(
  searchParams: URLSearchParams
): ProductFilters {
  return {
    search: searchParams.get("search") ?? "",
    category: searchParams.get("category") ?? "",
    brand: searchParams.get("brand") ?? "",
    requiresPrescription: searchParams.get("rx") ?? "",
    isFeatured: searchParams.get("featured") ?? "",
    sortBy: searchParams.get("sortBy") ?? "",
  };
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex min-h-[320px] max-w-7xl items-center justify-center px-4 py-16">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading shop…
          </div>
        </div>
      }
    >
      <ShopPageContent />
    </Suspense>
  );
}

function ShopPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<ClientProduct[]>([]);

  const [filters, setFilters] = useState<ProductFilters>(() =>
    getFiltersFromSearchParams(searchParams)
  );

  const [isLoading, setIsLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const buildProductParams = (currentFilters: ProductFilters) => {
    const productParams: Record<string, string | number | boolean> = {
      pageNumber: 1,
      pageSize: 100,
    };

    if (currentFilters.search.trim()) {
      productParams.search = currentFilters.search.trim();
    }

    if (currentFilters.category.trim()) {
      productParams.category = currentFilters.category.trim();
    }

    if (currentFilters.brand.trim()) {
      productParams.brand = currentFilters.brand.trim();
    }

    if (currentFilters.requiresPrescription) {
      productParams.requiresPrescription =
        currentFilters.requiresPrescription === "true";
    }

    if (currentFilters.isFeatured) {
      productParams.isFeatured = currentFilters.isFeatured === "true";
    }

    if (currentFilters.sortBy) {
      productParams.sortBy = currentFilters.sortBy;
    }

    return productParams;
  };

  const getShopData = async (currentFilters = filters) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const productParams = buildProductParams(currentFilters);

      const productsResponse = await api.get<
        ApiResponse<ClientProduct[] | PagedResponse<ClientProduct>>
      >("/products", {
        params: productParams,
      });

      if (productsResponse.data.success && productsResponse.data.data) {
        setProducts(extractItems(productsResponse.data.data));
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Failed to load shop data:", error);
      setProducts([]);
      setErrorMessage("Failed to load products. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const newFilters = getFiltersFromSearchParams(searchParams);
    setFilters(newFilters);
    getShopData(newFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const updateFilter = <K extends keyof ProductFilters>(
    key: K,
    value: ProductFilters[K]
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const applyFilters = () => {
    const params = new URLSearchParams();

    if (filters.search.trim()) params.set("search", filters.search.trim());
    if (filters.category.trim()) params.set("category", filters.category.trim());
    if (filters.brand.trim()) params.set("brand", filters.brand.trim());
    if (filters.requiresPrescription) {
      params.set("rx", filters.requiresPrescription);
    }
    if (filters.isFeatured) params.set("featured", filters.isFeatured);
    if (filters.sortBy) params.set("sortBy", filters.sortBy);

    router.push(`/shop${params.toString() ? `?${params.toString()}` : ""}`);
    setIsFilterOpen(false);
  };

  const resetFilters = () => {
    router.push("/shop");
    setIsFilterOpen(false);
  };

  const activeFilterCount = useMemo(() => {
    return Object.values(filters).filter(Boolean).length;
  }, [filters]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Shop Medicines</h1>
          <p className="mt-2 text-sm text-gray-500">
            Browse genuine medicines, healthcare products, vitamins, and devices.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              applyFilters();
            }}
            className="flex w-full overflow-hidden rounded-lg border border-gray-200 bg-white sm:w-[360px]"
          >
            <input
              value={filters.search}
              onChange={(event) => updateFilter("search", event.target.value)}
              placeholder="Search products..."
              className="min-w-0 flex-1 px-4 py-2.5 text-sm outline-none"
            />

            <button
              type="submit"
              className="bg-blue-600 px-4 text-white hover:bg-blue-700"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>

          <Button
            type="button"
            variant="outline"
            onClick={() => setIsFilterOpen((prev) => !prev)}
            className="gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">
                {activeFilterCount}
              </span>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => getShopData(filters)}
            className="gap-2"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {isFilterOpen && (
        <div className="mb-8 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-blue-600" />
              <h2 className="font-bold text-gray-900">Filter Products</h2>
            </div>

            <button
              type="button"
              onClick={() => setIsFilterOpen(false)}
              className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Category
              </label>
              <input
                value={filters.category}
                onChange={(event) =>
                  updateFilter("category", event.target.value)
                }
                placeholder="Partial match, e.g. Antibiotics"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Brand
              </label>
              <input
                value={filters.brand}
                onChange={(event) =>
                  updateFilter("brand", event.target.value)
                }
                placeholder="Partial match, e.g. Square"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Prescription
              </label>
              <select
                value={filters.requiresPrescription}
                onChange={(event) =>
                  updateFilter("requiresPrescription", event.target.value)
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Products</option>
                <option value="true">Rx Required</option>
                <option value="false">OTC Products</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Featured
              </label>
              <select
                value={filters.isFeatured}
                onChange={(event) =>
                  updateFilter("isFeatured", event.target.value)
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Products</option>
                <option value="true">Featured Only</option>
                <option value="false">Regular Products</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Sort
              </label>
              <select
                value={filters.sortBy}
                onChange={(event) => updateFilter("sortBy", event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Default</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A to Z</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={resetFilters}>
              Reset
            </Button>

            <Button
              type="button"
              onClick={applyFilters}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {errorMessage}
        </div>
      )}

      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing{" "}
          <span className="font-bold text-gray-900">{products.length}</span>{" "}
          products
        </p>

        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={resetFilters}
            className="text-sm font-bold text-blue-600 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading products...
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <h3 className="text-lg font-bold text-gray-900">No products found</h3>
          <p className="mt-2 text-sm text-gray-500">
            Try changing your search or filter options.
          </p>
          <Button
            type="button"
            onClick={resetFilters}
            className="mt-5 bg-blue-600 text-white"
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}