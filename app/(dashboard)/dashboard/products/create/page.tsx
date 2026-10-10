"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { ApiResponse } from "@/types";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  ArrowLeft,
  Loader2,
  PackagePlus,
  Save,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { FileUploadDropzone } from "@/components/ui/FileUploadDropzone";

type ProductRequest = {
  name: string;
  sku?: string;
  description?: string;
  shortDescription?: string;
  category: string;
  brand: string;
  price: number;
  discountPrice?: number | null;
  stock: number;
  lowStockThreshold: number;
  requiresPrescription: boolean;
  dosageForm?: string;
  strength?: string;
  packSize?: string;
  genericName?: string;
  manufacturer?: string;
  activeIngredient?: string;
  indications?: string;
  sideEffects?: string;
  warnings?: string;
  contraindications?: string;
  storageInfo?: string;
  pregnancyWarning?: string;
  childSafetyInfo?: string;
  isActive: boolean;
  isFeatured: boolean;
  imageUrls: string[];
};

const initialForm: ProductRequest = {
  name: "",
  sku: "",
  description: "",
  shortDescription: "",
  category: "",
  brand: "",
  price: 0,
  discountPrice: null,
  stock: 0,
  lowStockThreshold: 10,
  requiresPrescription: false,
  dosageForm: "",
  strength: "",
  packSize: "",
  genericName: "",
  manufacturer: "",
  activeIngredient: "",
  indications: "",
  sideEffects: "",
  warnings: "",
  contraindications: "",
  storageInfo: "",
  pregnancyWarning: "",
  childSafetyInfo: "",
  isActive: true,
  isFeatured: false,
  imageUrls: [],
};

