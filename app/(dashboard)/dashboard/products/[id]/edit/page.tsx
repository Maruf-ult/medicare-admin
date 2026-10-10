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
  Loader2,
  PackageSearch,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { FileUploadDropzone } from "@/components/ui/FileUploadDropzone";
import { getProductStock } from "@/lib/utils";

type ProductResponse = {
  id: number;
  name: string;
  lowStockThreshold?: number;
  slug: string;
  sku?: string | null;
  SKU?: string | null;
  description?: string | null;
  shortDescription?: string | null;
  price: number;
  discountPrice?: number | null;
  stock: number;
  stockQuantity?: number;
  isLowStock?: boolean; 
  requiresPrescription: boolean;
  dosageForm?: string | null;
  strength?: string | null;
  packSize?: string | null;
  genericName?: string | null;
  manufacturer?: string | null;
  activeIngredient?: string | null;
  indications?: string | null;
  sideEffects?: string | null;
  warnings?: string | null;
  contraindications?: string | null;
  storageInfo?: string | null;
  pregnancyWarning?: string | null;
  childSafetyInfo?: string | null;
  isActive: boolean;
  isFeatured: boolean;
  category?: string | null;
  brand?: string | null;
  imageUrls?: string[];
};

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

function productToForm(product: ProductResponse): ProductRequest {
  const skuVal = product.sku ?? product.SKU ?? "";
  return {
    name: product.name ?? "",
    sku: skuVal ? String(skuVal) : "",
    description: product.description ?? "",
    shortDescription: product.shortDescription ?? "",
    category: product.category ?? "",
    brand: product.brand ?? "",
    lowStockThreshold: product.lowStockThreshold ?? 10,
    price: product.price ?? 0,
    discountPrice: product.discountPrice ?? null,
    stock: getProductStock(product),
    requiresPrescription: product.requiresPrescription ?? false,
    dosageForm: product.dosageForm ?? "",
    strength: product.strength ?? "",
    packSize: product.packSize ?? "",
    genericName: product.genericName ?? "",
    manufacturer: product.manufacturer ?? "",
    activeIngredient: product.activeIngredient ?? "",
    indications: product.indications ?? "",
    sideEffects: product.sideEffects ?? "",
    warnings: product.warnings ?? "",
    contraindications: product.contraindications ?? "",
    storageInfo: product.storageInfo ?? "",
    pregnancyWarning: product.pregnancyWarning ?? "",
    childSafetyInfo: product.childSafetyInfo ?? "",
    isActive: product.isActive ?? true,
    isFeatured: product.isFeatured ?? false,
    imageUrls: product.imageUrls?.length ? [...product.imageUrls] : [],
  };
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();

  const productId = Number(params.id);

  const [form, setForm] = useState<ProductRequest>(initialForm);
  const [productName, setProductName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getPageData = async () => {
    if (!productId || Number.isNaN(productId)) {
      setErrorMessage("Invalid product ID.");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);

      const productResponse = await api.get<ApiResponse<ProductResponse>>(
        `/products/id/${productId}`,
      );

      if (productResponse.data.success && productResponse.data.data) {
        const product = productResponse.data.data;
        setProductName(product.name);
        setForm(productToForm(product));
      } else {
        setErrorMessage(productResponse.data.message || "Product not found.");
      }
    } catch (error) {
      console.error("Failed to load product edit data:", error);
      setErrorMessage("Failed to load product information.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getPageData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

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

    if (form.lowStockThreshold < 0) {
      toast.error("Low stock threshold cannot be negative");
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
      imageUrls: form.imageUrls.filter(Boolean),
      category: form.category.trim(),
      brand: form.brand.trim(),
    };
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const response = await api.put<ApiResponse<unknown>>(
        `/products/${productId}`,
        cleanPayload()
      );

      if (response.data.success) {
        toast.success("Product updated successfully");
        router.push("/dashboard/products");
      } else {
        toast.error(response.data.message || "Failed to update product");
      }
    } catch (error) {
      console.error("Failed to update product:", error);
      setErrorMessage("Failed to update product. Please check your input.");
      toast.error("Failed to update product");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading product...
        </div>
      </div>
    );
  }

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

          <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
          <p className="mt-1 text-gray-600">
            Update product information for{" "}
            <span className="font-semibold text-gray-900">
              {productName || "this product"}
            </span>
            .
          </p>
        </div>

        <div className="rounded-2xl bg-blue-50 p-4">
          <PackageSearch className="h-7 w-7 text-blue-600" />
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
            Basic Information
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <InputField
              label="Product Name *"
              value={form.name}
              onChange={(value) => updateField("name", value)}
              placeholder="Napa Extend 665mg"
            />

            <InputField
              label="SKU"
              value={form.sku ?? ""}
              onChange={(value) => updateField("sku", value)}
              placeholder="Leave blank to keep auto-generated SKU"
            />

            <InputField
              label="Generic Name"
              value={form.genericName ?? ""}
              onChange={(value) => updateField("genericName", value)}
              placeholder="Paracetamol"
            />

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Category *
              </label>
              <input
                value={form.category}
                onChange={(event) =>
                  updateField("category", event.target.value)
                }
                maxLength={200}
                placeholder="e.g. Antibiotics"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Brand *
              </label>
              <input
                value={form.brand}
                onChange={(event) =>
                  updateField("brand", event.target.value)
                }
                maxLength={200}
                placeholder="e.g. Square"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <InputField
                label="Short Description"
                value={form.shortDescription ?? ""}
                onChange={(value) => updateField("shortDescription", value)}
                placeholder="Short summary shown in product cards"
              />
            </div>

            <div className="md:col-span-2">
              <TextAreaField
                label="Description"
                value={form.description ?? ""}
                onChange={(value) => updateField("description", value)}
                rows={4}
                placeholder="Full product description"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-bold text-gray-900">
            Price & Stock
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
            <NumberField
              label="Price *"
              value={form.price}
              onChange={(value) => updateField("price", value)}
            />

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Discount Price
              </label>
              <input
                type="number"
                value={form.discountPrice ?? ""}
                onChange={(event) =>
                  updateField(
                    "discountPrice",
                    event.target.value === ""
                      ? null
                      : Number(event.target.value)
                  )
                }
                min={0}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <NumberField
              label="Stock *"
              value={form.stock}
              onChange={(value) => updateField("stock", value)}
            />

            <NumberField
              label="Low Stock Threshold"
              value={form.lowStockThreshold}
              onChange={(value) => updateField("lowStockThreshold", value)}
            />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <CheckboxField
              label="Requires Prescription"
              checked={form.requiresPrescription}
              onChange={(checked) =>
                updateField("requiresPrescription", checked)
              }
            />

            <CheckboxField
              label="Featured Product"
              checked={form.isFeatured}
              onChange={(checked) => updateField("isFeatured", checked)}
            />

            <CheckboxField
              label="Active Product"
              checked={form.isActive}
              onChange={(checked) => updateField("isActive", checked)}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-bold text-gray-900">
            Medicine Details
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <InputField
              label="Dosage Form"
              value={form.dosageForm ?? ""}
              onChange={(value) => updateField("dosageForm", value)}
              placeholder="Tablet, Syrup, Capsule"
            />

            <InputField
              label="Strength"
              value={form.strength ?? ""}
              onChange={(value) => updateField("strength", value)}
              placeholder="500mg"
            />

            <InputField
              label="Pack Size"
              value={form.packSize ?? ""}
              onChange={(value) => updateField("packSize", value)}
              placeholder="10 tablets"
            />

            <InputField
              label="Manufacturer"
              value={form.manufacturer ?? ""}
              onChange={(value) => updateField("manufacturer", value)}
              placeholder="Square Pharmaceuticals"
            />

            <div className="md:col-span-2">
              <InputField
                label="Active Ingredient"
                value={form.activeIngredient ?? ""}
                onChange={(value) => updateField("activeIngredient", value)}
                placeholder="Paracetamol"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-bold text-gray-900">
            Medical Information
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <TextAreaField
              label="Indications"
              value={form.indications ?? ""}
              onChange={(value) => updateField("indications", value)}
            />

            <TextAreaField
              label="Side Effects"
              value={form.sideEffects ?? ""}
              onChange={(value) => updateField("sideEffects", value)}
            />

            <TextAreaField
              label="Warnings"
              value={form.warnings ?? ""}
              onChange={(value) => updateField("warnings", value)}
            />

            <TextAreaField
              label="Contraindications"
              value={form.contraindications ?? ""}
              onChange={(value) => updateField("contraindications", value)}
            />

            <TextAreaField
              label="Storage Info"
              value={form.storageInfo ?? ""}
              onChange={(value) => updateField("storageInfo", value)}
            />

            <TextAreaField
              label="Pregnancy Warning"
              value={form.pregnancyWarning ?? ""}
              onChange={(value) => updateField("pregnancyWarning", value)}
            />

            <div className="md:col-span-2">
              <TextAreaField
                label="Child Safety Info"
                value={form.childSafetyInfo ?? ""}
                onChange={(value) => updateField("childSafetyInfo", value)}
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-bold text-gray-900">
            Product Image
          </h2>
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
          <p className="mt-3 text-sm text-gray-500">
            Upload or replace the primary product image (optional).
          </p>
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
                Updating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Update Product
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        type="number"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        min={0}
        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

function CheckboxField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 rounded-lg border border-gray-200 p-4">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-gray-300"
      />
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  rows = 3,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}