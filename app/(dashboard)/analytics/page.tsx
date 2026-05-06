"use client";

import { BarChart3, TrendingUp } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
        <p className="text-gray-600 mt-1">Track sales, revenue, and business metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Total Revenue", value: "৳4,50,320", change: "+12% this month" },
          { label: "Total Orders", value: "1,245", change: "+8% from last month" },
          { label: "Avg Order Value", value: "৳1,565", change: "Stable" },
          { label: "Conversion Rate", value: "3.2%", change: "+0.5% increase" },
        ].map((metric, idx) => (
          <div key={idx} className="bg-white p-6 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 font-medium mb-2">{metric.label}</p>
            <p className="text-3xl font-bold text-gray-900 mb-2">{metric.value}</p>
            <p className="text-xs text-green-600">{metric.change}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200 h-64 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>Revenue Trend Chart (Recharts)</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 h-64 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>Top Products Chart (Recharts)</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Selling Products</h3>
        <div className="space-y-3">
          {[
            { product: "Paracetamol 500mg", sold: 340, revenue: "৳15,300" },
            { product: "Amoxicillin 500mg", sold: 287, revenue: "৳34,440" },
            { product: "Vitamin D3", sold: 156, revenue: "৳31,200" },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{item.product}</p>
                <p className="text-sm text-gray-600">{item.sold} units sold</p>
              </div>
              <p className="font-semibold text-gray-900">{item.revenue}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
