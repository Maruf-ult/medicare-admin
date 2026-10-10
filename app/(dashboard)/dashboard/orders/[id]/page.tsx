"use client";

import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { formatCurrency, formatDateTime, getImageUrl } from "@/lib/utils";
import { ApiResponse } from "@/types";
import {
  AlertCircle,
  ArrowLeft,
  CreditCard,
  Loader2,
  MapPin,
  Package,
  RefreshCcw,
  Save,
  ShieldCheck,
  ShoppingBag,
  Truck,
  User,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Processing"
  | "Packed"
  | "Shipped"
  | "Delivered"
  | "Cancelled"
  | "Returned";

type OrderItem = {
  id: number;
  productId: number;
  productName: string;
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

type BackendOrder = {
  id: number;
  orderNumber?: string | null;
  orderStatus: OrderStatus;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  total: number;
  note?: string | null;
  cancellationReason?: string | null;
  createdAt: string;
  updatedAt?: string | null;

  customerName?: string | null;
  userName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;

  address?: ShippingAddress | null;
  shippingAddress?: ShippingAddress | null;

  items?: OrderItem[];
  orderItems?: OrderItem[];

  transactionId?: string | null;
  senderPhoneNumber?: string | null;
};

const statusOptions: OrderStatus[] = [
  "Pending",
  "Confirmed",
  "Processing",
  "Packed",
  "Shipped",
  "Delivered",
  "Cancelled",
  "Returned",
];

const statusColors: Record<OrderStatus, string> = {
  Pending: "bg-gray-100 text-gray-700",
  Confirmed: "bg-indigo-100 text-indigo-700",
  Processing: "bg-orange-100 text-orange-700",
  Packed: "bg-purple-100 text-purple-700",
  Shipped: "bg-blue-100 text-blue-700",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
  Returned: "bg-yellow-100 text-yellow-700",
};

function getCustomerName(order: BackendOrder) {
  return order.customerName ?? order.userName ?? "Unknown Customer";
}

function getOrderItems(order: BackendOrder): OrderItem[] {
  return order.items ?? order.orderItems ?? [];
}

function getOrderItemImageUrl(item: OrderItem): string | null {
  return item.productImageUrl ?? item.ProductImageUrl ?? null;
}

function DetailCard({
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
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      </div>

      {children}
    </div>
  );
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
      <span className="text-right text-sm font-semibold text-gray-900">
        {value || "N/A"}
      </span>
    </div>
  );
}

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = Number(params.id);

  const [order, setOrder] = useState<BackendOrder | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>("Pending");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const verifyOrderPayment = async () => {
    if (!order?.transactionId) {
      toast.error("No Transaction ID associated with this order");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to verify transaction "${order.transactionId}" for this order?`,
    );
    if (!confirmed) return;

    try {
      setIsVerifying(true);
      const response = await api.put<ApiResponse<unknown>>(
        `/payments/mfs/verify/${encodeURIComponent(order.transactionId)}`,
      );

      if (response.data.success) {
        toast.success("Payment verified successfully!");
        getOrder();
      } else {
        toast.error(response.data.message || "Failed to verify payment");
      }
    } catch (error: any) {
      console.error("Failed to verify payment:", error);
      const message =
        error.response?.data?.message ??
        error.response?.data?.errors?.[0] ??
        "Failed to verify payment.";
      toast.error(message);
    } finally {
      setIsVerifying(false);
    }
  };

  const getOrder = async () => {
    if (!orderId || Number.isNaN(orderId)) {
      setErrorMessage("Invalid order ID.");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);

      const response = await api.get<ApiResponse<BackendOrder>>(
        `/orders/${orderId}`,
      );

      if (response.data.success && response.data.data) {
        setOrder(response.data.data);
        setSelectedStatus(response.data.data.orderStatus);
      } else {
        setOrder(null);
        setErrorMessage(response.data.message || "Order not found.");
      }
    } catch (error) {
      console.error("Failed to load order:", error);
      setOrder(null);
      setErrorMessage("Failed to load order details.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const handleStatusUpdate = async () => {
    if (!order) return;

    try {
      setIsUpdatingStatus(true);

      const response = await api.put<ApiResponse<null>>(
        `/orders/${order.id}/status`,
        {
          orderStatus: selectedStatus,
        },
      );

      if (response.data.success) {
        setOrder((prev) =>
          prev ? { ...prev, orderStatus: selectedStatus } : prev,
        );

        toast.success(`Order status updated to ${selectedStatus}`);
      } else {
        toast.error(response.data.message || "Failed to update order status.");
      }
    } catch (error) {
      console.error("Failed to update order status:", error);
      toast.error("Failed to update order status.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-125 items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading order details...
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div>
        <Link
          href="/dashboard/orders"
          className="mb-6 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Orders
        </Link>

        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <p className="font-medium">
              {errorMessage || "Order could not be loaded."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const items = getOrderItems(order);
  const shippingAddress = order.shippingAddress ?? order.address ?? null;
  const displayOrderId =
    order.orderNumber ?? `#MED${String(order.id).padStart(6, "0")}`;

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/dashboard/orders"
            className="mb-2 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Orders
          </Link>

          <h1 className="text-3xl font-bold text-gray-900">
            Order {displayOrderId}
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Placed on {formatDateTime(order.createdAt)}
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={getOrder}
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

      <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Order Status</p>
          <span
            className={`mt-3 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
              statusColors[order.orderStatus]
            }`}
          >
            {order.orderStatus}
          </span>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Payment Status</p>
          <p className="mt-3 text-xl font-bold text-gray-900">
            {order.paymentStatus}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Items</p>
          <p className="mt-3 text-xl font-bold text-gray-900">{items.length}</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Total Amount</p>
          <p className="mt-3 text-xl font-bold text-blue-600">
            {formatCurrency(order.total)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <DetailCard title="Order Items" icon={ShoppingBag}>
            {items.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
                <p className="font-medium text-gray-900">No items found</p>
                <p className="mt-1 text-sm text-gray-500">
                  This order does not contain item details.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-1 gap-4 rounded-xl border border-gray-200 p-4 sm:grid-cols-[80px_1fr_auto]"
                  >
                    <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg bg-blue-50">
                      {getOrderItemImageUrl(item) ? (
                        <img
                          src={getImageUrl(getOrderItemImageUrl(item))}
                          alt={item.productName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Package className="h-8 w-8 text-blue-300" />
                      )}
                    </div>

                    <div>
                      <Link
                        href={`/dashboard/products/${item.productId}`}
                        className="font-semibold text-gray-900 hover:text-blue-600"
                      >
                        {item.productName}
                      </Link>

                      <p className="mt-1 text-sm text-gray-500">
                        Quantity: {item.quantity} ×{" "}
                        {formatCurrency(item.unitPrice)}
                      </p>

                      {item.requiresPrescription && (
                        <span className="mt-2 inline-flex rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                          Rx Required
                        </span>
                      )}
                    </div>

                    <div className="text-left sm:text-right">
                      <p className="font-bold text-gray-900">
                        {formatCurrency(item.totalPrice)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DetailCard>

          <DetailCard title="Update Order Status" icon={Truck}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto]">
              <select
                value={selectedStatus}
                onChange={(event) =>
                  setSelectedStatus(event.target.value as OrderStatus)
                }
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>

              <Button
                type="button"
                disabled={
                  isUpdatingStatus || selectedStatus === order.orderStatus
                }
                onClick={handleStatusUpdate}
                className="bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300"
              >
                {isUpdatingStatus ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Status
                  </>
                )}
              </Button>
            </div>

            {order.cancellationReason && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <p className="font-semibold">Cancellation Reason</p>
                <p className="mt-1">{order.cancellationReason}</p>
              </div>
            )}
          </DetailCard>

          {order.note && (
            <DetailCard title="Customer Note" icon={AlertCircle}>
              <p className="whitespace-pre-line text-sm leading-6 text-gray-600">
                {order.note}
              </p>
            </DetailCard>
          )}
        </div>

        <div className="space-y-6">
          <DetailCard title="Customer" icon={User}>
            <InfoLine label="Name" value={getCustomerName(order)} />
            <InfoLine label="Email" value={order.customerEmail} />
            <InfoLine label="Phone" value={order.customerPhone} />
          </DetailCard>

          <DetailCard title="Payment" icon={CreditCard}>
            <InfoLine label="Method" value={order.paymentMethod} />
            <InfoLine label="Status" value={order.paymentStatus} />
            {order.transactionId && (
              <InfoLine label="Transaction ID" value={order.transactionId} />
            )}
            {order.senderPhoneNumber && (
              <InfoLine label="Sender Phone" value={order.senderPhoneNumber} />
            )}
            <InfoLine label="Subtotal" value={formatCurrency(order.subtotal)} />
            <InfoLine label="Discount" value={formatCurrency(order.discount)} />
            <InfoLine
              label="Delivery Charge"
              value={formatCurrency(order.deliveryCharge)}
            />
            <InfoLine label="Total" value={formatCurrency(order.total)} />

            {order.paymentMethod !== "CashOnDelivery" &&
              order.paymentStatus.toLowerCase() !== "paid" && (
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <Button
                    type="button"
                    disabled={isVerifying || !order.transactionId}
                    onClick={verifyOrderPayment}
                    className="w-full bg-green-600 font-bold text-white hover:bg-green-700 disabled:bg-gray-300 gap-2"
                  >
                    {isVerifying ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ShieldCheck className="h-4 w-4" />
                    )}
                    Verify Manual Payment
                  </Button>
                  {!order.transactionId && (
                    <p className="mt-2 text-center text-xs text-gray-500">
                      Needs customer to submit payment via simulator or gateway
                      first.
                    </p>
                  )}
                </div>
              )}
          </DetailCard>

          <DetailCard title="Shipping Address" icon={MapPin}>
            {shippingAddress ? (
              <>
                <InfoLine label="Full Name" value={shippingAddress.fullName} />
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
          </DetailCard>

          <DetailCard title="System Info" icon={Package}>
            <InfoLine label="Order ID" value={order.id} />
            <InfoLine label="Order Number" value={displayOrderId} />
            <InfoLine
              label="Created At"
              value={formatDateTime(order.createdAt)}
            />
            <InfoLine
              label="Updated At"
              value={order.updatedAt ? formatDateTime(order.updatedAt) : "N/A"}
            />
          </DetailCard>
        </div>
      </div>
    </div>
  );
}
