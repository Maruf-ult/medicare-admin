"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { ApiResponse } from "@/types";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Loader2,
  Save,
} from "lucide-react";
import { toast } from "sonner";

type BrandResponse = {
  id: number;
  name: string;
  slug?: string;
  description?: string | null;
  logoUrl?: string | null;
  isActive: boolean;
  productCount?: number;
};

type BrandRequest = {
  name: string;
  description?: string;
  logoUrl?: string;
  isActive: boolean;
};

const initialForm: BrandRequest = {
  name: "",
  description: "",
  logoUrl: "",
  isActive: true,
};

function brandToForm(brand: BrandResponse): BrandRequest {
  return {
    name: brand.name ?? "",
    description: brand.description ?? "",
    logoUrl: brand.logoUrl ?? "",
    isActive: brand.isActive ?? true,
  };
}

export default function EditBrandPage() {
  const router = useRouter();
  const params = useParams();

  const brandId = Number(params.id);

  const [form, setForm] = useState<BrandRequest>(initialForm);
  const [brandName, setBrandName] = useState("");
  const [brandSlug, setBrandSlug] = useState("");
  const [productCount, setProductCount] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getBrand = async () => {
    if (!brandId || Number.isNaN(brandId)) {
      setErrorMessage("Invalid brand ID.");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);

      const response = await api.get<ApiResponse<BrandResponse>>(
        `/brands/${brandId}`
      );

      if (response.data.success && response.data.data) {
        const brand = response.data.data;

        setForm(brandToForm(brand));
        setBrandName(brand.name);
        setBrandSlug(brand.slug ?? "");
        setProductCount(brand.productCount ?? 0);
      } else {
        setErrorMessage(response.data.message || "Brand not found.");
      }
    } catch (error) {
      console.error("Failed to load brand:", error);
      setErrorMessage("Failed to load brand information.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getBrand();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brandId]);

  const updateField = <K extends keyof BrandRequest>(
    key: K,
    value: BrandRequest[K]
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      toast.error("Brand name is required");
      return false;
    }

    return true;
  };

  const cleanPayload = (): BrandRequest => {
    return {
      name: form.name.trim(),
      description: form.description?.trim() || undefined,
      logoUrl: form.logoUrl?.trim() || undefined,
      isActive: form.isActive,
    };
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const response = await api.put<ApiResponse<unknown>>(
        `/brands/${brandId}`,
        cleanPayload()
      );

      if (response.data.success) {
        toast.success("Brand updated successfully");
        router.push("/dashboard/brands");
      } else {
        toast.error(response.data.message || "Failed to update brand");
      }
    } catch (error) {
      console.error("Failed to update brand:", error);
      setErrorMessage("Failed to update brand. Please check your input.");
      toast.error("Failed to update brand");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading brand...
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/dashboard/brands"
            className="mb-2 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Brands
          </Link>

          <h1 className="text-3xl font-bold text-gray-900">Edit Brand</h1>
          <p className="mt-1 text-gray-600">
            Update brand information for{" "}
            <span className="font-semibold text-gray-900">
              {brandName || "this brand"}
            </span>
            .
          </p>
        </div>

        <div className="rounded-2xl bg-blue-50 p-4">
          <Building2 className="h-7 w-7 text-blue-600" />
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
            Brand Information
          </h2>

          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Brand ID
              </p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                {brandId}
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Slug
              </p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                {brandSlug ? `/${brandSlug}` : "N/A"}
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Products
              </p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                {productCount}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Brand Name *
              </label>
              <input
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="Square Pharmaceuticals"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Logo URL
              </label>
              <input
                value={form.logoUrl}
                onChange={(event) => updateField("logoUrl", event.target.value)}
                placeholder="https://example.com/logo.png"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {form.logoUrl && (
              <div className="md:col-span-2">
                <p className="mb-2 text-sm font-medium text-gray-700">
                  Logo Preview
                </p>
                <div className="flex h-28 w-28 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 p-3">
                  <img
                    src={form.logoUrl}
                    alt={form.name}
                    className="max-h-full max-w-full object-contain"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              </div>
            )}

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                rows={5}
                placeholder="Write a short description about this brand..."
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
                  Active Brand
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" asChild>
            <Link href="/dashboard/brands">Cancel</Link>
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Update Brand
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}