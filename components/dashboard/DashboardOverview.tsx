import { DashboardStats } from "@/types";
import { formatCurrency } from "@/lib/utils";
import {
  ClipboardList,
  Package,
  ReceiptText,
  TrendingUp,
  Users,
} from "lucide-react";

type DashboardOverviewProps = {
  stats: DashboardStats;
};

const cards = [
  {
    label: "Total Orders",
    key: "totalOrders",
    icon: ClipboardList,
  },
  {
    label: "Total Revenue",
    key: "totalRevenue",
    icon: TrendingUp,
  },
  {
    label: "Pending Prescriptions",
    key: "pendingPrescriptions",
    icon: ReceiptText,
  },
  {
    label: "Total Products",
    key: "totalProducts",
    icon: Package,
  },
  {
    label: "Total Customers",
    key: "totalCustomers",
    icon: Users,
  },
] as const;

export function DashboardOverview({ stats }: DashboardOverviewProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon;
        const rawValue = stats[card.key];

        const value =
          card.key === "totalRevenue"
            ? formatCurrency(Number(rawValue))
            : Number(rawValue).toLocaleString();

        return (
          <div
            key={card.key}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">{card.label}</p>
              <div className="rounded-lg bg-blue-50 p-2">
                <Icon className="h-5 w-5 text-blue-600" />
              </div>
            </div>

            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        );
      })}
    </div>
  );
}