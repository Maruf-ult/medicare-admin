"use client";

import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { formatCurrency, formatDate, getImageUrl } from "@/lib/utils";
import { ApiResponse } from "@/types";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  CreditCard,
  Loader2,
  MapPin,
  Package,
  RefreshCcw,
  ShoppingBag,
  Smartphone,
  Truck,
  X,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type OrderItem = {
  id: number;
  productId: number;
  productName: string;
  productSlug?: string | null;
  productImageUrl?: string | null;
  ProductImageUrl?: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  requiresPrescription?: boolean;
};

type ShippingAddress = {
  fullName?: string | null;
  phone?: string | null;
  addressLine?: string | null;
  city?: string | null;
  area?: string | null;
};

type Order = {
  id: number;
  orderNumber?: string | null;
  orderStatus: string;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  total: number;
  note?: string | null;
  cancellationReason?: string | null;
  address?: ShippingAddress | null;
  shippingAddress?: ShippingAddress | null;
  items?: OrderItem[];
  orderItems?: OrderItem[];
  createdAt: string;
  updatedAt?: string | null;

  // MFS fields, if backend returns these with order details
  transactionId?: string | null;
  senderPhoneNumber?: string | null;
  mfsTransactionId?: string | null;
  mfsSenderPhoneNumber?: string | null;
};

function getOrderItems(order: Order): OrderItem[] {
  return order.items ?? order.orderItems ?? [];
}

function getOrderItemImageUrl(item: OrderItem): string | null {
  return item.productImageUrl ?? item.ProductImageUrl ?? null;
}

function isMfsPayment(method: string) {
  const normalized = method.toLowerCase();
  return (
    normalized === "bkash" || normalized === "nagad" || normalized === "upay"
  );
}

function getApiErrorMessage(
  error: unknown,
  defaultMessage = "Unexpected error.",
) {
  if (typeof error !== "object" || error === null) return defaultMessage;

  const apiError = error as {
    response?: {
      data?: { message?: string; errors?: string[] };
    };
  };

  return (
    apiError.response?.data?.message ||
    apiError.response?.data?.errors?.[0] ||
    (error instanceof Error ? error.message : defaultMessage)
  );
}

function getPaymentStatusStyle(status: string) {
  const normalized = status.toLowerCase();

  if (normalized === "paid") {
    return {
      className: "border-green-200 bg-green-50 text-green-700",
      icon: CheckCircle2,
      label: "Paid",
    };
  }

  if (normalized === "submitted") {
    return {
      className: "border-blue-200 bg-blue-50 text-blue-700",
      icon: Clock,
      label: "Submitted",
    };
  }

  if (normalized === "failed" || normalized === "refunded") {
    return {
      className: "border-red-200 bg-red-50 text-red-700",
      icon: AlertCircle,
      label: status,
    };
  }

  return {
    className: "border-yellow-200 bg-yellow-50 text-yellow-700",
    icon: Clock,
    label: status || "Pending",
  };
}

function InfoLine({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="flex justify-between gap-4 border-b border-gray-100 py-3 last:border-b-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-right text-sm font-bold text-gray-900">
        {value || "N/A"}
      </span>
    </div>
  );
}

function CardBox({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-2">
        <div className="rounded-lg bg-blue-50 p-2">
          <Icon className="h-5 w-5 text-blue-600" />
        </div>
        <h2 className="text-lg font-black text-gray-900">{title}</h2>
      </div>

      {children}
    </div>
  );
}

