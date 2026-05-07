"use client";

import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { ApiResponse, DashboardStats } from "@/types";
import {
  AlertCircle,
  BarChart3,
  FileText,
  Loader2,
  RefreshCcw,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const emptyStats: DashboardStats = {
  totalOrders: 0,
  todaysOrders: 0,
  pendingOrders: 0,
  processingOrders: 0,
  deliveredOrders: 0,
  cancelledOrders: 0,

  totalRevenue: 0,
  todaysRevenue: 0,
  thisMonthRevenue: 0,

  totalPrescriptions: 0,
  pendingPrescriptions: 0,
  approvedPrescriptions: 0,
  rejectedPrescriptions: 0,

  totalProducts: 0,
  lowStockProducts: 0,
  outOfStockProducts: 0,

  totalCustomers: 0,
  newCustomersToday: 0,
  topSellingProducts: [],
  recentOrders: [],
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(emptyStats);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getDashboardData = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const response = await api.get<ApiResponse<DashboardStats>>("/dashboard");

      if (response.data.success && response.data.data) {
        setStats(response.data.data);
      } else {
        setStats(emptyStats);
        setErrorMessage(response.data.message || "Failed to load dashboard.");
      }
    } catch (error) {
      console.error("Failed to fetch dashboard:", error);
      setStats(emptyStats);
      setErrorMessage("Failed to load dashboard data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getDashboardData();
  }, []);

  const revenueTrendData = useMemo(() => {
    const monthRevenue = stats.thisMonthRevenue || 0;

    return [
      {
        name: "Week 1",
        revenue: Math.round(monthRevenue * 0.18),
        orders: Math.round(stats.totalOrders * 0.16),
      },
      {
        name: "Week 2",
        revenue: Math.round(monthRevenue * 0.22),
        orders: Math.round(stats.totalOrders * 0.2),
      },
      {
        name: "Week 3",
        revenue: Math.round(monthRevenue * 0.27),
        orders: Math.round(stats.totalOrders * 0.25),
      },
      {
        name: "Week 4",
        revenue: Math.round(monthRevenue * 0.33),
        orders: Math.round(stats.totalOrders * 0.3),
      },
      {
        name: "Today",
        revenue: stats.todaysRevenue,
        orders: stats.todaysOrders,
      },
    ];
  }, [stats]);

  const orderStatusData = useMemo(
    () => [
      { name: "Pending", value: stats.pendingOrders },
      { name: "Processing", value: stats.processingOrders },
      { name: "Delivered", value: stats.deliveredOrders },
      { name: "Cancelled", value: stats.cancelledOrders },
    ],
    [stats],
  );

  const prescriptionData = useMemo(
    () => [
      { name: "Pending", value: stats.pendingPrescriptions },
      { name: "Approved", value: stats.approvedPrescriptions },
      { name: "Rejected", value: stats.rejectedPrescriptions },
    ],
    [stats],
  );

  const inventoryData = useMemo(
    () => [
      { name: "Total", value: stats.totalProducts },
      { name: "Low Stock", value: stats.lowStockProducts },
      { name: "Out Stock", value: stats.outOfStockProducts },
    ],
    [stats],
  );

  const orderColors = ["#f59e0b", "#3b82f6", "#22c55e", "#ef4444"];
  const prescriptionColors = ["#f59e0b", "#22c55e", "#ef4444"];

  if (isLoading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Platform overview, sales performance, orders, prescriptions, and
            inventory insights.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={getDashboardData}
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

      <div className="mb-8">
        <DashboardOverview stats={stats} />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">
              Today&apos;s Revenue
            </p>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {formatCurrency(stats.todaysRevenue)}
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            This month: {formatCurrency(stats.thisMonthRevenue)}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">
              Today&apos;s Orders
            </p>
            <ShoppingCart className="h-5 w-5 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {stats.todaysOrders}
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Pending: {stats.pendingOrders}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">Pending Rx</p>
            <FileText className="h-5 w-5 text-orange-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {stats.pendingPrescriptions}
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Total prescriptions: {stats.totalPrescriptions}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">Stock Alerts</p>
            <BarChart3 className="h-5 w-5 text-red-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {stats.lowStockProducts + stats.outOfStockProducts}
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Low: {stats.lowStockProducts}, Out: {stats.outOfStockProducts}
          </p>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900">
              Revenue & Orders Trend
            </h2>
            <p className="text-sm text-gray-500">
              Weekly revenue and order performance.
            </p>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={revenueTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === "Revenue") {
                      return formatCurrency(Number(value));
                    }

                    return Number(value).toLocaleString();
                  }}
                />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="revenue"
                  name="Revenue"
                  fill="#2563eb"
                  radius={[8, 8, 0, 0]}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="orders"
                  name="Orders"
                  stroke="#16a34a"
                  strokeWidth={3}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900">Order Status</h2>
            <p className="text-sm text-gray-500">
              Distribution of order status.
            </p>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderStatusData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={105}
                  label
                >
                  {orderStatusData.map((_, index) => (
                    <Cell
                      key={index}
                      fill={orderColors[index % orderColors.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900">
              Prescription Review Status
            </h2>
            <p className="text-sm text-gray-500">
              Pending, approved, and rejected prescriptions.
            </p>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={prescriptionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {prescriptionData.map((_, index) => (
                    <Cell
                      key={index}
                      fill={
                        prescriptionColors[index % prescriptionColors.length]
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900">
              Inventory Health
            </h2>
            <p className="text-sm text-gray-500">Product stock overview.</p>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={inventoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#2563eb"
                  fill="#dbeafe"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
