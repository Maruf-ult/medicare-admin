"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Boxes,
  Building2,
  ClipboardList,
  FolderTree,
  LayoutDashboard,
  Package,
  Pill,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

type AdminSidebarProps = {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
};

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Products",
    href: "/dashboard/products",
    icon: Pill,
  },
  {
    label: "Categories",
    href: "/dashboard/categories",
    icon: FolderTree,
  },
  {
    label: "Brands",
    href: "/dashboard/brands",
    icon: Building2,
  },
  {
    label: "Orders",
    href: "/dashboard/orders",
    icon: ClipboardList,
  },
  {
    label: "Prescriptions",
    href: "/dashboard/prescriptions",
    icon: Package,
  },
  {
    label: "Users",
    href: "/dashboard/users",
    icon: Users,
  },
  {
    label: "Inventory",
    href: "/dashboard/inventory",
    icon: Boxes,
  },
  {
    label: "Notifications",
    href: "/dashboard/notifications",
    icon: Bell,
  },
];

export default function AdminSidebar({
  isCollapsed,
  isMobileOpen,
  onCloseMobile,
}: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-50 h-screen border-r border-gray-200 bg-white transition-all duration-300 lg:sticky lg:z-20",
        isCollapsed ? "lg:w-20" : "lg:w-72",
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        "w-72"
      )}
    >
      <div
        className={cn(
          "flex h-16 items-center border-b border-gray-200 px-4",
          isCollapsed ? "lg:justify-center" : "justify-between"
        )}
      >
        <Link
          href="/dashboard"
          onClick={onCloseMobile}
          className="flex items-center gap-2"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
            <Pill className="h-5 w-5 text-white" />
          </div>

          {!isCollapsed && (
            <span className="text-xl font-bold text-blue-600 lg:inline">
              MediCare
            </span>
          )}

          {isCollapsed && (
            <span className="hidden text-xl font-bold text-blue-600">
              MediCare
            </span>
          )}
        </Link>

        <button
          type="button"
          onClick={onCloseMobile}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 lg:hidden"
          aria-label="Close mobile sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="space-y-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              title={isCollapsed ? item.label : undefined}
              className={cn(
                "flex items-center rounded-lg py-3 text-sm font-medium transition",
                isCollapsed ? "lg:justify-center lg:px-0" : "gap-3 px-4",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-50 hover:text-blue-700"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />

              <span className={cn(isCollapsed ? "lg:hidden" : "block")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}