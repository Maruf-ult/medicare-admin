"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { ApiResponse } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Edit2,
  Loader2,
  Package,
  Pill,
  Star,
  Trash2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

type CategoryResponse = {
  id: number;
  name: string;
  slug?: string;
};

type BrandResponse = {
  id: number;
  name: string;
  slug?: string;
};

type ProductResponse = {
  id: number;
  name: string;
  slug: string;
  sku: string;
  description?: string | null;
  shortDescription?: string | null;
  price: number;
  discountPrice?: number | null;
  stock: number;
  isInStock: boolean;
  isLowStock: boolean;
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
  averageRating: number;
  reviewCount: number;
  category?: CategoryResponse | null;
  brand?: BrandResponse | null;
  imageUrls: string[];
  createdAt: string;
};

function InfoRow({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-gray-900">
        {value || "N/A"}
      </p>
    </div>
  );
}

function TextSection({
  title,
  value,
}: {
  title: string;
  value?: string | null;
}) {
  if (!value) return null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="mb-2 text-sm font-bold text-gray-900">{title}</h3>
      <p className="whitespace-pre-line text-sm leading-6 text-gray-600">
        {value}
      </p>
    </div>
  );
}

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const productId = Number(params.id);

  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getProduct = async () => {
    if (!productId || Number.isNaN(productId)) {
      setErrorMessage("Invalid product ID.");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);

      const response = await api.get<ApiResponse<ProductResponse>>(
        `/products/id/${productId}`
      );

      if (response.data.success && response.data.data) {
        setProduct(response.data.data);
      } else {
        setProduct(null);
        setErrorMessage(response.data.message || "Product not found.");
      }
    } catch (error) {
      console.error("Failed to fetch product:", error);
      setProduct(null);
      setErrorMessage("Failed to load product information.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const handleDelete = async () => {
    if (!product) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?`
    );

    if (!confirmed) return;

    try {
      setIsDeleting(true);

      const response = await api.delete<ApiResponse<null>>(
        `/products/${product.id}`
      );

      if (response.data.success) {
        toast.success("Product deleted successfully");
        router.push("/dashboard/products");
      } else {
        toast.error(response.data.message || "Failed to delete product");
      }
    } catch (error) {
      console.error("Failed to delete product:", error);
      toast.error("Failed to delete product");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading product details...
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div>
        <Link
          href="/dashboard/products"
          className="mb-6 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Products
        </Link>

        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <p className="font-medium">
              {errorMessage || "Product could not be loaded."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const sellingPrice = product.discountPrice ?? product.price;

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/dashboard/products"
            className="mb-2 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Products
          </Link>

          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          <p className="mt-1 text-sm text-gray-500">
            SKU: {product.sku} • Slug: /{product.slug}
          </p>
        </div>

        <div className="flex gap-2">
          <Button type="button" variant="outline" asChild>
            <Link href={`/dashboard/products/${product.id}/edit`}>
              <Edit2 className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>

          <Button
            type="button"
            disabled={isDeleting}
            onClick={handleDelete}
            className="bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-300"
          >
            {isDeleting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            Delete
          </Button>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-1">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex h-72 items-center justify-center rounded-2xl bg-blue-50">
              {product.imageUrls && product.imageUrls.length > 0 ? (
                <img
                  src={product.imageUrls[0]}
                  alt={product.name}
                  className="h-full w-full rounded-2xl object-contain"
                />
              ) : (
                <Package className="h-24 w-24 text-blue-300" />
              )}
            </div>

            {product.imageUrls && product.imageUrls.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-2">
                {product.imageUrls.slice(0, 4).map((imageUrl, index) => (
                  <img
                    key={`${imageUrl}-${index}`}
                    src={imageUrl}
                    alt={`${product.name} ${index + 1}`}
                    className="h-16 w-full rounded-lg border border-gray-200 object-contain"
                  />
                ))}
              </div>
            )}

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div
                className={`rounded-lg px-3 py-2 text-center text-sm font-semibold ${
                  product.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {product.isActive ? "Active" : "Inactive"}
              </div>

              <div
                className={`rounded-lg px-3 py-2 text-center text-sm font-semibold ${
                  product.requiresPrescription
                    ? "bg-red-100 text-red-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {product.requiresPrescription ? "Rx Required" : "OTC"}
              </div>
            </div>
          </div>
        </div>

        <div className="xl:col-span-2">
          <div className="space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm text-gray-500">Selling Price</p>
                  <div className="mt-1 flex items-end gap-3">
                    <h2 className="text-3xl font-bold text-blue-600">
                      {formatCurrency(sellingPrice)}
                    </h2>

                    {product.discountPrice && (
                      <p className="text-lg text-gray-400 line-through">
                        {formatCurrency(product.price)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-yellow-50 px-4 py-3">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {product.averageRating.toFixed(1)} Rating
                    </p>
                    <p className="text-xs text-gray-500">
                      {product.reviewCount} reviews
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <InfoRow label="Stock" value={`${product.stock} units`} />
                <InfoRow
                  label="Category"
                  value={product.category?.name ?? "N/A"}
                />
                <InfoRow label="Brand" value={product.brand?.name ?? "N/A"} />
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div
                  className={`flex items-center gap-2 rounded-lg p-4 ${
                    product.isInStock
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {product.isInStock ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <XCircle className="h-5 w-5" />
                  )}
                  <span className="text-sm font-semibold">
                    {product.isInStock ? "In Stock" : "Out of Stock"}
                  </span>
                </div>

                <div
                  className={`flex items-center gap-2 rounded-lg p-4 ${
                    product.isLowStock
                      ? "bg-yellow-50 text-yellow-700"
                      : "bg-green-50 text-green-700"
                  }`}
                >
                  <Package className="h-5 w-5" />
                  <span className="text-sm font-semibold">
                    {product.isLowStock ? "Low Stock" : "Healthy Stock"}
                  </span>
                </div>

                <div
                  className={`flex items-center gap-2 rounded-lg p-4 ${
                    product.isFeatured
                      ? "bg-purple-50 text-purple-700"
                      : "bg-gray-50 text-gray-700"
                  }`}
                >
                  <Star className="h-5 w-5" />
                  <span className="text-sm font-semibold">
                    {product.isFeatured ? "Featured" : "Not Featured"}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-lg font-bold text-gray-900">
                Medicine Details
              </h2>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <InfoRow label="Generic Name" value={product.genericName} />
                <InfoRow label="Dosage Form" value={product.dosageForm} />
                <InfoRow label="Strength" value={product.strength} />
                <InfoRow label="Pack Size" value={product.packSize} />
                <InfoRow label="Manufacturer" value={product.manufacturer} />
                <InfoRow
                  label="Active Ingredient"
                  value={product.activeIngredient}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-lg font-bold text-gray-900">
                Descriptions
              </h2>

              <div className="space-y-4">
                <TextSection
                  title="Short Description"
                  value={product.shortDescription}
                />
                <TextSection title="Description" value={product.description} />
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-gray-900">
                <Pill className="h-5 w-5 text-blue-600" />
                Medical Information
              </h2>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <TextSection title="Indications" value={product.indications} />
                <TextSection title="Side Effects" value={product.sideEffects} />
                <TextSection title="Warnings" value={product.warnings} />
                <TextSection
                  title="Contraindications"
                  value={product.contraindications}
                />
                <TextSection title="Storage Info" value={product.storageInfo} />
                <TextSection
                  title="Pregnancy Warning"
                  value={product.pregnancyWarning}
                />
                <div className="md:col-span-2">
                  <TextSection
                    title="Child Safety Info"
                    value={product.childSafetyInfo}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-lg font-bold text-gray-900">
                System Information
              </h2>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <InfoRow label="Product ID" value={product.id} />
                <InfoRow label="Created At" value={formatDate(product.createdAt)} />
                <InfoRow label="Slug" value={product.slug} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}