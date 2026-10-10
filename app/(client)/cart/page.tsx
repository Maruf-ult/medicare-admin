"use client";

import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { formatCurrency, getImageUrl } from "@/lib/utils";
import { useStore } from "@/store/useStore";
import { ApiResponse } from "@/types";
import {
  AlertCircle,
  ArrowLeft,
  Loader2,
  Minus,
  Package,
  Pill,
  Plus,
  RefreshCcw,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type CartItem = {
  id: number;
  productId: number;
  productName: string;
  productSlug?: string | null;
  primaryImageUrl?: string | null;
  brandName?: string | null;
  genericName?: string | null;
  price: number;
  discountPrice?: number | null;
  quantity: number;
  stock: number;
  requiresPrescription: boolean;
  prescriptionApproved?: boolean;
  totalPrice?: number;
};

type CartResponse = {
  id?: number;
  userId?: number;
  items: CartItem[];
  subtotal?: number;
  deliveryCharge?: number;
  discount?: number;
  total?: number;
};

function getCartItems(data: CartResponse | CartItem[] | null | undefined) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return data.items ?? [];
}

export default function CartPage() {
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingItemId, setUpdatingItemId] = useState<number | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<number | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { fetchCounts, setCount } = useStore();

  const getCart = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const response =
        await api.get<ApiResponse<CartResponse | CartItem[]>>("/cart");

      if (response.data.success && response.data.data) {
        const cartData = response.data.data;
        const items = getCartItems(cartData);
        setCart(Array.isArray(cartData) ? { items: cartData } : cartData);
        setItems(items);
        setCount(items.length);
      } else {
        setCart(null);
        setItems([]);
        setCount(0);
        setErrorMessage(response.data.message || "Failed to load cart.");
      }
    } catch (error) {
      console.error("Failed to load cart:", error);
      setCart(null);
      setItems([]);
      setErrorMessage("Failed to load cart. Please login and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getCart();
  }, []);

  const calculations = useMemo(() => {
    const subtotal = items.reduce((sum, item) => {
      const sellingPrice = (item.discountPrice ?? item.price) || 0;
      return sum + sellingPrice * item.quantity;
    }, 0);

    const deliveryCharge =
      cart?.deliveryCharge !== undefined
        ? cart.deliveryCharge
        : subtotal >= 500 || subtotal === 0
          ? 0
          : 50;

    const discount = cart?.discount ?? 0;
    const total =
      cart?.total !== undefined
        ? cart.total
        : subtotal + deliveryCharge - discount;

    return {
      subtotal,
      deliveryCharge,
      discount,
      total,
    };
  }, [items, cart]);

  const needsPrescriptionApproval = items.some(
    (item) => item.requiresPrescription && !item.prescriptionApproved,
  );

  const updateQuantity = async (item: CartItem, newQuantity: number) => {
    if (newQuantity < 1) return;

    if (item.stock > 0 && newQuantity > item.stock) {
      toast.error(`Only ${item.stock} units available in stock`);
      return;
    }

    try {
      setUpdatingItemId(item.id);

      const response = await api.put<ApiResponse<unknown>>(
        `/cart/items/${item.id}`,
        {
          quantity: newQuantity,
        },
      );

      if (response.data.success) {
        setItems((prev) =>
          prev.map((cartItem) =>
            cartItem.id === item.id
              ? {
                  ...cartItem,
                  quantity: newQuantity,
                }
              : cartItem,
          ),
        );

        toast.success("Cart updated");
      } else {
        toast.error(response.data.message || "Failed to update cart item");
      }
    } catch (error) {
      console.error("Failed to update cart item:", error);
      toast.error("Failed to update cart item");
    } finally {
      setUpdatingItemId(null);
    }
  };

  const removeItem = async (item: CartItem) => {
    const confirmed = window.confirm(
      `Remove "${item.productName}" from your cart?`,
    );

    if (!confirmed) return;

    try {
      setDeletingItemId(item.id);

      const response = await api.delete<ApiResponse<unknown>>(
        `/cart/items/${item.id}`,
      );

      if (response.data.success) {
        setItems((prev) => {
          const newItems = prev.filter((cartItem) => cartItem.id !== item.id);
          setCount(newItems.length);
          return newItems;
        });
        toast.success("Item removed from cart");
      } else {
        toast.error(response.data.message || "Failed to remove item");
      }
    } catch (error) {
      console.error("Failed to remove cart item:", error);
      toast.error("Failed to remove item");
    } finally {
      setDeletingItemId(null);
    }
  };

  const clearCart = async () => {
    if (items.length === 0) return;

    const confirmed = window.confirm(
      "Are you sure you want to clear your cart?",
    );

    if (!confirmed) return;

    try {
      setIsClearing(true);

      const response = await api.delete<ApiResponse<unknown>>("/cart/clear");

      if (response.data.success) {
        setItems([]);
        setCart({ items: [] });
        setCount(0);
        toast.success("Cart cleared");
      } else {
        toast.error(response.data.message || "Failed to clear cart");
      }
    } catch (error) {
      console.error("Failed to clear cart:", error);
      toast.error("Failed to clear cart");
    } finally {
      setIsClearing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-[500px] max-w-7xl items-center justify-center px-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading cart...
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

          <h1 className="text-3xl font-black text-gray-900">Shopping Cart</h1>
          <p className="mt-2 text-sm text-gray-500">
            {items.length} item{items.length !== 1 ? "s" : ""} in your cart.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={getCart}
            className="gap-2"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>

          {items.length > 0 && (
            <Button
              type="button"
              variant="outline"
              disabled={isClearing}
              onClick={clearCart}
              className="gap-2 border-red-200 text-red-600 hover:bg-red-50"
            >
              {isClearing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Clear Cart
            </Button>
          )}
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {errorMessage}
        </div>
      )}

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <ShoppingCart className="mx-auto mb-4 h-14 w-14 text-gray-300" />

          <h2 className="text-2xl font-black text-gray-900">
            Your cart is empty
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
            Add medicines, health products, or prescription-approved items to
            your cart.
          </p>

          <Link href="/shop">
            <Button className="mt-6 bg-blue-600 text-white hover:bg-blue-700">
              Start Shopping
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {needsPrescriptionApproval && (
              <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
                <div className="flex gap-3">
                  <Pill className="mt-0.5 h-5 w-5 text-yellow-700" />

                  <div>
                    <h3 className="font-bold text-yellow-900">
                      Prescription approval needed
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-yellow-700">
                      Some products in your cart require prescription approval
                      before checkout.
                    </p>

                    <Link
                      href="/upload-prescription"
                      className="mt-2 inline-block text-sm font-bold text-blue-600 hover:underline"
                    >
                      Upload prescription →
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {items.map((item) => {
              const sellingPrice = (item.discountPrice ?? item.price) || 0;
              const hasDiscount =
                item.discountPrice !== null &&
                item.discountPrice !== undefined &&
                item.discountPrice < (item.price || 0);

              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                >
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-[100px_1fr_auto]">
                    <Link
                      href={
                        item.productSlug
                          ? `/products/${item.productSlug}`
                          : `/shop`
                      }
                      className="flex h-24 w-24 items-center justify-center rounded-xl bg-gray-50"
                    >
                      {item.primaryImageUrl ? (
                        <img
                          src={getImageUrl(item.primaryImageUrl)}
                          alt={item.productName}
                          className="h-full w-full rounded-xl object-contain p-2"
                        />
                      ) : (
                        <Package className="h-10 w-10 text-blue-300" />
                      )}
                    </Link>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        {item.brandName && (
                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-600">
                            {item.brandName}
                          </span>
                        )}

                        {item.requiresPrescription && (
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                              item.prescriptionApproved
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            <Pill className="h-3 w-3" />
                            {item.prescriptionApproved
                              ? "Rx Approved"
                              : "Rx Required"}
                          </span>
                        )}
                      </div>

                      <Link
                        href={
                          item.productSlug
                            ? `/products/${item.productSlug}`
                            : `/shop`
                        }
                        className="mt-2 block text-lg font-black text-gray-900 hover:text-blue-600"
                      >
                        {item.productName}
                      </Link>

                      <p className="mt-1 text-sm text-gray-500">
                        {item.genericName || "Healthcare product"}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <span className="text-lg font-black text-gray-900">
                          {formatCurrency(sellingPrice)}
                        </span>

                        {hasDiscount && (
                          <span className="text-sm font-semibold text-gray-400 line-through">
                            {formatCurrency(item.price)}
                          </span>
                        )}

                        <span className="text-sm text-gray-400">
                          Stock: {item.stock}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-row items-center justify-between gap-4 sm:flex-col sm:items-end">
                      <div className="text-left sm:text-right">
                        <p className="text-xs font-semibold text-gray-400">
                          Item Total
                        </p>
                        <p className="text-xl font-black text-blue-600">
                          {formatCurrency(sellingPrice * item.quantity)}
                        </p>
                      </div>

                      <div className="flex items-center overflow-hidden rounded-lg border border-gray-200 bg-white">
                        <button
                          type="button"
                          disabled={updatingItemId === item.id}
                          onClick={() =>
                            updateQuantity(item, item.quantity - 1)
                          }
                          className="flex h-10 w-10 items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                        >
                          <Minus className="h-4 w-4" />
                        </button>

                        <span className="flex h-10 min-w-12 items-center justify-center border-x border-gray-200 px-4 text-sm font-bold text-gray-900">
                          {updatingItemId === item.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            item.quantity
                          )}
                        </span>

                        <button
                          type="button"
                          disabled={updatingItemId === item.id}
                          onClick={() =>
                            updateQuantity(item, item.quantity + 1)
                          }
                          className="flex h-10 w-10 items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <button
                        type="button"
                        disabled={deletingItemId === item.id}
                        onClick={() => removeItem(item)}
                        className="inline-flex items-center gap-2 text-sm font-bold text-red-600 hover:text-red-700 disabled:opacity-60"
                      >
                        {deletingItemId === item.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black text-gray-900">
                Order Summary
              </h2>

              <div className="mt-6 space-y-4 border-b border-gray-100 pb-6">
                <SummaryRow
                  label="Subtotal"
                  value={formatCurrency(calculations.subtotal)}
                />

                <SummaryRow
                  label="Delivery Charge"
                  value={
                    calculations.deliveryCharge === 0
                      ? "Free"
                      : formatCurrency(calculations.deliveryCharge)
                  }
                  valueClassName={
                    calculations.deliveryCharge === 0 ? "text-green-600" : ""
                  }
                />

                {calculations.discount > 0 && (
                  <SummaryRow
                    label="Discount"
                    value={`-${formatCurrency(calculations.discount)}`}
                    valueClassName="text-green-600"
                  />
                )}
              </div>

              <div className="mt-6 flex items-center justify-between">
                <span className="text-lg font-black text-gray-900">Total</span>
                <span className="text-2xl font-black text-blue-600">
                  {formatCurrency(calculations.total)}
                </span>
              </div>

              {calculations.subtotal < 500 && (
                <div className="mt-4 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700">
                  Add{" "}
                  <span className="font-bold">
                    {formatCurrency(500 - calculations.subtotal)}
                  </span>{" "}
                  more for free delivery.
                </div>
              )}

              {needsPrescriptionApproval ? (
                <Link href="/upload-prescription">
                  <Button className="mt-6 h-12 w-full bg-yellow-500 font-bold text-white hover:bg-yellow-600">
                    Upload Prescription First
                  </Button>
                </Link>
              ) : (
                <Link href="/checkout">
                  <Button className="mt-6 h-12 w-full bg-blue-600 font-bold text-white hover:bg-blue-700">
                    Proceed to Checkout
                  </Button>
                </Link>
              )}

              <Link
                href="/shop"
                className="mt-4 inline-flex w-full items-center justify-center text-sm font-bold text-blue-600 hover:underline"
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Continue Shopping
              </Link>

              <p className="mt-5 text-center text-xs leading-5 text-gray-400">
                Secure checkout. Delivery charge may change based on address.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryRow({
  label,
  value,
  valueClassName = "",
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-sm font-bold text-gray-900 ${valueClassName}`}>
        {value}
      </span>
    </div>
  );
}
