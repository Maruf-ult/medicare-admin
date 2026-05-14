"use client";

import api from "@/lib/api";
import { formatCurrency, getProductStock } from "@/lib/utils";
import { ApiResponse } from "@/types";
import { CheckCircle2, Heart, Pill, Plus } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export type ClientProduct = {
  id: number;
  name: string;
  slug?: string;
  sku?: string;
  shortDescription?: string | null;
  price: number;
  discountPrice?: number | null;
  stock: number;
  requiresPrescription: boolean;
  isPrescriptionApproved?: boolean;
  isFeatured?: boolean;
  genericName?: string | null;
  brand?: string | null;
  brandName?: string | null;
  category?: string | null;
  categoryName?: string | null;
  imageUrls?: string[];
  /** Alternate field name from some API versions */
  stockQuantity?: number;
};

type ProductCardProps = {
  product: ClientProduct;
};

export default function ProductCard({ product }: ProductCardProps) {
  const brandName =
    (typeof product.brand === "string" ? product.brand : null) ??
    product.brandName ??
    "MediCare";
  const stock = getProductStock(product);
  const sellingPrice = (product.discountPrice ?? product.price) || 0;

  const hasDiscount =
    product.discountPrice !== null &&
    product.discountPrice !== undefined &&
    product.discountPrice < (product.price || 0);

  const isRxLocked =
    product.requiresPrescription && !product.isPrescriptionApproved;

  const productHref = product.slug?.trim()
    ? `/products/${product.slug}`
    : "/shop";

  const handleAddToCart = async () => {
    if (stock <= 0) {
      toast.error("This product is out of stock");
      return;
    }

    if (isRxLocked) {
      toast.error("Prescription approval is required for this medicine");
      return;
    }

    try {
      const response = await api.post<ApiResponse<unknown>>("/cart/add", {
        productId: product.id,
        quantity: 1,
      });

      if (response.data.success) {
        toast.success("Product added to cart");
      } else {
        toast.error(response.data.message || "Failed to add product to cart");
      }
    } catch (error) {
      console.error("Failed to add to cart:", error);
      toast.error("Please login to add products to cart");
    }
  };

  const handleWishlist = async () => {
    try {
      const response = await api.post<ApiResponse<unknown>>(
        `/wishlist/${product.id}`
      );

      if (response.data.success) {
        toast.success("Product added to wishlist");
      } else {
        toast.error(response.data.message || "Failed to update wishlist");
      }
    } catch (error) {
      console.error("Failed to update wishlist:", error);
      toast.error("Please login to use wishlist");
    }
  };

  return (
    <div className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:-translate-y-0.5 hover:border-blue-100 hover:shadow-md">
      <div className="relative flex h-40 items-center justify-center bg-gray-50">
        <Link href={productHref} className="h-full w-full">
          {product.imageUrls && product.imageUrls.length > 0 ? (
            <img
              src={product.imageUrls[0]}
              alt={product.name}
              className="h-full w-full object-contain p-4 transition group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-6xl transition group-hover:scale-105">
              💊
            </div>
          )}
        </Link>

        {product.requiresPrescription && (
          <span
            className={`absolute left-3 top-3 inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[11px] font-bold ${
              product.isPrescriptionApproved
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-yellow-200 bg-yellow-50 text-yellow-700"
            }`}
          >
            {product.isPrescriptionApproved ? (
              <>
                <CheckCircle2 className="h-3 w-3" />
                Rx Verified
              </>
            ) : (
              <>
                <Pill className="h-3 w-3" />
                Rx Required
              </>
            )}
          </span>
        )}

        {hasDiscount && (
          <span className="absolute bottom-3 left-3 rounded-md bg-red-100 px-2.5 py-1 text-[11px] font-bold text-red-700">
            SALE
          </span>
        )}

        <button
          type="button"
          onClick={handleWishlist}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 transition hover:border-red-200 hover:text-red-500"
          aria-label="Add to wishlist"
        >
          <Heart className="h-4 w-4" />
        </button>
      </div>

      <div className="p-4">
        <p className="mb-1 text-[11px] font-extrabold uppercase tracking-wider text-blue-600">
          {brandName}
        </p>

        <Link href={productHref}>
          <h3 className="line-clamp-2 min-h-[42px] text-sm font-bold leading-5 text-gray-900 hover:text-blue-600">
            {product.name}
          </h3>
        </Link>

        <p className="mt-1 line-clamp-1 text-xs text-gray-400">
          {product.genericName ||
            product.shortDescription ||
            "Healthcare product"}
        </p>

        {isRxLocked && (
          <Link
            href="/upload-prescription"
            className="mt-3 inline-flex rounded-md bg-yellow-50 px-2.5 py-1 text-xs font-bold text-yellow-700 hover:bg-yellow-100"
          >
            Upload prescription to unlock
          </Link>
        )}

        <div className="mt-4 flex items-center justify-between">
          <div>
            <span className="text-lg font-black text-gray-900">
              {formatCurrency(sellingPrice)}
            </span>

            {hasDiscount && (
              <span className="ml-1 text-xs font-semibold text-gray-400 line-through">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={stock <= 0 || isRxLocked}
            className={`flex h-9 w-9 items-center justify-center rounded-lg text-white transition ${
              stock <= 0 || isRxLocked
                ? "cursor-not-allowed bg-gray-300"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
            aria-label="Add to cart"
            title={
              stock <= 0
                ? "Out of stock"
                : isRxLocked
                  ? "Prescription approval required"
                  : "Add to cart"
            }
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}