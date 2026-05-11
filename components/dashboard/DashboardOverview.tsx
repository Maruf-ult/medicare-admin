import {
  ClipboardList,
  Package,
  Pill,
  TrendingUp,
  Users,
  FileCheck,
  AlertTriangle,
  ShoppingBag,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type DashboardStats = {
  totalOrders: number;
  todaysOrders: number;
  pendingOrders: number;
  processingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;

  totalRevenue: number;
  todaysRevenue: number;
  thisMonthRevenue: number;

  totalPrescriptions: number;
  pendingPrescriptions: number;
  approvedPrescriptions: number;
  rejectedPrescriptions: number;

  totalProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;

  totalCustomers: number;
  newCustomersToday: number;
};

type DashboardOverviewProps = {
  stats: DashboardStats;
};

export function DashboardOverview({ stats }: DashboardOverviewProps) {
  const cards = [
    {
      title: "Total Orders",
      value: stats.totalOrders,
      subtitle: `${stats.todaysOrders} orders today`,
      icon: ClipboardList,
      color: "bg-blue-50 text-blue-600",
      border: "border-blue-100",
    },
    {
      title: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      subtitle: `${formatCurrency(stats.todaysRevenue)} today`,
      icon: TrendingUp,
      color: "bg-green-50 text-green-600",
      border: "border-green-100",
    },
    {
      title: "Products",
      value: stats.totalProducts,
      subtitle: `${stats.lowStockProducts} low stock`,
      icon: Pill,
      color: "bg-purple-50 text-purple-600",
      border: "border-purple-100",
    },
    {
      title: "Customers",
      value: stats.totalCustomers,
      subtitle: `${stats.newCustomersToday} new today`,
      icon: Users,
      color: "bg-orange-50 text-orange-600",
      border: "border-orange-100",
    },
  ];

  const statusCards = [
    {
      title: "Pending Orders",
      value: stats.pendingOrders,
      icon: ShoppingBag,
      color: "bg-yellow-50 text-yellow-700",
    },
    {
      title: "Processing",
      value: stats.processingOrders,
      icon: Package,
      color: "bg-blue-50 text-blue-700",
    },
    {
      title: "Pending Prescriptions",
      value: stats.pendingPrescriptions,
      icon: FileCheck,
      color: "bg-purple-50 text-purple-700",
    },
    {
      title: "Stock Alerts",
      value: stats.lowStockProducts + stats.outOfStockProducts,
      icon: AlertTriangle,
      color: "bg-red-50 text-red-700",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className={`rounded-2xl border ${card.border} bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {card.title}
                  </p>
                  <h3 className="mt-2 text-3xl font-black text-gray-900">
                    {card.value}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {card.subtitle}
                  </p>
                </div>

                <div className={`rounded-xl p-3 ${card.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statusCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className={`rounded-lg p-3 ${card.color}`}>
                  <Icon className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm text-gray-500">{card.title}</p>
                  <h4 className="mt-1 text-2xl font-black text-gray-900">
                    {card.value}
                  </h4>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}