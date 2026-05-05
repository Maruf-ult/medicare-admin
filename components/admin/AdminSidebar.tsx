"use client";

import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Bell,
  Boxes,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Pill,
  ShieldCheck,
  ShoppingCart,
  Tag,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Products", icon: Package, href: "/dashboard/products" },
  { label: "Categories", icon: FolderOpen, href: "/dashboard/categories" },
  { label: "Brands", icon: Tag, href: "/dashboard/brands" },
  { label: "Inventory", icon: Boxes, href: "/dashboard/inventory" },
  { label: "Orders", icon: ShoppingCart, href: "/dashboard/orders" },
  { label: "Prescriptions", icon: Pill, href: "/dashboard/prescriptions" },
  { label: "Users", icon: Users, href: "/dashboard/users" },
  { label: "Notifications", icon: Bell, href: "/dashboard/notifications" },
  { label: "Analytics", icon: BarChart3, href: "/dashboard/analytics" },
];

export default function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 text-gray-900 hover:bg-gray-100 p-2 rounded-lg"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-gray-900 text-white transition-transform md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } z-40`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <Link href="/dashboard" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-bold text-lg">MediCare+</p>
              <p className="text-xs text-gray-400">Admin Panel</p>
            </div>
          </Link>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <button
                  onClick={() => setIsOpen(false)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    active
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-800"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-800">
          <Button className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center space-x-2">
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </Button>
        </div>
      </aside>

      {/* Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/50 md:hidden z-30"
        />
      )}
    </>
  );
}
