"use client";

import { authUtils } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, PanelLeftClose, PanelLeftOpen, UserCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { AuthResponse } from "@/types";

type AdminHeaderProps = {
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onOpenMobileSidebar: () => void;
};

export default function AdminHeader({
  isSidebarCollapsed,
  onToggleSidebar,
  onOpenMobileSidebar,
}: AdminHeaderProps) {
  const [user, setUser] = useState<AuthResponse | null>(null);

  useEffect(() => {
    setUser(authUtils.getUser());
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 lg:hidden"
          aria-label="Open mobile sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={onToggleSidebar}
          className="hidden h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 lg:inline-flex"
          aria-label="Toggle sidebar"
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </button>

        <div>
          <p className="text-sm font-medium text-gray-900">Admin Panel</p>
          <p className="hidden text-xs text-gray-500 sm:block">
            Manage MediCare pharmacy system
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-2 sm:flex">
          <UserCircle className="h-6 w-6 text-gray-400" />

          <div>
            <p className="text-sm font-semibold text-gray-900">
              {user?.name ?? "Admin"}
            </p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={authUtils.logout}
          className="gap-2"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}