"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { ApiResponse, PagedResponse } from "@/types";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  Calendar,
  Eye,
  Loader2,
  Mail,
  RefreshCcw,
  ToggleLeft,
  ToggleRight,
  UserCircle,
  X,
} from "lucide-react";
import { toast } from "sonner";

type BackendUser = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  bio?: string | null;
  role: "Customer" | "Admin" | string;
  isActive: boolean;
  profileImageUrl?: string | null;
  createdAt: string;
  lastLoginAt?: string | null;
  totalOrders?: number;
  totalSpent?: number;
};

type User = {
  id: number;
  name: string;
  email: string;
  phone: string;
  gender: string;
  dateOfBirth?: string | null;
  bio: string;
  role: string;
  joinDate: string;
  lastLoginAt?: string | null;
  totalOrders: number;
  totalSpent: number;
  status: "active" | "inactive";
  profileImageUrl?: string | null;
};

function extractItems<T>(data: T[] | PagedResponse<T>): T[] {
  return Array.isArray(data) ? data : data.items ?? [];
}

function normalizeUsers(
  data: BackendUser[] | PagedResponse<BackendUser>
): User[] {
  return extractItems(data).map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone ?? "N/A",
    gender: user.gender ?? "N/A",
    dateOfBirth: user.dateOfBirth ?? null,
    bio: user.bio ?? "N/A",
    role: user.role,
    joinDate: user.createdAt,
    lastLoginAt: user.lastLoginAt,
    totalOrders: user.totalOrders ?? 0,
    totalSpent: user.totalSpent ?? 0,
    status: user.isActive ? "active" : "inactive",
    profileImageUrl: user.profileImageUrl,
  }));
}

function formatOptionalDate(date?: string | null) {
  if (!date) return "N/A";

  try {
    return formatDate(date);
  } catch {
    return "N/A";
  }
}

const statusColors: Record<User["status"], string> = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-gray-100 text-gray-700",
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getUsers = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const response = await api.get<
        ApiResponse<BackendUser[] | PagedResponse<BackendUser>>
      >("/users", {
        params: {
          pageNumber: 1,
          pageSize: 100,
        },
      });

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
        const newStatus: User["status"] =
          user.status === "active" ? "inactive" : "active";

        setUsers((prev) =>
          prev.map((item) =>
            item.id === user.id
              ? {
                  ...item,
                  status: newStatus,
                }
              : item
          )
        );

        setSelectedUser((prev) =>
          prev && prev.id === user.id
            ? {
                ...prev,
                status: newStatus,
              }
            : prev
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
                  Gender
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

                  <td className="px-6 py-4 text-gray-700">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{user.email}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-gray-700">{user.phone}</td>

                  <td className="px-6 py-4 text-sm text-gray-700">
                    {user.gender}
                  </td>

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

                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <button
                        type="button"
                        onClick={() => setSelectedUser(user)}
                        className="text-blue-600 hover:text-blue-700"
                        title="View user details"
                      >
                        <Eye className="h-4 w-4" />
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-md border border-gray-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  User Details
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  View customer/admin account information.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[calc(90vh-140px)] overflow-y-auto px-6 py-5">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
                <div className="rounded-md border border-gray-200 bg-gray-50 p-5">
                  <div className="mb-4 flex justify-center">
                    <div className="flex h-24 w-24 items-center justify-center rounded-md bg-blue-100">
                      {selectedUser.profileImageUrl ? (
                        <img
                          src={selectedUser.profileImageUrl}
                          alt={selectedUser.name}
                          className="h-24 w-24 rounded-md object-cover"
                        />
                      ) : (
                        <UserCircle className="h-14 w-14 text-blue-600" />
                      )}
                    </div>
                  </div>

                  <div className="text-center">
                    <h3 className="text-lg font-bold text-gray-900">
                      {selectedUser.name}
                    </h3>
                    <p className="mt-1 break-all text-sm text-gray-500">
                      {selectedUser.email}
                    </p>

                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          selectedUser.role === "Admin"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {selectedUser.role}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[selectedUser.status]}`}
                      >
                        {selectedUser.status}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 rounded-md border border-gray-200 bg-white p-4">
                    <div className="flex items-start gap-2">
                      <Calendar className="mt-0.5 h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Date of Birth
                        </p>
                        <p className="mt-1 text-sm font-bold text-gray-900">
                          {formatOptionalDate(selectedUser.dateOfBirth)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <DetailRow label="User ID" value={selectedUser.id} />
                    <DetailRow label="Name" value={selectedUser.name} />
                    <DetailRow label="Email" value={selectedUser.email} />
                    <DetailRow
                      label="Phone"
                      value={selectedUser.phone || "N/A"}
                    />
                    <DetailRow label="Gender" value={selectedUser.gender} />
                    <DetailRow
                      label="Date of Birth"
                      value={formatOptionalDate(selectedUser.dateOfBirth)}
                    />
                    <DetailRow label="Role" value={selectedUser.role} />
                    <DetailRow
                      label="Joined"
                      value={formatDate(selectedUser.joinDate)}
                    />
                    <DetailRow
                      label="Last Login"
                      value={
                        selectedUser.lastLoginAt
                          ? formatDate(selectedUser.lastLoginAt)
                          : "N/A"
                      }
                    />
                    <DetailRow
                      label="Total Orders"
                      value={selectedUser.totalOrders}
                    />
                    <DetailRow
                      label="Total Spent"
                      value={selectedUser.totalSpent}
                    />
                    <DetailRow label="Status" value={selectedUser.status} />
                  </div>

                  <div className="rounded-md border border-gray-200 bg-gray-50 px-4 py-3">
                    <p className="text-sm text-gray-500">Bio</p>
                    <p className="mt-2 whitespace-pre-line text-sm font-medium leading-6 text-gray-900">
                      {selectedUser.bio || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-gray-200 px-6 py-4 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedUser(null)}
              >
                Close
              </Button>

              <Button
                type="button"
                disabled={updatingId === selectedUser.id}
                onClick={() => handleToggleStatus(selectedUser)}
                className={`text-white disabled:bg-gray-300 ${
                  selectedUser.status === "active"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {updatingId === selectedUser.id ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : selectedUser.status === "active" ? (
                  <ToggleRight className="mr-2 h-4 w-4" />
                ) : (
                  <ToggleLeft className="mr-2 h-4 w-4" />
                )}

                {selectedUser.status === "active"
                  ? "Deactivate User"
                  : "Activate User"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex min-h-[58px] items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-4 py-3">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="ml-4 break-all text-right text-sm font-semibold text-gray-900">
        {value}
      </span>
    </div>
  );
}