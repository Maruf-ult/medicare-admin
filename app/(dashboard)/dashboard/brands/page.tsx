"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { AlertCircle, Edit2, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

type BackendBrand = {
  id: number;
  name: string;
  slug?: string;
  logoUrl?: string | null;
  description?: string | null;
  isActive?: boolean;
  productCount?: number;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
};

type PagedResponse<T> = {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

type BrandTableItem = {
  id: number;
  name: string;
  slug?: string;
  productCount: number;
  status: "active" | "inactive";
};

function normalizeBrands(
  data: BackendBrand[] | PagedResponse<BackendBrand>
): BrandTableItem[] {
  const brands = Array.isArray(data) ? data : data.items;

  return brands.map((brand) => ({
    id: brand.id,
    name: brand.name,
    slug: brand.slug,
    productCount: brand.productCount ?? 0,
    status: brand.isActive === false ? "inactive" : "active",
  }));
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<BrandTableItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getBrands = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const response = await api.get<
        ApiResponse<BackendBrand[] | PagedResponse<BackendBrand>>
      >("/brands", {
        params: {
          pageNumber: 1,
          pageSize: 100,
        },
      });

      if (response.data.success && response.data.data) {
        setBrands(normalizeBrands(response.data.data));
      } else {
        setBrands([]);
        setErrorMessage(response.data.message || "Failed to load brands.");
      }
    } catch (error) {
      console.error("Failed to fetch brands:", error);
      setBrands([]);
      setErrorMessage("Failed to load brands. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getBrands();
  }, []);

  const handleDeleteBrand = async (brand: BrandTableItem) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${brand.name}"?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(brand.id);

      const response = await api.delete<ApiResponse<null>>(
        `/brands/${brand.id}`
      );

      if (response.data.success) {
        setBrands((prev) => prev.filter((b) => b.id !== brand.id));
        toast.success(`Brand "${brand.name}" deleted successfully`);
      } else {
        toast.error(response.data.message || "Failed to delete brand.");
      }
    } catch (error) {
      console.error("Failed to delete brand:", error);
      toast.error("Failed to delete brand. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading brands...
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Brands</h1>
          <p className="mt-1 text-gray-600">
            Manage pharmaceutical companies and product brands.
          </p>
        </div>

        <Button
          asChild
          className="flex items-center space-x-2 bg-blue-600 text-white hover:bg-blue-700"
        >
          <Link href="/dashboard/brands/create">
            <Plus className="h-4 w-4" />
            <span>Add Brand</span>
          </Link>
        </Button>
      </div>

      {errorMessage && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {errorMessage}
        </div>
      )}

      {brands.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center">
          <h3 className="text-lg font-semibold text-gray-900">
            No brands found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Create your first brand to organize medicine products.
          </p>

          <Button asChild className="mt-5 bg-blue-600 text-white hover:bg-blue-700">
            <Link href="/dashboard/brands/create">
              <Plus className="mr-2 h-4 w-4" />
              Add Brand
            </Link>
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                  Brand Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                  Products
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {brands.map((brand) => (
                <tr key={brand.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {brand.name}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-700">
                    {brand.slug ? `/${brand.slug}` : "N/A"}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-700">
                    {brand.productCount}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`rounded px-2 py-1 text-xs font-medium ${
                        brand.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {brand.status}
                    </span>
                  </td>

                  <td className="flex items-center space-x-3 px-6 py-4">
                    <Link
                      href={`/dashboard/brands/${brand.id}/edit`}
                      className="text-orange-600 hover:text-orange-700"
                      title="Edit brand"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Link>

                    <button
                      type="button"
                      disabled={deletingId === brand.id}
                      onClick={() => handleDeleteBrand(brand)}
                      className="text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                      title="Delete brand"
                    >
                      {deletingId === brand.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}