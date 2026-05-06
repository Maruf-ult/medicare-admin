"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { ApiResponse, DashboardStats } from "@/types";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  BarChart3,
  Loader2,
  RefreshCcw,
  ShoppingCart,
  TrendingUp,
  Users,
  FileText,
  Package,
  Activity,
} from "lucide-react";
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
  RadialBar,
  RadialBarChart,
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
};

type MetricCardProps = {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  tone: "blue" | "green" | "orange" | "purple";
};

function MetricCard({ title, value, subtitle, icon: Icon, tone }: MetricCardProps) {
  const toneClass = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    green: "bg-green-50 text-green-600 border-green-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="mt-2 text-2xl font-bold text-gray-900">{value}</h3>
        </div>

        <div className={`rounded-2xl border p-3 ${toneClass[tone]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>

      <p className="text-sm text-gray-500">{subtitle}</p>
    </div>
  );
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<DashboardStats>(emptyStats);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getAnalyticsData = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const response = await api.get<ApiResponse<DashboardStats>>("/dashboard");

      if (response.data.success && response.data.data) {
        setStats(response.data.data);
      } else {
        setStats(emptyStats);
        setErrorMessage(response.data.message || "Failed to load analytics.");
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      setStats(emptyStats);
      setErrorMessage("Failed to load analytics. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getAnalyticsData();
  }, []);

  const orderStatusData = useMemo(
    () => [
      { name: "Pending", value: stats.pendingOrders },
      { name: "Processing", value: stats.processingOrders },
      { name: "Delivered", value: stats.deliveredOrders },
      { name: "Cancelled", value: stats.cancelledOrders },
    ],
    [stats]
  );

  const prescriptionData = useMemo(
    () => [
      { name: "Pending", value: stats.pendingPrescriptions },
      { name: "Approved", value: stats.approvedPrescriptions },
      { name: "Rejected", value: stats.rejectedPrescriptions },
    ],
    [stats]
  );

  const inventoryData = useMemo(
    () => [
      { name: "Total Products", value: stats.totalProducts },
      { name: "Low Stock", value: stats.lowStockProducts },
      { name: "Out of Stock", value: stats.outOfStockProducts },
    ],
    [stats]
  );

  const revenueData = useMemo(() => {
    const monthRevenue = stats.thisMonthRevenue || 0;
    const todayRevenue = stats.todaysRevenue || 0;

    return [
      { name: "Week 1", revenue: Math.round(monthRevenue * 0.18), orders: Math.round(stats.totalOrders * 0.16) },
      { name: "Week 2", revenue: Math.round(monthRevenue * 0.22), orders: Math.round(stats.totalOrders * 0.2) },
      { name: "Week 3", revenue: Math.round(monthRevenue * 0.27), orders: Math.round(stats.totalOrders * 0.25) },
      { name: "Week 4", revenue: Math.round(monthRevenue * 0.33), orders: Math.round(stats.totalOrders * 0.3) },
      { name: "Today", revenue: todayRevenue, orders: stats.todaysOrders },
    ];
  }, [stats]);

  const customerGrowthData = useMemo(
    () => [
      { name: "Existing", customers: Math.max(stats.totalCustomers - stats.newCustomersToday, 0) },
      { name: "New Today", customers: stats.newCustomersToday },
    ],
    [stats]
  );

  const operationalScore = useMemo(() => {
    const delivered = stats.deliveredOrders;
    const total = stats.totalOrders || 1;
    const score = Math.round((delivered / total) * 100);

    return [
      {
        name: "Performance",
        value: score,
        fill: "#2563eb",
      },
    ];
  }, [stats]);

  const pieColors = ["#f59e0b", "#3b82f6", "#22c55e", "#ef4444"];
  const prescriptionColors = ["#f59e0b", "#22c55e", "#ef4444"];

  if (isLoading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading analytics...
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Analytics & Reports
          </h1>
          <p className="mt-1 text-gray-600">
            Visual business insights from dashboard, orders, products, prescriptions, and customers.
          </p>
        </div>

        <Button
          type="button"
          onClick={getAnalyticsData}
          variant="outline"
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

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          subtitle={`${formatCurrency(stats.todaysRevenue)} earned today`}
          icon={TrendingUp}
          tone="green"
        />

        <MetricCard
          title="Total Orders"
          value={stats.totalOrders.toLocaleString()}
          subtitle={`${stats.todaysOrders} orders today`}
          icon={ShoppingCart}
          tone="blue"
        />

        <MetricCard
          title="Total Customers"
          value={stats.totalCustomers.toLocaleString()}
          subtitle={`${stats.newCustomersToday} new customers today`}
          icon={Users}
          tone="purple"
        />

        <MetricCard
          title="Prescriptions"
          value={stats.totalPrescriptions.toLocaleString()}
          subtitle={`${stats.pendingPrescriptions} waiting for review`}
          icon={FileText}
          tone="orange"
        />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Revenue & Orders Trend
              </h2>
              <p className="text-sm text-gray-500">
                Estimated weekly trend generated from current dashboard stats.
              </p>
            </div>

            <BarChart3 className="h-5 w-5 text-blue-600" />
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === "revenue") return formatCurrency(Number(value));
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
            <h2 className="text-lg font-bold text-gray-900">
              Delivery Performance
            </h2>
            <p className="text-sm text-gray-500">
              Delivered order ratio.
            </p>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="65%"
                outerRadius="90%"
                barSize={18}
                data={operationalScore}
                startAngle={90}
                endAngle={-270}
              >
                <RadialBar dataKey="value" cornerRadius={20} />
                <Tooltip formatter={(value) => `${value}%`} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>

          <div className="-mt-44 flex flex-col items-center justify-center">
            <p className="text-4xl font-bold text-gray-900">
              {operationalScore[0].value}%
            </p>
            <p className="text-sm text-gray-500">Delivered</p>
          </div>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900">
              Order Status Distribution
            </h2>
            <p className="text-sm text-gray-500">
              Pending, processing, delivered, and cancelled orders.
            </p>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderStatusData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={110}
                  label
                >
                  {orderStatusData.map((_, index) => (
                    <Cell key={index} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900">
              Prescription Review Status
            </h2>
            <p className="text-sm text-gray-500">
              Review progress for uploaded prescriptions.
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
                      fill={prescriptionColors[index % prescriptionColors.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Inventory Health
              </h2>
              <p className="text-sm text-gray-500">
                Product stock condition overview.
              </p>
            </div>
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

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-600" />
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Customer Growth
              </h2>
              <p className="text-sm text-gray-500">
                Existing customers vs new customers today.
              </p>
            </div>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={customerGrowthData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="name" />
                <Tooltip />
                <Bar
                  dataKey="customers"
                  fill="#7c3aed"
                  radius={[0, 8, 8, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}