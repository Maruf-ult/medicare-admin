"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

export default function CreateBrandPage() {
  const router = useRouter();

  const [form, setForm] = useState<BrandRequest>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

      const response = await api.post<ApiResponse<unknown>>(
        "/brands",
        cleanPayload()
      );

      if (response.data.success) {
        toast.success("Brand created successfully");
        router.push("/dashboard/brands");
      } else {
        toast.error(response.data.message || "Failed to create brand");
      }
    } catch (error) {
      console.error("Failed to create brand:", error);
      setErrorMessage("Failed to create brand. Please check your input.");
      toast.error("Failed to create brand");
    } finally {
      setIsSubmitting(false);
    }
  };

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

          <h1 className="text-3xl font-bold text-gray-900">Add Brand</h1>
          <p className="mt-1 text-gray-600">
            Create a new pharmaceutical brand or manufacturer.
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
                Creating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Create Brand
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}