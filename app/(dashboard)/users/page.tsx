"use client";

import { Edit2, Mail, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  totalOrders: number;
  status: "active" | "inactive" | "blocked";
}

const mockUsers: User[] = [
  {
    id: 1,
    name: "Ahmed Hassan",
    email: "ahmed@email.com",
    phone: "01700000001",
    joinDate: "2024-01-15",
    totalOrders: 12,
    status: "active",
  },
  {
    id: 2,
    name: "Fatima Khan",
    email: "fatima@email.com",
    phone: "01700000002",
    joinDate: "2024-02-20",
    totalOrders: 8,
    status: "active",
  },
  {
    id: 3,
    name: "Saiful Islam",
    email: "saiful@email.com",
    phone: "01700000003",
    joinDate: "2024-03-10",
    totalOrders: 5,
    status: "active",
  },
  {
    id: 4,
    name: "Maria Ahmed",
    email: "maria@email.com",
    phone: "01700000004",
    joinDate: "2024-04-05",
    totalOrders: 3,
    status: "inactive",
  },
];

export default function UsersPage() {
  const [users, setUsers] = useState(mockUsers);

  const handleEditUser = (userId: number, userName: string) => {
    toast.info(`Opening profile for ${userName}...`);
  };

  const handleDeleteUser = (userId: number, userName: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    toast.success(`User "${userName}" deleted successfully`);
  };

  const statusColors = {
    active: "bg-green-100 text-green-700",
    inactive: "bg-gray-100 text-gray-700",
    blocked: "bg-red-100 text-red-700",
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Users</h1>
        <p className="text-gray-600 mt-1">Manage customer accounts</p>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
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
                <td className="px-6 py-4 text-gray-700 flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>{user.email}</span>
                </td>
                <td className="px-6 py-4 text-gray-700">{user.phone}</td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {user.joinDate}
                </td>
                <td className="px-6 py-4 font-semibold text-gray-900">
                  {user.totalOrders}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[user.status]}`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 flex items-center space-x-2">
                  <button
                    onClick={() => handleEditUser(user.id, user.name)}
                    className="text-orange-600 hover:text-orange-700"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id, user.name)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
