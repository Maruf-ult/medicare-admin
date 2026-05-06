"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  Edit2,
  Eye,
  Loader2,
  RefreshCcw,
} from "lucide-react";
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

type BackendOrder = {
  id: number;
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
  customerName?: string | null;
  userName?: string | null;
  user?: {
    name?: string | null;
  } | null;
  items?: unknown[];
  orderItems?: unknown[];
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
};

type PagedResponse<T> = {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

type OrderTableItem = {
  id: number;
  displayId: string;
  customer: string;
  amount: number;
  status: OrderStatus;
  paymentStatus: string;
  date: string;
  items: number;
};

const filterOptions: Array<"all" | Lowercase<OrderStatus>> = [
  "all",
  "pending",
  "confirmed",
  "processing",
  "packed",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
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

function extractItems<T>(data: T[] | PagedResponse<T>): T[] {
  return Array.isArray(data) ? data : data.items;
}

function normalizeOrders(
  data: BackendOrder[] | PagedResponse<BackendOrder>
): OrderTableItem[] {
  return extractItems(data).map((order) => ({
    id: order.id,
    displayId: `#MED${String(order.id).padStart(6, "0")}`,
    customer:
      order.customerName ??
      order.userName ??
      order.user?.name ??
      "Unknown Customer",
    amount: order.total,
    status: order.orderStatus,
    paymentStatus: order.paymentStatus,
    date: order.createdAt,
    items: order.items?.length ?? order.orderItems?.length ?? 0,
  }));
}

function toBackendStatus(status: string): OrderStatus {
  return (status.charAt(0).toUpperCase() + status.slice(1)) as OrderStatus;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderTableItem[]>([]);
  const [filter, setFilter] = useState<"all" | Lowercase<OrderStatus>>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getOrders = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const response = await api.get<
        ApiResponse<BackendOrder[] | PagedResponse<BackendOrder>>
      >("/orders", {
        params: {
          pageNumber: 1,
          pageSize: 100,
        },
      });

      if (response.data.success && response.data.data) {
        setOrders(normalizeOrders(response.data.data));
      } else {
        setOrders([]);
        setErrorMessage(response.data.message || "Failed to load orders.");
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      setOrders([]);
      setErrorMessage("Failed to load orders. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getOrders();
  }, []);

  const handleStatusChange = async (order: OrderTableItem, status: OrderStatus) => {
    try {
      setUpdatingId(order.id);

      const response = await api.put<ApiResponse<null>>(
        `/orders/${order.id}/status`,
        {
          orderStatus: status,
        }
      );

      if (response.data.success) {
        setOrders((prev) =>
          prev.map((item) =>
            item.id === order.id ? { ...item, status } : item
          )
        );

        toast.success(`${order.displayId} updated to ${status}`);
      } else {
        toast.error(response.data.message || "Failed to update order status.");
      }
    } catch (error) {
      console.error("Failed to update order status:", error);
      toast.error("Failed to update order status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders =
    filter === "all"
      ? orders
      : orders.filter((order) => order.status.toLowerCase() === filter);

  if (isLoading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading orders...
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="mt-1 text-gray-600">
            Manage customer orders and update delivery status.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={getOrders}
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

      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {filterOptions.map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`whitespace-nowrap rounded-lg px-4 py-2 font-medium ${
              filter === status
                ? "bg-blue-600 text-white"
                : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center">
          <h3 className="text-lg font-semibold text-gray-900">
            No orders found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Orders will appear here when customers place them.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {order.displayId}
                  </td>

                  <td className="px-6 py-4 text-gray-700">
                    {order.customer}
                  </td>

                  <td className="px-6 py-4 font-semibold text-gray-900">
                    {formatCurrency(order.amount)}
                  </td>

                  <td className="px-6 py-4 text-gray-700">{order.items}</td>

                  <td className="px-6 py-4 text-sm text-gray-700">
                    {formatDate(order.date)}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-700">
                    {order.paymentStatus}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[order.status]}`}
                    >
                      {order.status}
                    </span>
                  </td>

                  <td className="flex items-center space-x-3 px-6 py-4">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-blue-600 hover:text-blue-700"
                      title="View order"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>

                    <select
                      disabled={updatingId === order.id}
                      value={order.status}
                      onChange={(event) =>
                        handleStatusChange(
                          order,
                          toBackendStatus(event.target.value.toLowerCase())
                        )
                      }
                      className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-700 disabled:opacity-60"
                      title="Update order status"
                    >
                      {Object.keys(statusColors).map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>

                    {updatingId === order.id && (
                      <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    )}

                    <Edit2 className="h-4 w-4 text-orange-600" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}