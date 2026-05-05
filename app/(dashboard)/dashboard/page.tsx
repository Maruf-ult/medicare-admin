"use client";

import { useState, useEffect } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
} from "recharts";
import {
  ShoppingCart, Package, Users, TrendingUp, ClipboardList,
  AlertCircle, Clock, ArrowUpRight, ArrowDownRight, Pill, Loader2,
} from "lucide-react";
import api from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardStats {
  totalRevenue: number; revenueChange: number;
  totalOrders: number; ordersChange: number;
  totalProducts: number; productsChange: number;
  totalCustomers: number; customersChange: number;
  pendingPrescriptions: number; pendingOrders: number; lowStockProducts: number;
}

interface RecentOrder {
  id: number; orderNumber: string; customerName: string;
  total: number; status: string; createdAt: string;
}

interface TopProduct {
  id: number; name: string; unitsSold: number; revenue: number;
}

interface RevenueDataPoint { month: string; revenue: number; orders: number; }
interface CategoryDataPoint { name: string; value: number; }

// ─── Mock data (replace with real API) ────────────────────────────────────────

const mockStats: DashboardStats = {
  totalRevenue: 284750, revenueChange: 12.5,
  totalOrders: 1842, ordersChange: 8.3,
  totalProducts: 934, productsChange: -2.1,
  totalCustomers: 5291, customersChange: 15.7,
  pendingPrescriptions: 23, pendingOrders: 47, lowStockProducts: 12,
};

const mockRevenueData: RevenueDataPoint[] = [
  { month: "Jul", revenue: 38000, orders: 210 },
  { month: "Aug", revenue: 42000, orders: 245 },
  { month: "Sep", revenue: 39500, orders: 228 },
  { month: "Oct", revenue: 51000, orders: 301 },
  { month: "Nov", revenue: 47200, orders: 278 },
  { month: "Dec", revenue: 63000, orders: 390 },
  { month: "Jan", revenue: 58400, orders: 342 },
];

const mockCategoryData: CategoryDataPoint[] = [
  { name: "Prescription", value: 38 },
  { name: "OTC Medicines", value: 27 },
  { name: "Supplements", value: 18 },
  { name: "Personal Care", value: 11 },
  { name: "Equipment", value: 6 },
];

const mockRecentOrders: RecentOrder[] = [
  { id: 1, orderNumber: "ORD-2024-8821", customerName: "Rahima Khatun", total: 2340, status: "Processing", createdAt: "2025-01-07T10:23:00Z" },
  { id: 2, orderNumber: "ORD-2024-8820", customerName: "Md. Karim", total: 890, status: "Shipped", createdAt: "2025-01-07T09:45:00Z" },
  { id: 3, orderNumber: "ORD-2024-8819", customerName: "Fatema Begum", total: 5670, status: "Pending", createdAt: "2025-01-07T09:12:00Z" },
  { id: 4, orderNumber: "ORD-2024-8818", customerName: "Arif Hossain", total: 1200, status: "Delivered", createdAt: "2025-01-07T08:30:00Z" },
  { id: 5, orderNumber: "ORD-2024-8817", customerName: "Nasrin Akter", total: 3450, status: "Processing", createdAt: "2025-01-07T08:05:00Z" },
];

const mockTopProducts: TopProduct[] = [
  { id: 1, name: "Napa Extra 500mg", unitsSold: 1240, revenue: 62000 },
  { id: 2, name: "Vitamin D3 5000IU", unitsSold: 890, revenue: 44500 },
  { id: 3, name: "Omeprazole 20mg", unitsSold: 760, revenue: 38000 },
  { id: 4, name: "Amlodipine 5mg", unitsSold: 680, revenue: 34000 },
  { id: 5, name: "Cetirizine 10mg", unitsSold: 540, revenue: 27000 },
];

const PIE_COLORS = ["#4f46e5", "#7c3aed", "#a855f7", "#c084fc", "#e9d5ff"];

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  Pending: { label: "Pending", className: "bg-amber-50 text-amber-700 border border-amber-200" },
  Processing: { label: "Processing", className: "bg-blue-50 text-blue-700 border border-blue-200" },
  Shipped: { label: "Shipped", className: "bg-purple-50 text-purple-700 border border-purple-200" },
  Delivered: { label: "Delivered", className: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  Cancelled: { label: "Cancelled", className: "bg-red-50 text-red-700 border border-red-200" },
};