export default function MyOrderDetailsPage() {
  const params = useParams();
  const orderId = Number(params.id);

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getOrder = async () => {
    if (!orderId || Number.isNaN(orderId)) {
      setErrorMessage("Invalid order ID.");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);

      const response = await api.get<ApiResponse<Order>>(
        `/orders/my-orders/${orderId}`,
      );

      if (response.data.success && response.data.data) {
        setOrder(response.data.data);
      } else {
        setOrder(null);
        setErrorMessage(response.data.message || "Order not found.");
      }
    } catch (error: unknown) {
      console.error("Failed to load order:", error);
      setOrder(null);
      setErrorMessage(
        getApiErrorMessage(error, "Failed to load order details."),
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line
    getOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const cancelOrder = async () => {
    if (!order) return;

    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?",
    );
    if (!confirmed) return;

    try {
      setIsCancelling(true);

      const response = await api.put<ApiResponse<unknown>>(
        `/orders/my-orders/${order.id}/cancel`,
        {
          reason: "Cancelled by customer",
        },
      );

      if (response.data.success) {
        toast.success("Order cancelled successfully");
        getOrder();
      } else {
        toast.error(response.data.message || "Failed to cancel order");
      }
    } catch (error: unknown) {
      console.error("Failed to cancel order:", error);
      toast.error(getApiErrorMessage(error, "Failed to cancel order"));
    } finally {
      setIsCancelling(false);
    }
  };

  const initiateOrderPayment = async () => {
    if (!order) return;

    try {
      setIsPaying(true);
      const response = await api.post<ApiResponse<{ paymentUrl: string }>>(
        `/payments/initiate/${order.id}?method=${encodeURIComponent(
          order.paymentMethod,
        )}`,
      );

      if (response.data.success && response.data.data?.paymentUrl) {
        window.open(response.data.data.paymentUrl, "_blank");
        toast.success("Opening payment gateway in a new tab...");
      } else {
        throw new Error(response.data.message || "Failed to initiate payment");
      }
    } catch (error: unknown) {
      console.error("Payment initiation failed:", error);
      toast.error(getApiErrorMessage(error, "Failed to initiate payment"));
    } finally {
      setIsPaying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-125 items-center justify-center">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading order details...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/my-orders"
          className="mb-6 inline-flex items-center text-sm font-bold text-blue-600"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to My Orders
        </Link>

        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            {errorMessage || "Order could not be loaded."}
          </div>
        </div>
      </div>
    );
  }

  const items = getOrderItems(order);
  const shippingAddress = order.shippingAddress ?? order.address ?? null;
  const canCancel = ["Pending", "Confirmed"].includes(order.orderStatus);
  const mfsPayment = isMfsPayment(order.paymentMethod);
  const transactionId = order.transactionId ?? order.mfsTransactionId ?? null;
  const senderPhoneNumber =
    order.senderPhoneNumber ?? order.mfsSenderPhoneNumber ?? null;
  const paymentStatus = getPaymentStatusStyle(order.paymentStatus);
  const PaymentStatusIcon = paymentStatus.icon;
  const showTransactionDetails = Boolean(transactionId || senderPhoneNumber);
  const showPayNow =
    order.paymentStatus.toLowerCase() !== "paid" &&
    order.paymentStatus.toLowerCase() !== "submitted" &&
    order.paymentMethod.toLowerCase() !== "cashondelivery";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link
            href="/my-orders"
            className="mb-3 inline-flex items-center text-sm font-bold text-blue-600"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to My Orders
          </Link>

          <h1 className="text-3xl font-black text-gray-900">
            {order.orderNumber ?? `Order #${order.id}`}
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Ordered on {formatDate(order.createdAt)}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={getOrder}
            className="gap-2"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>

          {canCancel && (
            <Button
              type="button"
              variant="outline"
              disabled={isCancelling}
              onClick={cancelOrder}
              className="gap-2 border-red-200 text-red-600 hover:bg-red-50"
            >
              {isCancelling ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <X className="h-4 w-4" />
              )}
              Cancel Order
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

      {mfsPayment && order.paymentStatus !== "Paid" && (
        <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <div className="flex gap-3">
            <Smartphone className="mt-0.5 h-5 w-5 text-blue-700" />
            <div>
              <h3 className="font-black text-blue-900">
                {order.paymentMethod} payment submitted
              </h3>
              <p className="mt-1 text-sm leading-6 text-blue-700">
                Your payment is waiting for admin verification. Once verified,
                payment status will become Paid and the order will be confirmed.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Order Status</p>
          <p className="mt-2 text-xl font-black text-blue-600">
            {order.orderStatus}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Payment</p>
          <span
            className={`mt-2 inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-bold ${paymentStatus.className}`}
          >
            <PaymentStatusIcon className="h-4 w-4" />
            {paymentStatus.label}
          </span>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Items</p>
          <p className="mt-2 text-xl font-black text-gray-900">
            {items.length}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total</p>
          <p className="mt-2 text-xl font-black text-blue-600">
            {formatCurrency(order.total)}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <CardBox title="Order Items" icon={ShoppingBag}>
          {items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center">
              <p className="font-bold text-gray-900">No items found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-1 gap-4 rounded-xl border border-gray-200 p-4 sm:grid-cols-[80px_1fr_auto]"
                >
                  <Link
                    href={
                      item.productSlug
                        ? `/products/${item.productSlug}`
                        : "/shop"
                    }
                    className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg bg-gray-50"
                  >
                    {getOrderItemImageUrl(item) ? (
                      <img
                        src={getImageUrl(getOrderItemImageUrl(item))}
                        alt={item.productName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Package className="h-8 w-8 text-blue-300" />
                    )}
                  </Link>
                  <div>
                    <Link
                      href={
                        item.productSlug
                          ? `/products/${item.productSlug}`
                          : "/shop"
                      }
                      className="font-black text-gray-900 hover:text-blue-600"
                    >
                      {item.productName}
                    </Link>

                    <p className="mt-1 text-sm text-gray-500">
                      Quantity: {item.quantity} ×{" "}
                      {formatCurrency(item.unitPrice)}
                    </p>

                    {item.requiresPrescription && (
                      <span className="mt-2 inline-flex rounded-full bg-yellow-50 px-3 py-1 text-xs font-bold text-yellow-700">
                        Rx Product
                      </span>
                    )}
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="font-black text-blue-600">
                      {formatCurrency(item.totalPrice)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBox>

        {order.note && (
          <CardBox title="Order Note" icon={Package}>
            <p className="whitespace-pre-line text-sm leading-7 text-gray-600">
              {order.note}
            </p>
          </CardBox>
        )}

        {order.cancellationReason && (
          <CardBox title="Cancellation Reason" icon={AlertCircle}>
            <p className="whitespace-pre-line text-sm leading-7 text-red-600">
              {order.cancellationReason}
            </p>
          </CardBox>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <CardBox
            title={mfsPayment ? "MFS Payment Summary" : "Payment Summary"}
            icon={mfsPayment ? Smartphone : CreditCard}
          >
            <InfoLine label="Payment Method" value={order.paymentMethod} />
            <InfoLine label="Payment Status" value={order.paymentStatus} />

            {showTransactionDetails && (
              <>
                <InfoLine label="Transaction ID" value={transactionId} />
                <InfoLine label="Sender Phone" value={senderPhoneNumber} />
              </>
            )}

            <InfoLine label="Subtotal" value={formatCurrency(order.subtotal)} />
            <InfoLine label="Discount" value={formatCurrency(order.discount)} />
            <InfoLine
              label="Delivery"
              value={formatCurrency(order.deliveryCharge)}
            />
            <InfoLine label="Total" value={formatCurrency(order.total)} />

            {showPayNow && (
              <div className="mt-6">
                <button
                  type="button"
                  disabled={isPaying}
                  onClick={initiateOrderPayment}
                  className="inline-flex w-full items-center justify-center rounded-3xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPaying ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Pay Now
                </button>
              </div>
            )}
          </CardBox>

          <CardBox title="Delivery Address" icon={MapPin}>
            {shippingAddress ? (
              <>
                <InfoLine label="Name" value={shippingAddress.fullName} />
                <InfoLine label="Phone" value={shippingAddress.phone} />
                <InfoLine label="Address" value={shippingAddress.addressLine} />
                <InfoLine label="City" value={shippingAddress.city} />
                <InfoLine label="Area" value={shippingAddress.area} />
              </>
            ) : (
              <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-700">
                Delivery address not found.
              </div>
            )}
          </CardBox>

          {mfsPayment && (
            <CardBox title="Payment Verification" icon={Clock}>
              {order.paymentStatus === "Paid" ? (
                <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                  <div className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-700" />
                    <div>
                      <h3 className="font-bold text-green-900">
                        Payment verified
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-green-700">
                        Your MFS payment has been verified by admin.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
                  <div className="flex gap-2">
                    <Clock className="mt-0.5 h-5 w-5 text-yellow-700" />
                    <div>
                      <h3 className="font-bold text-yellow-900">
                        Waiting for verification
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-yellow-700">
                        Admin will verify your transaction ID soon. Please keep
                        your payment receipt safe.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardBox>
          )}

          <CardBox title="Delivery Status" icon={Truck}>
            <InfoLine label="Order Status" value={order.orderStatus} />
            <InfoLine label="Created At" value={formatDate(order.createdAt)} />
            <InfoLine
              label="Updated At"
              value={order.updatedAt ? formatDate(order.updatedAt) : "N/A"}
            />
          </CardBox>
        </div>
      </div>
    </div>
  );
}
