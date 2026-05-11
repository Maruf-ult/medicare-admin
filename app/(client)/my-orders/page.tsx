"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { ApiResponse, PagedResponse } from "@/types";
import { Button } from "@/components/ui/button";
import { AlertCircle, Eye, Loader2, Package, RefreshCcw, X } from "lucide-react";
import { toast } from "sonner";

type Order = {
  id: number;
  orderNumber?: string | null;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  total: number;
  createdAt: string;
  items?: unknown[];
  orderItems?: unknown[];
};

function extractItems<T>(data: T[] | PagedResponse<T>): T[] {
  return Array.isArray(data) ? data : data.items ?? [];
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getOrders = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const response = await api.get<ApiResponse<Order[] | PagedResponse<Order>>>(
        "/orders/my-orders"
      );

      if (response.data.success && response.data.data) {
        setOrders(extractItems(response.data.data));
      } else {
        setOrders([]);
        setErrorMessage(response.data.message || "Failed to load orders.");
      }
    } catch (error) {
      console.error("Failed to load orders:", error);
      setOrders([]);
      setErrorMessage("Failed to load orders. Please login and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getOrders();
  }, []);

  const cancelOrder = async (order: Order) => {
    const confirmed = window.confirm("Are you sure you want to cancel this order?");
    if (!confirmed) return;

    try {
      setCancellingId(order.id);

      const response = await api.put<ApiResponse<unknown>>(
        `/orders/my-orders/${order.id}/cancel`,
        {
          reason: "Cancelled by customer",
        }
      );

      if (response.data.success) {
        toast.success("Order cancelled successfully");
        getOrders();
      } else {
        toast.error(response.data.message || "Failed to cancel order");
      }
    } catch (error) {
      console.error("Failed to cancel order:", error);
      toast.error("Failed to cancel order");
    } finally {
      setCancellingId(null);
    }
  };

  if (isLoading) {
    return <Loading text="Loading orders..." />;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">My Orders</h1>
          <p className="mt-2 text-sm text-gray-500">
            Track your medicine orders.
          </p>
        </div>

        <Button variant="outline" onClick={getOrders} className="gap-2">
          <RefreshCcw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {errorMessage && <ErrorBox message={errorMessage} />}

      {orders.length === 0 ? (
        <EmptyBox
          icon={<Package className="mx-auto mb-4 h-14 w-14 text-gray-300" />}
          title="No orders found"
          description="Your orders will appear here after checkout."
          href="/shop"
          button="Shop Now"
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const canCancel = ["Pending", "Confirmed"].includes(order.orderStatus);
            const itemCount = (order.items ?? order.orderItems ?? []).length;

            return (
              <div
                key={order.id}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h3 className="text-lg font-black text-gray-900">
                      {order.orderNumber ?? `Order #${order.id}`}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {formatDateTime(order.createdAt)}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge>{order.orderStatus}</Badge>
                    <Badge>{order.paymentStatus}</Badge>
                    <Badge>{order.paymentMethod}</Badge>
                  </div>

                  <div className="text-left lg:text-right">
                    <p className="text-xs font-semibold text-gray-400">
                      {itemCount} item{itemCount !== 1 ? "s" : ""}
                    </p>
                    <p className="text-xl font-black text-blue-600">
                      {formatCurrency(order.total)}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/my-orders/${order.id}`}>
                      <Button variant="outline" className="gap-2">
                        <Eye className="h-4 w-4" />
                        Details
                      </Button>
                    </Link>

                    {canCancel && (
                      <Button
                        variant="outline"
                        disabled={cancellingId === order.id}
                        onClick={() => cancelOrder(order)}
                        className="gap-2 border-red-200 text-red-600 hover:bg-red-50"
                      >
                        {cancellingId === order.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Loading({ text }: { text: string }) {
  return (
    <div className="flex min-h-[500px] items-center justify-center">
      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      {text}
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      <AlertCircle className="h-4 w-4" />
      {message}
    </div>
  );
}

function EmptyBox({
  icon,
  title,
  description,
  href,
  button,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  button: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
      {icon}
      <h2 className="text-2xl font-black text-gray-900">{title}</h2>
      <p className="mt-2 text-sm text-gray-500">{description}</p>
      <Link href={href}>
        <Button className="mt-6 bg-blue-600 text-white">{button}</Button>
      </Link>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
      {children}
    </span>
  );
}