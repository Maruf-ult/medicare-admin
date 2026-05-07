"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { ApiResponse, PagedResponse } from "@/types";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  ArrowLeft,
  FolderPlus,
  Loader2,
  Save,
} from "lucide-react";
import { toast } from "sonner";

type Category = {
  id: number;
  name: string;
  slug?: string;
  description?: string | null;
  parentCategoryId?: number | null;
  sortOrder?: number;
  isActive?: boolean;
};

type CategoryRequest = {
  name: string;
  description?: string;
  imageUrl?: string;
  parentCategoryId?: number | null;
  sortOrder: number;
  isActive: boolean;
};

const initialForm: CategoryRequest = {
  name: "",
  description: "",
  imageUrl: "",
  parentCategoryId: null,
  sortOrder: 0,
  isActive: true,
};

function extractItems<T>(data: T[] | PagedResponse<T>): T[] {
  return Array.isArray(data) ? data : data.items ?? [];
}

export default function CreateCategoryPage() {
  const router = useRouter();

  const [form, setForm] = useState<CategoryRequest>(initialForm);
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getParentCategories = async () => {
    try {
      setIsLoadingOptions(true);
      setErrorMessage(null);

      const response = await api.get<ApiResponse<Category[] | PagedResponse<Category>>>(
        "/categories",
        {
          params: {
            pageNumber: 1,
            pageSize: 100,
          },
        }
      );

      if (response.data.success && response.data.data) {
        setParentCategories(extractItems(response.data.data));
      } else {
        setParentCategories([]);
      }
    } catch (error) {
      console.error("Failed to load categories:", error);
      setParentCategories([]);
      setErrorMessage("Failed to load parent categories.");
    } finally {
      setIsLoadingOptions(false);
    }
  };

  useEffect(() => {
    getParentCategories();
  }, []);

  const updateField = <K extends keyof CategoryRequest>(
    key: K,
    value: CategoryRequest[K]
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      toast.error("Category name is required");
      return false;
    }

    if (form.sortOrder < 0) {
      toast.error("Sort order cannot be negative");
      return false;
    }

    return true;
  };

  const cleanPayload = (): CategoryRequest => {
    return {
      name: form.name.trim(),
      description: form.description?.trim() || undefined,
      imageUrl: form.imageUrl?.trim() || undefined,
      parentCategoryId: form.parentCategoryId || null,
      sortOrder: form.sortOrder,
      isActive: form.isActive,
    };
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const response = await api.post<ApiResponse<unknown>>(
        "/categories",
        cleanPayload()
      );

      if (response.data.success) {
        toast.success("Category created successfully");
        router.push("/dashboard/categories");
      } else {
        toast.error(response.data.message || "Failed to create category");
      }
    } catch (error) {
      console.error("Failed to create category:", error);
      setErrorMessage("Failed to create category. Please check your input.");
      toast.error("Failed to create category");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingOptions) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading category form...
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/dashboard/categories"
            className="mb-2 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Categories
          </Link>

          <h1 className="text-3xl font-bold text-gray-900">Add Category</h1>
          <p className="mt-1 text-gray-600">
            Create a new category for organizing medicines and health products.
          </p>
        </div>

        <div className="rounded-2xl bg-blue-50 p-4">
          <FolderPlus className="h-7 w-7 text-blue-600" />
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-bold text-gray-900">
            Category Information
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Category Name *
              </label>
              <input
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="Pain Relief"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Parent Category
              </label>
              <select
                value={form.parentCategoryId ?? 0}
                onChange={(event) =>
                  updateField(
                    "parentCategoryId",
                    Number(event.target.value) === 0
                      ? null
                      : Number(event.target.value)
                  )
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={0}>No parent category</option>
                {parentCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Image URL
              </label>
              <input
                value={form.imageUrl}
                onChange={(event) => updateField("imageUrl", event.target.value)}
                placeholder="https://example.com/category.png"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Sort Order
              </label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(event) =>
                  updateField("sortOrder", Number(event.target.value))
                }
                min={0}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                rows={4}
                placeholder="Write a short description about this category..."
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-3 rounded-lg border border-gray-200 p-4">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) =>
                    updateField("isActive", event.target.checked)
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">
                  Active Category
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" asChild>
            <Link href="/dashboard/categories">Cancel</Link>
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Create Category
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}