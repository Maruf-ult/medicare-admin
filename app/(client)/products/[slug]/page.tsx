"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { ApiResponse, PagedResponse } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Heart,
  Loader2,
  Minus,
  Package,
  Pill,
  Plus,
  RefreshCcw,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

type Product = {
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
  isPrescriptionApproved?: boolean;
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
  category?: {
    id: number;
    name: string;
    slug?: string;
  } | null;
  brand?: {
    id: number;
    name: string;
    slug?: string;
  } | null;
  imageUrls: string[];
  createdAt: string;
};

type Review = {
  id: number;
  rating: number;
  comment?: string | null;
  customerName?: string | null;
  userName?: string | null;
  createdAt: string;
};

function extractItems<T>(data: T[] | PagedResponse<T>): T[] {
  return Array.isArray(data) ? data : data.items ?? [];
}

function InfoBox({
  title,
  value,
}: {
  title: string;
  value?: string | number | null;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
        {title}
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
      <h3 className="mb-2 text-sm font-black text-gray-900">{title}</h3>
      <p className="whitespace-pre-line text-sm leading-7 text-gray-600">
        {value}
      </p>
    </div>
  );
}

function RatingStars({ rating }: { rating: number }) {
  const rounded = Math.round(rating);

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={`h-4 w-4 ${
            index < rounded
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
}

export default function ProductDetailsPage() {
  const params = useParams();
  const slug = String(params.slug);

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isCartLoading, setIsCartLoading] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getProductDetails = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const productResponse = await api.get<ApiResponse<Product>>(
        `/products/${slug}`
      );

      if (!productResponse.data.success || !productResponse.data.data) {
        setProduct(null);
        setErrorMessage(productResponse.data.message || "Product not found.");
        return;
      }

      const productData = productResponse.data.data;
      setProduct(productData);
      setSelectedImage(productData.imageUrls?.[0] ?? null);

      const [reviewsResponse, wishlistResponse] = await Promise.allSettled([
        api.get<ApiResponse<Review[] | PagedResponse<Review>>>(
          `/reviews/product/${productData.id}`
        ),
        api.get<ApiResponse<boolean>>(`/wishlist/check/${productData.id}`),
      ]);

      if (
        reviewsResponse.status === "fulfilled" &&
        reviewsResponse.value.data.success &&
        reviewsResponse.value.data.data
      ) {
        setReviews(extractItems(reviewsResponse.value.data.data));
      } else {
        setReviews([]);
      }

      if (
        wishlistResponse.status === "fulfilled" &&
        wishlistResponse.value.data.success
      ) {
        setIsWishlisted(Boolean(wishlistResponse.value.data.data));
      } else {
        setIsWishlisted(false);
      }
    } catch (error) {
      console.error("Failed to load product details:", error);
      setProduct(null);
      setReviews([]);
      setErrorMessage("Failed to load product details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getProductDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const increaseQuantity = () => {
    if (!product) return;

    setQuantity((prev) => {
      if (prev >= product.stock) return prev;
      return prev + 1;
    });
  };

  const decreaseQuantity = () => {
    setQuantity((prev) => Math.max(prev - 1, 1));
  };

  const handleAddToCart = async () => {
    if (!product) return;

    if (!product.isInStock || product.stock <= 0) {
      toast.error("This product is currently out of stock");
      return;
    }

    const isRxLocked =
      product.requiresPrescription && !product.isPrescriptionApproved;

    if (isRxLocked) {
      toast.error("Prescription approval is required for this medicine");
      return;
    }

    try {
      setIsCartLoading(true);

      const response = await api.post<ApiResponse<unknown>>("/cart/add", {
        productId: product.id,
        quantity,
      });

      if (response.data.success) {
        toast.success("Product added to cart");
      } else {
        toast.error(response.data.message || "Failed to add product to cart");
      }
    } catch (error) {
      console.error("Failed to add product to cart:", error);
      toast.error("Please login to add products to cart");
    } finally {
      setIsCartLoading(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!product) return;

    try {
      setIsWishlistLoading(true);

      if (isWishlisted) {
        const response = await api.delete<ApiResponse<unknown>>(
          `/wishlist/${product.id}`
        );

        if (response.data.success) {
          setIsWishlisted(false);
          toast.success("Removed from wishlist");
        } else {
          toast.error(response.data.message || "Failed to update wishlist");
        }
      } else {
        const response = await api.post<ApiResponse<unknown>>(
          `/wishlist/${product.id}`
        );

        if (response.data.success) {
          setIsWishlisted(true);
          toast.success("Added to wishlist");
        } else {
          toast.error(response.data.message || "Failed to update wishlist");
        }
      }
    } catch (error) {
      console.error("Failed to update wishlist:", error);
      toast.error("Please login to use wishlist");
    } finally {
      setIsWishlistLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-[500px] max-w-7xl items-center justify-center px-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading product details...
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          href="/shop"
          className="mb-6 inline-flex items-center text-sm font-bold text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Shop
        </Link>

        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <p className="font-semibold">
              {errorMessage || "Product could not be loaded."}
            </p>
          </div>

          <Button
            type="button"
            onClick={getProductDetails}
            className="mt-5 bg-red-600 text-white hover:bg-red-700"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const sellingPrice = (product.discountPrice ?? product.price) || 0;
  const hasDiscount =
    product.discountPrice !== null &&
    product.discountPrice !== undefined &&
    product.discountPrice < (product.price || 0);

  const isRxLocked =
    product.requiresPrescription && !product.isPrescriptionApproved;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/shop"
          className="inline-flex items-center text-sm font-bold text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Shop
        </Link>

        <Button
          type="button"
          variant="outline"
          onClick={getProductDetails}
          className="gap-2"
        >
          <RefreshCcw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {errorMessage && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="relative flex h-[420px] items-center justify-center rounded-xl bg-gray-50">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="h-full w-full rounded-xl object-contain p-6"
                />
              ) : (
                <div className="text-9xl">💊</div>
              )}

              {product.requiresPrescription && (
                <span
                  className={`absolute left-4 top-4 inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-bold ${
                    product.isPrescriptionApproved
                      ? "border-green-200 bg-green-50 text-green-700"
                      : "border-yellow-200 bg-yellow-50 text-yellow-700"
                  }`}
                >
                  {product.isPrescriptionApproved ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Rx Verified
                    </>
                  ) : (
                    <>
                      <Pill className="h-3.5 w-3.5" />
                      Rx Required
                    </>
                  )}
                </span>
              )}

              {hasDiscount && (
                <span className="absolute bottom-4 left-4 rounded-md bg-red-100 px-3 py-1.5 text-xs font-bold text-red-700">
                  SALE
                </span>
              )}
            </div>

            {product.imageUrls && product.imageUrls.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3">
                {product.imageUrls.slice(0, 4).map((imageUrl, index) => (
                  <button
                    key={`${imageUrl}-${index}`}
                    type="button"
                    onClick={() => setSelectedImage(imageUrl)}
                    className={`h-20 rounded-lg border bg-gray-50 p-2 ${
                      selectedImage === imageUrl
                        ? "border-blue-600"
                        : "border-gray-200"
                    }`}
                  >
                    <img
                      src={imageUrl}
                      alt={`${product.name} ${index + 1}`}
                      className="h-full w-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4">
              <Truck className="h-5 w-5 text-blue-600" />
              <div>
                <h4 className="text-sm font-black text-gray-900">
                  Fast Delivery
                </h4>
                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Delivery support available.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4">
              <ShieldCheck className="h-5 w-5 text-blue-600" />
              <div>
                <h4 className="text-sm font-black text-gray-900">
                  Genuine Product
                </h4>
                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Trusted pharmacy stock.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4">
              <Package className="h-5 w-5 text-blue-600" />
              <div>
                <h4 className="text-sm font-black text-gray-900">
                  Safe Packaging
                </h4>
                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Packed with care.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {product.brand?.name && (
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-600">
                  {product.brand.name}
                </span>
              )}

              {product.category?.name && (
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">
                  {product.category.name}
                </span>
              )}

              {product.isFeatured && (
                <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700">
                  Featured
                </span>
              )}

              {product.requiresPrescription &&
                product.isPrescriptionApproved && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Approved for You
                  </span>
                )}
            </div>

            <h1 className="text-3xl font-black leading-tight text-gray-900">
              {product.name}
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              SKU: {product.sku}{" "}
              {product.genericName ? `• ${product.genericName}` : ""}
            </p>

            <div className="mt-4 flex items-center gap-3">
              <RatingStars rating={product.averageRating || 0} />
              <span className="text-sm font-semibold text-gray-700">
                {(product.averageRating || 0).toFixed(1)}
              </span>
              <span className="text-sm text-gray-400">
                ({product.reviewCount || reviews.length} reviews)
              </span>
            </div>

            <div className="mt-6 flex items-end gap-3">
              <h2 className="text-4xl font-black text-blue-600">
                {formatCurrency(sellingPrice)}
              </h2>

              {hasDiscount && (
                <p className="text-xl font-bold text-gray-400 line-through">
                  {formatCurrency(product.price)}
                </p>
              )}
            </div>

            <p className="mt-5 text-sm leading-7 text-gray-600">
              {product.shortDescription ||
                product.description ||
                "No short description available for this product."}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <InfoBox title="Stock" value={`${product.stock} units`} />
              <InfoBox
                title="Availability"
                value={product.isInStock ? "In Stock" : "Out of Stock"}
              />
              <InfoBox
                title="Prescription"
                value={
                  product.requiresPrescription
                    ? product.isPrescriptionApproved
                      ? "Approved"
                      : "Required"
                    : "Not Required"
                }
              />
              <InfoBox title="Dosage Form" value={product.dosageForm} />
              <InfoBox title="Strength" value={product.strength} />
              <InfoBox title="Pack Size" value={product.packSize} />
              <InfoBox title="Manufacturer" value={product.manufacturer} />
            </div>

            {product.requiresPrescription &&
              (product.isPrescriptionApproved ? (
                <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4">
                  <div className="flex gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-700" />
                    <div>
                      <h3 className="font-bold text-green-900">
                        Prescription verified
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-green-700">
                        You are approved to order this prescription medicine.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-6 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
                  <div className="flex gap-3">
                    <Pill className="mt-0.5 h-5 w-5 text-yellow-700" />
                    <div>
                      <h3 className="font-bold text-yellow-900">
                        Prescription required
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-yellow-700">
                        You need prescription approval before ordering this
                        medicine.
                      </p>

                      <Link
                        href="/upload-prescription"
                        className="mt-3 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
                      >
                        <Upload className="h-4 w-4" />
                        Upload Prescription
                      </Link>
                    </div>
                  </div>
                </div>
              ))}

            <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex w-fit items-center overflow-hidden rounded-lg border border-gray-200 bg-white">
                <button
                  type="button"
                  onClick={decreaseQuantity}
                  className="flex h-11 w-11 items-center justify-center text-gray-600 hover:bg-gray-50"
                >
                  <Minus className="h-4 w-4" />
                </button>

                <span className="flex h-11 min-w-12 items-center justify-center border-x border-gray-200 px-4 text-sm font-bold text-gray-900">
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={increaseQuantity}
                  className="flex h-11 w-11 items-center justify-center text-gray-600 hover:bg-gray-50"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <Button
                type="button"
                disabled={!product.isInStock || isCartLoading || isRxLocked}
                onClick={handleAddToCart}
                className="h-11 flex-1 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300"
              >
                {isCartLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ShoppingCart className="mr-2 h-4 w-4" />
                )}
                {isRxLocked ? "Prescription Required" : "Add to Cart"}
              </Button>

              <Button
                type="button"
                variant="outline"
                disabled={isWishlistLoading}
                onClick={handleWishlistToggle}
                className={`h-11 ${
                  isWishlisted ? "border-red-200 text-red-600" : ""
                }`}
              >
                {isWishlistLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Heart
                    className={`mr-2 h-4 w-4 ${
                      isWishlisted ? "fill-red-500 text-red-500" : ""
                    }`}
                  />
                )}
                {isWishlisted ? "Wishlisted" : "Wishlist"}
              </Button>
            </div>

            {!product.isInStock && (
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4" />
                This product is currently out of stock.
              </div>
            )}

            {product.isLowStock && product.isInStock && (
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
                <AlertCircle className="h-4 w-4" />
                Low stock. Order soon.
              </div>
            )}

            {isRxLocked && (
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
                <AlertCircle className="h-4 w-4" />
                Upload and wait for prescription approval to unlock ordering.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-black text-gray-900">
            Product Information
          </h2>

          <div className="grid grid-cols-1 gap-4">
            <TextSection title="Description" value={product.description} />
            <TextSection
              title="Active Ingredient"
              value={product.activeIngredient}
            />
            <TextSection title="Indications" value={product.indications} />
            <TextSection title="Storage Info" value={product.storageInfo} />
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-black text-gray-900">
            Safety Information
          </h2>

          <div className="grid grid-cols-1 gap-4">
            <TextSection title="Side Effects" value={product.sideEffects} />
            <TextSection title="Warnings" value={product.warnings} />
            <TextSection
              title="Contraindications"
              value={product.contraindications}
            />
            <TextSection
              title="Pregnancy Warning"
              value={product.pregnancyWarning}
            />
            <TextSection
              title="Child Safety Info"
              value={product.childSafetyInfo}
            />
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-gray-900">
              Customer Reviews
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Reviews from customers who purchased this product.
            </p>
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            <RatingStars rating={product.averageRating || 0} />
            <span className="text-sm font-bold text-gray-900">
              {(product.averageRating || 0).toFixed(1)}
            </span>
          </div>
        </div>

        {reviews.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center">
            <Star className="mx-auto mb-3 h-10 w-10 text-gray-300" />
            <h3 className="font-bold text-gray-900">No reviews yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Customer reviews will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="rounded-xl border border-gray-200 bg-gray-50 p-5"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-gray-900">
                      {review.customerName ?? review.userName ?? "Customer"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(review.createdAt)}
                    </p>
                  </div>

                  <RatingStars rating={review.rating} />
                </div>

                <p className="text-sm leading-7 text-gray-600">
                  {review.comment || "No comment provided."}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}