export default function CreateProductPage() {
  const router = useRouter();

  const [form, setForm] = useState<ProductRequest>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateField = <K extends keyof ProductRequest>(
    key: K,
    value: ProductRequest[K]
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      toast.error("Product name is required");
      return false;
    }

    if (!form.category.trim()) {
      toast.error("Please enter a category");
      return false;
    }

    if (!form.brand.trim()) {
      toast.error("Please enter a brand");
      return false;
    }

    if (form.price < 0) {
      toast.error("Price cannot be negative");
      return false;
    }

    if (form.stock < 0) {
      toast.error("Stock cannot be negative");
      return false;
    }

    if (
      form.discountPrice !== null &&
      form.discountPrice !== undefined &&
      form.discountPrice > form.price
    ) {
      toast.error("Discount price cannot be greater than regular price");
      return false;
    }

    return true;
  };

  const cleanPayload = (): ProductRequest => {
    const skuTrim = form.sku?.trim();
    return {
      ...form,
      name: form.name.trim(),
      sku: skuTrim || undefined,
      description: form.description?.trim() || undefined,
      shortDescription: form.shortDescription?.trim() || undefined,
      discountPrice:
        form.discountPrice === null || Number.isNaN(form.discountPrice)
          ? null
          : form.discountPrice,
      category: form.category.trim(),
      brand: form.brand.trim(),
      dosageForm: form.dosageForm?.trim() || undefined,
      strength: form.strength?.trim() || undefined,
      packSize: form.packSize?.trim() || undefined,
      genericName: form.genericName?.trim() || undefined,
      manufacturer: form.manufacturer?.trim() || undefined,
      activeIngredient: form.activeIngredient?.trim() || undefined,
      indications: form.indications?.trim() || undefined,
      sideEffects: form.sideEffects?.trim() || undefined,
      warnings: form.warnings?.trim() || undefined,
      contraindications: form.contraindications?.trim() || undefined,
      storageInfo: form.storageInfo?.trim() || undefined,
      pregnancyWarning: form.pregnancyWarning?.trim() || undefined,
      childSafetyInfo: form.childSafetyInfo?.trim() || undefined,
    };
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const response = await api.post<ApiResponse<unknown>>(
        "/products",
        cleanPayload()
      );

      if (response.data.success) {
        toast.success("Product created successfully");
        router.push("/dashboard/products");
      } else {
        toast.error(response.data.message || "Failed to create product");
      }
    } catch (error) {
      console.error("Failed to create product:", error);
      setErrorMessage("Failed to create product. Please check your input.");
      toast.error("Failed to create product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Link
              href="/dashboard/products"
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Products
            </Link>
          </div>

          <h1 className="text-3xl font-bold text-gray-900">Add Product</h1>
          <p className="mt-1 text-gray-600">
            Create a new medicine or healthcare product.
          </p>
        </div>

        <div className="rounded-2xl bg-blue-50 p-4">
          <PackagePlus className="h-7 w-7 text-blue-600" />
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info & Images */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-lg font-bold text-gray-900">Basic Information</h2>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700">Product Name *</label>
                  <input
                    value={form.name}
                    onChange={(event) => updateField("name", event.target.value)}
                    placeholder="e.g. Napa Extend 665mg"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700">SKU</label>
                  <input
                    value={form.sku ?? ""}
                    onChange={(event) => updateField("sku", event.target.value)}
                    placeholder="Optional — leave blank if the server auto-generates SKU"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Category *</label>
                  <input
                    value={form.category}
                    onChange={(event) => updateField("category", event.target.value)}
                    placeholder="e.g. Antibiotics, OTC, Baby care"
                    maxLength={200}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Brand *</label>
                  <input
                    value={form.brand}
                    onChange={(event) => updateField("brand", event.target.value)}
                    placeholder="e.g. Square, Beximco"
                    maxLength={200}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700">Short Description</label>
                  <input
                    value={form.shortDescription}
                    onChange={(event) => updateField("shortDescription", event.target.value)}
                    placeholder="Short summary shown in product cards"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700">Full Description</label>
                  <textarea
                    value={form.description}
                    onChange={(event) => updateField("description", event.target.value)}
                    rows={4}
                    placeholder="Full product description..."
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-lg font-bold text-gray-900">Price & Stock</h2>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Price *</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(event) => updateField("price", Number(event.target.value))}
                    min={0}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Discount Price</label>
                  <input
                    type="number"
                    value={form.discountPrice ?? ""}
                    onChange={(event) =>
                      updateField(
                        "discountPrice",
                        event.target.value === "" ? null : Number(event.target.value)
                      )
                    }
                    min={0}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Stock *</label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(event) => updateField("stock", Number(event.target.value))}
                    min={0}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Low Stock Alert</label>
                  <input
                    type="number"
                    value={form.lowStockThreshold}
                    onChange={(event) => updateField("lowStockThreshold", Number(event.target.value))}
                    min={0}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                <label className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={form.requiresPrescription}
                    onChange={(event) => updateField("requiresPrescription", event.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-700">Requires Prescription</span>
                </label>

                <label className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(event) => updateField("isFeatured", event.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-700">Featured Product</span>
                </label>

                <label className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(event) => updateField("isActive", event.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-700">Active Status</span>
                </label>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sticky top-6">
              <h2 className="mb-6 text-lg font-bold text-gray-900">Product Image</h2>
              <FileUploadDropzone
                folder="products"
                value={form.imageUrls[0]}
                onChange={(url) => {
                  const next = Array.isArray(url)
                    ? url.filter((u): u is string => typeof u === "string")
                    : url
                      ? [url]
                      : [];
                  updateField("imageUrls", next);
                }}
                accept="image/*"
                maxSize={5}
                label=""
              />
              <p className="mt-4 text-sm text-gray-500 text-center">
                Upload a product image (optional).
              </p>
            </div>
          </div>
        </div>

        {/* Advanced Settings Toggle */}
        <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between p-6 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="flex flex-col text-left">
              <h2 className="text-lg font-bold text-gray-900">Advanced Medical Information</h2>
              <p className="text-sm text-gray-500">Optional fields for detailed medicinal specifications</p>
            </div>
            {showAdvanced ? (
              <ChevronUp className="h-6 w-6 text-gray-400" />
            ) : (
              <ChevronDown className="h-6 w-6 text-gray-400" />
            )}
          </button>

          {showAdvanced && (
            <div className="p-6 border-t border-gray-200">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-3 mb-8">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Generic Name</label>
                  <input
                    value={form.genericName}
                    onChange={(event) => updateField("genericName", event.target.value)}
                    placeholder="e.g. Paracetamol"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Dosage Form</label>
                  <input
                    value={form.dosageForm}
                    onChange={(event) => updateField("dosageForm", event.target.value)}
                    placeholder="e.g. Tablet, Syrup"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Strength</label>
                  <input
                    value={form.strength}
                    onChange={(event) => updateField("strength", event.target.value)}
                    placeholder="e.g. 500mg"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Pack Size</label>
                  <input
                    value={form.packSize}
                    onChange={(event) => updateField("packSize", event.target.value)}
                    placeholder="e.g. 10 tablets"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700">Active Ingredient</label>
                  <input
                    value={form.activeIngredient}
                    onChange={(event) => updateField("activeIngredient", event.target.value)}
                    placeholder="e.g. Paracetamol"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <TextAreaField label="Indications" value={form.indications ?? ""} onChange={(value) => updateField("indications", value)} />
                <TextAreaField label="Side Effects" value={form.sideEffects ?? ""} onChange={(value) => updateField("sideEffects", value)} />
                <TextAreaField label="Warnings" value={form.warnings ?? ""} onChange={(value) => updateField("warnings", value)} />
                <TextAreaField label="Contraindications" value={form.contraindications ?? ""} onChange={(value) => updateField("contraindications", value)} />
                <TextAreaField label="Storage Info" value={form.storageInfo ?? ""} onChange={(value) => updateField("storageInfo", value)} />
                <TextAreaField label="Pregnancy Warning" value={form.pregnancyWarning ?? ""} onChange={(value) => updateField("pregnancyWarning", value)} />
                <div className="md:col-span-2">
                  <TextAreaField label="Child Safety Info" value={form.childSafetyInfo ?? ""} onChange={(value) => updateField("childSafetyInfo", value)} />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" asChild>
            <Link href="/dashboard/products">Cancel</Link>
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
                Create Product
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}