// ─── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ label, value, change, icon: Icon, prefix = "", iconColor }: {
  label: string; value: number; change: number;
  icon: React.ElementType; prefix?: string; iconColor: string;
}) {
  const isPositive = change >= 0;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        <div className={`p-2.5 rounded-xl ${iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900 tracking-tight">
        {prefix}{value > 999 ? value.toLocaleString() : value}
      </p>
      <div className="flex items-center gap-1.5 mt-2">
        {isPositive
          ? <ArrowUpRight className="w-4 h-4 text-emerald-500" />
          : <ArrowDownRight className="w-4 h-4 text-red-500" />}
        <span className={`text-sm font-semibold ${isPositive ? "text-emerald-600" : "text-red-600"}`}>
          {Math.abs(change)}%
        </span>
        <span className="text-sm text-gray-400">vs last month</span>
      </div>
    </div>
  );
}

function AlertCard({ icon: Icon, label, count, color, href }: {
  icon: React.ElementType; label: string; count: number; color: string; href: string;
}) {
  return (
    <a href={href} className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer hover:opacity-90 transition-opacity ${color}`}>
      <Icon className="w-5 h-5 flex-shrink-0" />
      <p className="text-sm font-medium flex-1">{label}</p>
      <span className="text-lg font-bold">{count}</span>
    </a>
  );
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean; payload?: { value: number; name: string }[]; label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-3">
      <p className="text-xs font-semibold text-gray-500 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-bold text-gray-800">
          {p.name === "revenue" ? `৳${p.value.toLocaleString()}` : `${p.value} orders`}
        </p>
      ))}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState<"revenue" | "orders">("revenue");

  useEffect(() => {
    api.get("/dashboard/stats")
      .then((res) => setStats(res.data))
      .catch(() => setStats(mockStats))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-sm text-gray-500">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  const s = stats!;

  return (
    <div className="space-y-8 p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {new Date().toLocaleDateString("en-BD", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live
        </span>
      </div>

      {/* Alert strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <AlertCard icon={ClipboardList} label="Prescriptions awaiting review" count={s.pendingPrescriptions} color="bg-amber-50 text-amber-800 border-amber-200" href="/prescriptions" />
        <AlertCard icon={Clock} label="Orders pending fulfillment" count={s.pendingOrders} color="bg-blue-50 text-blue-800 border-blue-200" href="/orders?status=pending" />
        <AlertCard icon={AlertCircle} label="Products low on stock" count={s.lowStockProducts} color="bg-red-50 text-red-800 border-red-200" href="/products?filter=lowstock" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard label="Total Revenue" value={s.totalRevenue} change={s.revenueChange} icon={TrendingUp} prefix="৳" iconColor="bg-indigo-50 text-indigo-600" />
        <StatCard label="Total Orders" value={s.totalOrders} change={s.ordersChange} icon={ShoppingCart} iconColor="bg-violet-50 text-violet-600" />
        <StatCard label="Products" value={s.totalProducts} change={s.productsChange} icon={Package} iconColor="bg-purple-50 text-purple-600" />
        <StatCard label="Customers" value={s.totalCustomers} change={s.customersChange} icon={Users} iconColor="bg-fuchsia-50 text-fuchsia-600" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Area / Bar chart */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-semibold text-gray-800">Performance Overview</h2>
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              {(["revenue", "orders"] as const).map((tab) => (
                <button key={tab} onClick={() => setActiveChart(tab)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-md transition-all ${activeChart === tab ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                  {tab === "revenue" ? "Revenue" : "Orders"}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            {activeChart === "revenue" ? (
              <AreaChart data={mockRevenueData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={(v) => `৳${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2.5} fill="url(#revGrad)" dot={{ fill: "#4f46e5", strokeWidth: 0, r: 4 }} activeDot={{ r: 6, strokeWidth: 0 }} />
              </AreaChart>
            ) : (
              <BarChart data={mockRevenueData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="orders" fill="#7c3aed" radius={[6, 6, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-6">Sales by Category</h2>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={mockCategoryData} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value">
                {mockCategoryData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => [`${v}%`, ""]} contentStyle={{ borderRadius: 12, border: "1px solid #f0f0f0", fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {mockCategoryData.map((cat, i) => (
              <div key={cat.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i] }} />
                  <span className="text-xs text-gray-600">{cat.name}</span>
                </div>
                <span className="text-xs font-semibold text-gray-800">{cat.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Recent orders */}
        <div className="xl:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <h2 className="text-base font-semibold text-gray-800">Recent Orders</h2>
            <a href="/orders" className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
              View all <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
          <div className="divide-y divide-gray-50">
            {mockRecentOrders.map((order) => {
              const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG["Pending"];
              return (
                <div key={order.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50/60 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{order.orderNumber}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{order.customerName}</p>
                  </div>
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${cfg.className}`}>{cfg.label}</span>
                  <p className="text-sm font-bold text-gray-800 w-20 text-right">৳{order.total.toLocaleString()}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top products */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <h2 className="text-base font-semibold text-gray-800">Top Products</h2>
            <Pill className="w-4 h-4 text-gray-400" />
          </div>
          <div className="divide-y divide-gray-50">
            {mockTopProducts.map((product, i) => (
              <div key={product.id} className="flex items-center gap-3 px-6 py-3.5">
                <span className="w-6 text-xs font-bold text-gray-300">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{product.unitsSold.toLocaleString()} units sold</p>
                </div>
                <p className="text-sm font-bold text-indigo-600">৳{(product.revenue / 1000).toFixed(0)}k</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}