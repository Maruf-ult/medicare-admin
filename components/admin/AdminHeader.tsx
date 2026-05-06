"use client";

import { authUtils } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { LogOut, UserCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { AuthResponse } from "@/types";

export default function AdminHeader() {
  const [user, setUser] = useState<AuthResponse | null>(null);

  useEffect(() => {
    setUser(authUtils.getUser());
  }, []);

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm text-gray-500">Admin Panel</p>
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
          Logout
        </Button>
      </div>
    </header>
  );
}