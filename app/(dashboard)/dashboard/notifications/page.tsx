"use client";

import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { formatDateTime } from "@/lib/utils";
import { ApiResponse, PagedResponse } from "@/types";
import {
  AlertCircle,
  Bell,
  CheckCheck,
  Loader2,
  RefreshCcw,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type BackendNotification = {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  redirectUrl?: string | null;
  createdAt: string;
};

function extractNotifications(
  data: BackendNotification[] | PagedResponse<BackendNotification>,
): BackendNotification[] {
  return Array.isArray(data) ? data : (data.items ?? []);
}

function getTypeBadgeClass(type: string) {
  const normalized = type.toLowerCase();

  if (normalized.includes("order")) return "bg-blue-100 text-blue-700";
  if (normalized.includes("prescription"))
    return "bg-purple-100 text-purple-700";
  if (normalized.includes("payment")) return "bg-green-100 text-green-700";
  if (normalized.includes("stock")) return "bg-orange-100 text-orange-700";
  if (normalized.includes("user")) return "bg-indigo-100 text-indigo-700";

  return "bg-gray-100 text-gray-700";
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<BackendNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [markingId, setMarkingId] = useState<number | null>(null);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getNotifications = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const [notificationsResponse, unreadResponse] = await Promise.all([
        api.get<
          ApiResponse<
            BackendNotification[] | PagedResponse<BackendNotification>
          >
        >("/notifications", {
          params: {
            pageNumber: 1,
            pageSize: 50,
          },
        }),

        api.get<ApiResponse<number>>("/notifications/unread-count"),
      ]);

      if (
        notificationsResponse.data.success &&
        notificationsResponse.data.data
      ) {
        setNotifications(extractNotifications(notificationsResponse.data.data));
      } else {
        setNotifications([]);
        setErrorMessage(
          notificationsResponse.data.message || "Failed to load notifications.",
        );
      }

      if (unreadResponse.data.success) {
        setUnreadCount(unreadResponse.data.data ?? 0);
      } else {
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      setNotifications([]);
      setUnreadCount(0);
      setErrorMessage("Failed to load notifications. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getNotifications();
  }, []);

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      setMarkingId(notificationId);

      const response = await api.put<ApiResponse<null>>(
        `/notifications/${notificationId}/read`,
      );

      if (response.data.success) {
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === notificationId
              ? { ...notification, isRead: true }
              : notification,
          ),
        );

        setUnreadCount((prev) => Math.max(prev - 1, 0));
        toast.success("Notification marked as read");
      } else {
        toast.error(
          response.data.message || "Failed to mark notification as read.",
        );
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      toast.error("Failed to mark notification as read.");
    } finally {
      setMarkingId(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setIsMarkingAll(true);

      const response = await api.put<ApiResponse<null>>(
        "/notifications/read-all",
      );

      if (response.data.success) {
        setNotifications((prev) =>
          prev.map((notification) => ({
            ...notification,
            isRead: true,
          })),
        );

        setUnreadCount(0);
        toast.success("All notifications marked as read");
      } else {
        toast.error(response.data.message || "Failed to mark all as read.");
      }
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      toast.error("Failed to mark all notifications as read.");
    } finally {
      setIsMarkingAll(false);
    }
  };

  const readCount = notifications.filter(
    (notification) => notification.isRead,
  ).length;

  if (isLoading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading notifications...
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="mt-1 text-gray-600">
            View order, prescription, payment, stock, and account notifications.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={getNotifications}
            className="gap-2"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>

          <Button
            type="button"
            disabled={unreadCount === 0 || isMarkingAll}
            onClick={handleMarkAllAsRead}
            className="gap-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300"
          >
            {isMarkingAll ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCheck className="h-4 w-4" />
            )}
            Mark All Read
          </Button>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {errorMessage}
        </div>
      )}

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="mb-3 flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-3">
              <Bell className="h-6 w-6 text-blue-600" />
            </div>

            <div>
              <p className="text-sm text-gray-500">Total Notifications</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {notifications.length}
              </h3>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-orange-200 bg-orange-50 p-6">
          <p className="text-sm text-orange-700">Unread Notifications</p>
          <h3 className="mt-2 text-3xl font-bold text-orange-900">
            {unreadCount}
          </h3>
        </div>

        <div className="rounded-lg border border-green-200 bg-green-50 p-6">
          <p className="text-sm text-green-700">Read Notifications</p>
          <h3 className="mt-2 text-3xl font-bold text-green-900">
            {readCount}
          </h3>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center">
          <Bell className="mx-auto mb-3 h-10 w-10 text-gray-400" />

          <h3 className="text-lg font-semibold text-gray-900">
            No notifications found
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Notifications will appear here when orders, prescriptions, stock
            events, or user activities happen.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <div className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-5 transition-colors hover:bg-gray-50 ${
                  notification.isRead ? "bg-white" : "bg-blue-50/50"
                }`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-gray-900">
                        {notification.title}
                      </h3>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${getTypeBadgeClass(
                          notification.type,
                        )}`}
                      >
                        {notification.type}
                      </span>

                      {!notification.isRead && (
                        <span className="rounded-full bg-blue-600 px-2.5 py-1 text-xs font-medium text-white">
                          New
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-600">
                      {notification.message}
                    </p>

                    <p className="mt-2 text-xs text-gray-400">
                      {formatDateTime(notification.createdAt)}
                    </p>

                    {notification.redirectUrl && (
                      <Link
                        href={notification.redirectUrl}
                        className="mt-3 inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        Open related page
                      </Link>
                    )}
                  </div>

                  {!notification.isRead && (
                    <Button
                      type="button"
                      variant="outline"
                      disabled={markingId === notification.id}
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="shrink-0"
                    >
                      {markingId === notification.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCheck className="mr-2 h-4 w-4" />
                      )}
                      Mark Read
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
