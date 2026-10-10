"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { formatCurrency, getProductStock, getImageUrl } from "@/lib/utils";
import { ApiResponse, PagedResponse } from "@/types";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  ArrowLeft,
  Heart,
  Loader2,
  Package,
  Pill,
  RefreshCcw,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/store/useStore";

type WishlistProduct = {
  id: number;
  name: string;
  slug: string;
  price: number;
  discountPrice?: number | null;
  stock: number;
  stockQuantity?: number;
  requiresPrescription: boolean;
  genericName?: string | null;
  brand?: string | null;
  brandName?: string | null;
  categoryName?: string | null;
  imageUrls?: string[];
};

type WishlistItem = {
  id?: number;
  productId?: number;
  product?: WishlistProduct;
  productName?: string;
  productSlug?: string;
  primaryImageUrl?: string | null;
  imageUrls?: string[];
  price?: number;
  discountPrice?: number | null;
  stock?: number;
  stockQuantity?: number;
  requiresPrescription?: boolean;
  brandName?: string | null;
  genericName?: string | null;
};

function extractItems<T>(data: T[] | PagedResponse<T>): T[] {
  return Array.isArray(data) ? data : data.items ?? [];
}

function normalizeWishlistItems(
  data: WishlistItem[] | PagedResponse<WishlistItem>
): WishlistProduct[] {
  return extractItems(data).map((item) => {
    if (item.product) {
      return {
        ...item.product,
        stock: getProductStock(item.product),
        brandName:
          item.product.brandName ??
          item.product.brand ??
          null,
      };
    }

    return {
      id: item.productId ?? item.id ?? 0,
      name: item.productName ?? "Unknown Product",
      slug: item.productSlug ?? "",
      price: item.price ?? 0,
      discountPrice: item.discountPrice ?? null,
      stock: getProductStock({
        stock: item.stock,
        stockQuantity: item.stockQuantity,
      }),
      requiresPrescription: item.requiresPrescription ?? false,
      brandName: item.brandName ?? null,
      genericName: item.genericName ?? null,
      imageUrls: item.imageUrls ?? (item.primaryImageUrl ? [item.primaryImageUrl] : []),
    };
  });
}

export default function WishlistPage() {
  const [products, setProducts] = useState<WishlistProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { fetchCounts, setWishlistCount, setCount } = useStore();

  const getWishlist = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const response = await api.get<
        ApiResponse<WishlistItem[] | PagedResponse<WishlistItem>>
      >("/wishlist");

      if (response.data.success && response.data.data) {
        const items = normalizeWishlistItems(response.data.data);
        setProducts(items);
        setWishlistCount(items.length);
      } else {
        setProducts([]);
        setWishlistCount(0);
        setErrorMessage(response.data.message || "Failed to load wishlist.");
      }
    } catch (error) {
      console.error("Failed to load wishlist:", error);
      setProducts([]);
      setErrorMessage("Failed to load wishlist. Please login and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getWishlist();
  }, []);

  const removeFromWishlist = async (product: WishlistProduct) => {
    const confirmed = window.confirm(
      `Remove "${product.name}" from your wishlist?`
    );

    if (!confirmed) return;

    try {
      setRemovingId(product.id);

      const response = await api.delete<ApiResponse<unknown>>(
        `/wishlist/${product.id}`
      );

      if (response.data.success) {
        setProducts((prev) => {
          const newItems = prev.filter((item) => item.id !== product.id);
          setWishlistCount(newItems.length);
          return newItems;
        });
        toast.success("Removed from wishlist");
      } else {
        toast.error(response.data.message || "Failed to remove item");
      }
    } catch (error) {
      console.error("Failed to remove wishlist item:", error);
      toast.error("Failed to remove item");
    } finally {
      setRemovingId(null);
    }
  };

  const addToCart = async (product: WishlistProduct) => {
    if (product.stock <= 0) {
      toast.error("This product is out of stock");
      return;
    }

    try {
      setAddingId(product.id);

      const response = await api.post<ApiResponse<unknown>>("/cart/add", {
        productId: product.id,
        quantity: 1,
      });

      if (response.data.success) {
        toast.success("Product added to cart");
        fetchCounts(); // Update both counts as one moved to the other potentially or just to be sure
      } else {
        toast.error(response.data.message || "Failed to add product to cart");
      }
    } catch (error) {
      console.error("Failed to add wishlist product to cart:", error);
      toast.error("Failed to add product to cart");
    } finally {
      setAddingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-[500px] max-w-7xl items-center justify-center px-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading wishlist...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link
            href="/shop"
            className="mb-3 inline-flex items-center text-sm font-bold text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Continue Shopping
          </Link>

          <h1 className="text-3xl font-black text-gray-900">Wishlist</h1>
          <p className="mt-2 text-sm text-gray-500">
            Save your favorite medicines and healthcare products for later.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={getWishlist}
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

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <Heart className="mx-auto mb-4 h-14 w-14 text-gray-300" />

          <h2 className="text-2xl font-black text-gray-900">
            Your wishlist is empty
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
            Add products to your wishlist so you can find them quickly later.
          </p>

          <Link href="/shop">
            <Button className="mt-6 bg-blue-600 text-white hover:bg-blue-700">
              Browse Products
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => {
            const sellingPrice = product.discountPrice ?? product.price;
            const hasDiscount =
              product.discountPrice !== null &&
              product.discountPrice !== undefined &&
              product.discountPrice < product.price;

            return (
              <div
                key={product.id}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="grid grid-cols-[96px_1fr] gap-4">
                  <Link
                    href={product.slug ? `/products/${product.slug}` : "/shop"}
                    className="flex h-24 w-24 items-center justify-center rounded-xl bg-gray-50"
                  >
                    {product.imageUrls && product.imageUrls.length > 0 ? (
                      <img
                        src={getImageUrl(product.imageUrls[0])}
                        alt={product.name}
                        className="h-full w-full rounded-xl object-contain p-2"
                      />
                    ) : (
                      <Package className="h-10 w-10 text-blue-300" />
                    )}
                  </Link>

                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      {product.brandName && (
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-600">
                          {product.brandName}
                        </span>
                      )}

                      {product.requiresPrescription && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700">
                          <Pill className="h-3 w-3" />
                          Rx
                        </span>
                      )}
                    </div>

                    <Link
                      href={
                        product.slug ? `/products/${product.slug}` : "/shop"
                      }
                      className="line-clamp-2 text-base font-black text-gray-900 hover:text-blue-600"
                    >
                      {product.name}
                    </Link>

                    <p className="mt-1 line-clamp-1 text-sm text-gray-500">
                      {product.genericName || "Healthcare product"}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="text-lg font-black text-blue-600">
                        {formatCurrency(sellingPrice)}
                      </span>

                      {hasDiscount && (
                        <span className="text-sm font-semibold text-gray-400 line-through">
                          {formatCurrency(product.price)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <Button
                    type="button"
                    disabled={addingId === product.id || product.stock <= 0}
                    onClick={() => addToCart(product)}
                    className="flex-1 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300"
                  >
                    {addingId === product.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <ShoppingCart className="mr-2 h-4 w-4" />
                    )}
                    {product.stock <= 0 ? "Out of Stock" : "Add to Cart"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    disabled={removingId === product.id}
                    onClick={() => removeFromWishlist(product)}
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    {removingId === product.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="mr-2 h-4 w-4" />
                    )}
                    Remove
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
