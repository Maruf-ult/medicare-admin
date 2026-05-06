"use client";

import { Edit2, Eye } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Order {
  id: string;
  customer: string;
  amount: number;
  status: "Pending" | "Processing" | "Shipped" | "Delivered";
  date: string;
  items: number;
}

const mockOrders: Order[] = [
  {
    id: "#MED2024001",
    customer: "Ahmed Hassan",
    amount: 1250,
    status: "Processing",
    date: "2024-05-06",
    items: 3,
  },
  {
    id: "#MED2024002",
    customer: "Fatima Khan",
    amount: 890,
    status: "Shipped",
    date: "2024-05-05",
    items: 2,
  },
  {
    id: "#MED2024003",
    customer: "Saiful Islam",
    amount: 2100,
    status: "Delivered",
    date: "2024-05-04",
    items: 5,
  },
  {
    id: "#MED2024004",
    customer: "Maria Ahmed",
    amount: 650,
    status: "Pending",
    date: "2024-05-03",
    items: 1,
  },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState(mockOrders);
  const [filter, setFilter] = useState<
    "all" | "pending" | "processing" | "shipped" | "delivered"
  >("all");

  const handleEditOrder = (orderId: string) => {
    toast.info(`Opening order ${orderId} for editing...`);
  };

  const filteredOrders =
    filter === "all"
      ? orders
      : orders.filter((o) => o.status.toLowerCase() === filter);

  const statusColors = {
    Pending: "bg-gray-100 text-gray-700",
    Processing: "bg-orange-100 text-orange-700",
    Shipped: "bg-blue-100 text-blue-700",
    Delivered: "bg-green-100 text-green-700",
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-600 mt-1">Manage customer orders</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {["all", "pending", "processing", "shipped", "delivered"].map(
          (status) => (
            <button
              key={status}
              onClick={() => setFilter(status as any)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                filter === status
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ),
        )}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
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
                  {order.id}
                </td>
                <td className="px-6 py-4 text-gray-700">{order.customer}</td>
                <td className="px-6 py-4 font-semibold text-gray-900">
                  ৳{order.amount}
                </td>
                <td className="px-6 py-4 text-gray-700">{order.items}</td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {order.date}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 flex items-center space-x-2">
                  <button
                    onClick={() => toast.info(`Viewing order ${order.id}`)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEditOrder(order.id)}
                    className="text-orange-600 hover:text-orange-700"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
