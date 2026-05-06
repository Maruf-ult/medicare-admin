"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  Edit2,
  Loader2,
  Mail,
  RefreshCcw,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { toast } from "sonner";

type BackendUser = {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: "Customer" | "Admin" | string;
  isActive: boolean;
  profileImageUrl?: string | null;
  createdAt: string;
  lastLoginAt?: string | null;
  totalOrders?: number;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
};

type PagedResponse<T> = {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

type User = {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  joinDate: string;
  totalOrders: number;
  status: "active" | "inactive";
};

function extractItems<T>(data: T[] | PagedResponse<T>): T[] {
  return Array.isArray(data) ? data : data.items;
}

function normalizeUsers(data: BackendUser[] | PagedResponse<BackendUser>): User[] {
  return extractItems(data).map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    joinDate: user.createdAt,
    totalOrders: user.totalOrders ?? 0,
    status: user.isActive ? "active" : "inactive",
  }));
}

const statusColors: Record<User["status"], string> = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-gray-100 text-gray-700",
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getUsers = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const response = await api.get<ApiResponse<BackendUser[] | PagedResponse<BackendUser>>>(
        "/users",
        {
          params: {
            pageNumber: 1,
            pageSize: 100,
          },
        }
      );

      if (response.data.success && response.data.data) {
        setUsers(normalizeUsers(response.data.data));
      } else {
        setUsers([]);
        setErrorMessage(response.data.message || "Failed to load users.");
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setUsers([]);
      setErrorMessage("Failed to load users. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  const handleToggleStatus = async (user: User) => {
    const action = user.status === "active" ? "deactivate" : "activate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} "${user.name}"?`
    );

    if (!confirmed) return;

    try {
      setUpdatingId(user.id);

      const response = await api.put<ApiResponse<null>>(
        `/users/${user.id}/toggle-status`
      );

      if (response.data.success) {
        setUsers((prev) =>
          prev.map((item) =>
            item.id === user.id
              ? {
                  ...item,
                  status: item.status === "active" ? "inactive" : "active",
                }
              : item
          )
        );

        toast.success(`User "${user.name}" status updated successfully`);
      } else {
        toast.error(response.data.message || "Failed to update user status.");
      }
    } catch (error) {
      console.error("Failed to update user status:", error);
      toast.error("Failed to update user status. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading users...
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="mt-1 text-gray-600">
            Manage customer and admin accounts.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={getUsers}
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

      {users.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center">
          <h3 className="text-lg font-semibold text-gray-900">
            No users found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Registered users will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                  Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {user.name}
                  </td>

                  <td className="flex items-center space-x-2 px-6 py-4 text-gray-700">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{user.email}</span>
                  </td>

                  <td className="px-6 py-4 text-gray-700">{user.phone}</td>

                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        user.role === "Admin"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-700">
                    {formatDate(user.joinDate)}
                  </td>

                  <td className="px-6 py-4 font-semibold text-gray-900">
                    {user.totalOrders}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[user.status]}`}
                    >
                      {user.status}
                    </span>
                  </td>

                  <td className="flex items-center space-x-3 px-6 py-4">
                    <button
                      type="button"
                      onClick={() =>
                        toast.info(`Opening profile for ${user.name}...`)
                      }
                      className="text-orange-600 hover:text-orange-700"
                      title="View/Edit user"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      disabled={updatingId === user.id}
                      onClick={() => handleToggleStatus(user)}
                      className={`hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-60 ${
                        user.status === "active"
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                      title={
                        user.status === "active"
                          ? "Deactivate user"
                          : "Activate user"
                      }
                    >
                      {updatingId === user.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : user.status === "active" ? (
                        <ToggleRight className="h-5 w-5" />
                      ) : (
                        <ToggleLeft className="h-5 w-5" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}