"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Edit2, Loader2, Plus, Trash2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

type BackendCategory = {
  id: number;
  name: string;
  slug?: string;
  imageUrl?: string | null;
  description?: string | null;
  parentCategoryId?: number | null;
  sortOrder?: number;
  isActive: boolean;
  productCount?: number;
  subCategories?: BackendCategory[];
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

type CategoryCardItem = {
  id: number;
  name: string;
  slug?: string;
  productCount: number;
  status: "active" | "inactive";
};

function normalizeCategories(
  data: BackendCategory[] | PagedResponse<BackendCategory>
): CategoryCardItem[] {
  const categories = Array.isArray(data) ? data : data.items;

  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    productCount: category.productCount ?? 0,
    status: category.isActive ? "active" : "inactive",
  }));
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryCardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getCategories = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const response = await api.get<
        ApiResponse<BackendCategory[] | PagedResponse<BackendCategory>>
      >("/categories", {
        params: {
          pageNumber: 1,
          pageSize: 100,
        },
      });

      if (response.data.success && response.data.data) {
        setCategories(normalizeCategories(response.data.data));
      } else {
        setCategories([]);
        setErrorMessage(response.data.message || "Failed to load categories.");
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      setCategories([]);
      setErrorMessage("Failed to load categories. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getCategories();
  }, []);

  const handleDeleteCategory = async (category: CategoryCardItem) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name}"?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(category.id);

      const response = await api.delete<ApiResponse<null>>(
        `/categories/${category.id}`
      );

      if (response.data.success) {
        setCategories((prev) => prev.filter((c) => c.id !== category.id));
        toast.success(`Category "${category.name}" deleted successfully`);
      } else {
        toast.error(response.data.message || "Failed to delete category.");
      }
    } catch (error) {
      console.error("Failed to delete category:", error);
      toast.error("Failed to delete category. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading categories...
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="mt-1 text-gray-600">
            Manage medicine and healthcare product categories.
          </p>
        </div>

        <Button
          asChild
          className="flex items-center space-x-2 bg-blue-600 text-white hover:bg-blue-700"
        >
          <Link href="/dashboard/categories/create">
            <Plus className="h-4 w-4" />
            <span>Add Category</span>
          </Link>
        </Button>
      </div>

      {errorMessage && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {errorMessage}
        </div>
      )}

      {categories.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center">
          <h3 className="text-lg font-semibold text-gray-900">
            No categories found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Create your first category to organize products.
          </p>
          <Button asChild className="mt-5 bg-blue-600 text-white hover:bg-blue-700">
            <Link href="/dashboard/categories/create">
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <div
              key={category.id}
              className="rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {category.name}
                  </h3>
                  {category.slug && (
                    <p className="mt-1 text-xs text-gray-400">
                      /{category.slug}
                    </p>
                  )}
                </div>

                <span
                  className={`rounded px-2 py-1 text-xs font-medium ${
                    category.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {category.status}
                </span>
              </div>

              <p className="mb-4 text-sm text-gray-600">
                {category.productCount} products
              </p>

              <div className="flex items-center space-x-2">
                <Link
                  href={`/dashboard/categories/${category.id}/edit`}
                  className="flex flex-1 items-center justify-center space-x-1 text-sm font-medium text-orange-600 hover:text-orange-700"
                >
                  <Edit2 className="h-4 w-4" />
                  <span>Edit</span>
                </Link>

                <button
                  type="button"
                  disabled={deletingId === category.id}
                  onClick={() => handleDeleteCategory(category)}
                  className="flex flex-1 items-center justify-center space-x-1 text-sm font-medium text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deletingId === category.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}