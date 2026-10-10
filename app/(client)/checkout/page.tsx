"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { ApiResponse } from "@/types";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Loader2,
  Smartphone,
  ShoppingBag,
} from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/store/useStore";

type CartItem = {
  id: number;
  productId: number;
  productName: string;
  price: number;
  discountPrice?: number | null;
  quantity: number;
};

type CartResponse = {
  items: CartItem[];
  subtotal?: number;
  deliveryCharge?: number;
  discount?: number;
  total?: number;
};

type OrderResponse = {
  id: number;
  orderId?: number;
  orderNumber?: string | null;
};

type MfsPaymentMethod = "bKash" | "Nagad" | "Upay";

const initialAddress = {
  fullName: "",
  phone: "",
  addressLine: "",
  city: "",
  area: "",
};

const mfsMethods: MfsPaymentMethod[] = ["bKash", "Nagad", "Upay"];

function isMfsMethod(method: string): method is MfsPaymentMethod {
  return mfsMethods.includes(method as MfsPaymentMethod);
}

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [address, setAddress] = useState(initialAddress);

  const [paymentMethod, setPaymentMethod] = useState<
    "CashOnDelivery" | MfsPaymentMethod
  >("CashOnDelivery");

  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isPlacing, setIsPlacing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { fetchCounts } = useStore();

  const items = cart?.items ?? [];
  const isMfsPayment = isMfsMethod(paymentMethod);

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => {
      const price = item.discountPrice ?? item.price;
      return sum + price * item.quantity;
    }, 0);

    const deliveryCharge =
      cart?.deliveryCharge !== undefined
        ? cart.deliveryCharge
        : subtotal >= 500 || subtotal === 0
          ? 0
          : 50;

    const discount = cart?.discount ?? 0;
    const total = cart?.total ?? subtotal + deliveryCharge - discount;

    return { subtotal, deliveryCharge, discount, total };
  }, [items, cart]);

  const getCart = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const response = await api.get<ApiResponse<CartResponse | CartItem[]>>(
        "/cart"
      );

      if (response.data.success && response.data.data) {
        const data = response.data.data;
        setCart(Array.isArray(data) ? { items: data } : data);
      } else {
        setCart({ items: [] });
        setErrorMessage(response.data.message || "Failed to load cart.");
      }
    } catch (error) {
      console.error("Failed to load cart:", error);
      setCart({ items: [] });
      setErrorMessage("Failed to load cart. Please login and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getCart();
  }, []);

  const updateAddress = (key: keyof typeof initialAddress, value: string) => {
    setAddress((prev) => ({
      ...prev,
      [key]: value,
    }));
  };


  const validate = () => {
    if (!address.fullName.trim()) {
      toast.error("Full name is required");
      return false;
    }

    if (!address.phone.trim()) {
      toast.error("Phone number is required");
      return false;
    }

    if (!address.addressLine.trim()) {
      toast.error("Address line is required");
      return false;
    }

    if (!address.city.trim()) {
      toast.error("City is required");
      return false;
    }

    if (!address.area.trim()) {
      toast.error("Area is required");
      return false;
    }

    if (items.length === 0) {
      toast.error("Your cart is empty");
      return false;
    }


    return true;
  };

  const getOrderId = (data: OrderResponse | null) => {
    if (!data) return null;
    return data.id ?? data.orderId ?? null;
  };

  const initiatePayment = async (orderId: number, method: string) => {
    const response = await api.post<ApiResponse<{ paymentUrl: string }>>(
      `/payments/initiate/${orderId}?method=${method}`
    );

    if (response.data.success && response.data.data?.paymentUrl) {
      return response.data.data.paymentUrl;
    }
    
    throw new Error(response.data.message || "Failed to initiate payment");
  };

  const placeOrder = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) return;

    try {
      setIsPlacing(true);

      const orderResponse = await api.post<ApiResponse<OrderResponse>>(
        "/orders",
        {
          shippingAddress: address,
          paymentMethod,
          note: note.trim() || undefined,
        }
      );

      if (!orderResponse.data.success) {
        toast.error(orderResponse.data.message || "Failed to place order");
        return;
      }

      const orderId = getOrderId(orderResponse.data.data);

      if (isMfsPayment) {
        if (!orderId) {
          toast.error("Order created, but order ID was not returned.");
          return;
        }

        const paymentUrl = await initiatePayment(orderId, paymentMethod);
        
        toast.success("Redirecting to payment gateway...");
        window.location.href = paymentUrl;
        return;
      } else {
        toast.success("Order placed successfully");
      }

      fetchCounts();
      window.location.href = "/my-orders";
    } catch (error: any) {
      console.error("Failed to place order:", error);

      const message =
        error.response?.data?.message ??
        error.response?.data?.errors?.[0] ??
        error.message ??
        "Failed to place order";

      toast.error(message);
    } finally {
      setIsPlacing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading checkout...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/cart"
        className="mb-6 inline-flex items-center text-sm font-bold text-blue-600"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to Cart
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900">Checkout</h1>
        <p className="mt-2 text-sm text-gray-500">
          Confirm delivery address, choose payment method, and place your order.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {errorMessage}
        </div>
      )}

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <ShoppingBag className="mx-auto mb-4 h-14 w-14 text-gray-300" />
          <h2 className="text-2xl font-black text-gray-900">Cart is empty</h2>
          <Link href="/shop">
            <Button className="mt-6 bg-blue-600 text-white">Shop Now</Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={placeOrder} className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-xl font-black text-gray-900">
                Delivery Address
              </h2>

              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Full Name *"
                  value={address.fullName}
                  onChange={(v) => updateAddress("fullName", v)}
                />
                <Input
                  label="Phone *"
                  value={address.phone}
                  onChange={(v) => updateAddress("phone", v)}
                />
                <Input
                  label="City *"
                  value={address.city}
                  onChange={(v) => updateAddress("city", v)}
                />
                <Input
                  label="Area *"
                  value={address.area}
                  onChange={(v) => updateAddress("area", v)}
                />

                <div className="md:col-span-2">
                  <Input
                    label="Address Line *"
                    value={address.addressLine}
                    onChange={(v) => updateAddress("addressLine", v)}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-xl font-black text-gray-900">
                Payment Method
              </h2>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <PaymentOption
                  title="Cash on Delivery"
                  subtitle="Pay after delivery"
                  active={paymentMethod === "CashOnDelivery"}
                  onClick={() => setPaymentMethod("CashOnDelivery")}
                  icon={<ShoppingBag className="h-5 w-5" />}
                />

                <PaymentOption
                  title="bKash"
                  subtitle="Pay with bKash"
                  active={paymentMethod === "bKash"}
                  onClick={() => setPaymentMethod("bKash")}
                  icon={<Smartphone className="h-5 w-5" />}
                />

                <PaymentOption
                  title="Nagad"
                  subtitle="Pay with Nagad"
                  active={paymentMethod === "Nagad"}
                  onClick={() => setPaymentMethod("Nagad")}
                  icon={<Smartphone className="h-5 w-5" />}
                />

                <PaymentOption
                  title="Upay"
                  subtitle="Pay with Upay"
                  active={paymentMethod === "Upay"}
                  onClick={() => setPaymentMethod("Upay")}
                  icon={<CreditCard className="h-5 w-5" />}
                />
              </div>

              {isMfsPayment && (
                <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">
                  <div className="flex gap-3 text-blue-700">
                    <Smartphone className="mt-0.5 h-5 w-5" />
                    <div>
                      <h3 className="font-black text-blue-900">
                        Automated {paymentMethod} Payment
                      </h3>
                      <p className="mt-1 text-sm leading-6">
                        You will be redirected to the secure {paymentMethod} payment gateway to complete your transaction.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={4}
                placeholder="Order note..."
                className="mt-6 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <div className="sticky top-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black text-gray-900">Summary</h2>

              <div className="mt-6 space-y-4 border-b border-gray-100 pb-6">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between gap-4 text-sm"
                  >
                    <span className="text-gray-500">
                      {item.productName} × {item.quantity}
                    </span>
                    <span className="font-bold text-gray-900">
                      {formatCurrency(
                        (item.discountPrice ?? item.price) * item.quantity
                      )}
                    </span>
                  </div>
                ))}
              </div>

              <Summary label="Subtotal" value={formatCurrency(totals.subtotal)} />
              <Summary
                label="Delivery"
                value={
                  totals.deliveryCharge === 0
                    ? "Free"
                    : formatCurrency(totals.deliveryCharge)
                }
              />
              <Summary label="Discount" value={formatCurrency(totals.discount)} />

              <div className="mt-6 flex justify-between border-t border-gray-100 pt-6">
                <span className="text-lg font-black">Total</span>
                <span className="text-2xl font-black text-blue-600">
                  {formatCurrency(totals.total)}
                </span>
              </div>

              <div className="mt-5 rounded-xl bg-gray-50 p-4">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      Selected Payment
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {paymentMethod === "CashOnDelivery"
                        ? "Cash on Delivery"
                        : `${paymentMethod} automated payment`}
                    </p>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isPlacing}
                className="mt-6 h-12 w-full bg-blue-600 font-bold text-white hover:bg-blue-700 disabled:bg-gray-300"
              >
                {isPlacing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isMfsPayment ? "Place Order & Submit Payment" : "Place Order"}
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

function Input({
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
      <label className="mb-2 block text-sm font-semibold text-gray-700">
        {label}
      </label>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-4 flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-bold text-gray-900">{value}</span>
    </div>
  );
}

function PaymentOption({
  title,
  subtitle,
  active,
  onClick,
  icon,
}: {
  title: string;
  subtitle: string;
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border p-4 text-left transition ${
        active
          ? "border-blue-600 bg-blue-50 ring-2 ring-blue-100"
          : "border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-50/40"
      }`}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div
          className={`rounded-lg p-2 ${
            active ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"
          }`}
        >
          {icon}
        </div>

        {active && <CheckCircle2 className="h-5 w-5 text-blue-600" />}
      </div>

      <p className="font-black text-gray-900">{title}</p>
      <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
    </button>
  );
}