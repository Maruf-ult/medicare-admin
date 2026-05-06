"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { formatDate } from "@/lib/utils";
import {
  AlertCircle,
  CalendarClock,
  Loader2,
  RefreshCcw,
  TrendingDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type BackendProduct = {
  id: number;
  name: string;
  sku?: string | null;
  genericName?: string | null;
  brandName?: string | null;
  categoryName?: string | null;
  stock?: number;
  stockQuantity?: number;
  lowStockThreshold?: number;
  expiryDate?: string | null;
  nearestExpiryDate?: string | null;
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

type InventoryItem = {
  id: number;
  product: string;
  sku: string;
  genericName: string;
  brandName: string;
  categoryName: string;
  quantity: number;
  lowStockThreshold: number;
  expiryDate: string | null;
  status: "low" | "expiring";
};

function extractItems<T>(data: T[] | PagedResponse<T>): T[] {
  return Array.isArray(data) ? data : data.items;
}

function normalizeLowStockProducts(
  data: BackendProduct[] | PagedResponse<BackendProduct>
): InventoryItem[] {
  return extractItems(data).map((product) => {
    const quantity = product.stockQuantity ?? product.stock ?? 0;

    return {
      id: product.id,
      product: product.name,
      sku: product.sku ?? "N/A",
      genericName: product.genericName ?? "N/A",
      brandName: product.brandName ?? "No Brand",
      categoryName: product.categoryName ?? "Uncategorized",
      quantity,
      lowStockThreshold: product.lowStockThreshold ?? 10,
      expiryDate: product.nearestExpiryDate ?? product.expiryDate ?? null,
      status: "low",
    };
  });
}

function normalizeExpiringProducts(
  data: BackendProduct[] | PagedResponse<BackendProduct>
): InventoryItem[] {
  return extractItems(data).map((product) => {
    const quantity = product.stockQuantity ?? product.stock ?? 0;

    return {
      id: product.id,
      product: product.name,
      sku: product.sku ?? "N/A",
      genericName: product.genericName ?? "N/A",
      brandName: product.brandName ?? "No Brand",
      categoryName: product.categoryName ?? "Uncategorized",
      quantity,
      lowStockThreshold: product.lowStockThreshold ?? 10,
      expiryDate: product.nearestExpiryDate ?? product.expiryDate ?? null,
      status: "expiring",
    };
  });
}

function mergeInventory(
  lowStockItems: InventoryItem[],
  expiringItems: InventoryItem[]
): InventoryItem[] {
  const merged = new Map<number, InventoryItem>();

  lowStockItems.forEach((item) => {
    merged.set(item.id, item);
  });

  expiringItems.forEach((item) => {
    const existing = merged.get(item.id);

    if (existing) {
      merged.set(item.id, {
        ...existing,
        expiryDate: item.expiryDate ?? existing.expiryDate,
      });
    } else {
      merged.set(item.id, item);
    }
  });

  return Array.from(merged.values());
}

function getStatusClass(status: InventoryItem["status"]) {
  if (status === "low") return "bg-yellow-100 text-yellow-700";
  return "bg-red-100 text-red-700";
}

function getStatusLabel(status: InventoryItem["status"]) {
  if (status === "low") return "⚠ Low Stock";
  return "⏳ Expiring Soon";
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [lowStockItems, setLowStockItems] = useState(0);
  const [expiringItems, setExpiringItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getInventory = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const [lowStockResponse, expiringResponse] = await Promise.all([
        api.get<ApiResponse<BackendProduct[] | PagedResponse<BackendProduct>>>(
          "/products/low-stock"
        ),
        api.get<ApiResponse<BackendProduct[] | PagedResponse<BackendProduct>>>(
          "/products/expiring/30"
        ),
      ]);

      const lowStock =
        lowStockResponse.data.success && lowStockResponse.data.data
          ? normalizeLowStockProducts(lowStockResponse.data.data)
          : [];

      const expiring =
        expiringResponse.data.success && expiringResponse.data.data
          ? normalizeExpiringProducts(expiringResponse.data.data)
          : [];

      setLowStockItems(lowStock.length);
      setExpiringItems(expiring.length);
      setInventory(mergeInventory(lowStock, expiring));
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
      setInventory([]);
      setLowStockItems(0);
      setExpiringItems(0);
      setErrorMessage("Failed to load inventory. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getInventory();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading inventory...
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Inventory Management
          </h1>
          <p className="mt-1 text-gray-600">
            Track low-stock products and medicines expiring within 30 days.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={getInventory}
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

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="flex items-start space-x-4 rounded-lg border border-yellow-200 bg-yellow-50 p-6">
          <div className="rounded-lg bg-yellow-100 p-3">
            <TrendingDown className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <h3 className="font-semibold text-yellow-900">
              {lowStockItems} Low Stock Items
            </h3>
            <p className="mt-1 text-sm text-yellow-700">
              Products below the stock threshold.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-4 rounded-lg border border-red-200 bg-red-50 p-6">
          <div className="rounded-lg bg-red-100 p-3">
            <CalendarClock className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-red-900">
              {expiringItems} Expiring Soon
            </h3>
            <p className="mt-1 text-sm text-red-700">
              Products expiring within 30 days.
            </p>
          </div>
        </div>
      </div>

      {inventory.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center">
          <h3 className="text-lg font-semibold text-gray-900">
            No inventory alerts found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            No low-stock or expiring products were returned from the backend.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                  Brand
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                  Expiry Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {inventory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">
                      {item.product}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.genericName}
                    </p>
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-700">
                    {item.sku}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-700">
                    {item.brandName}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-700">
                    {item.categoryName}
                  </td>

                  <td className="px-6 py-4 font-semibold text-gray-900">
                    {item.quantity} units
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-700">
                    {item.expiryDate ? formatDate(item.expiryDate) : "N/A"}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                        item.status
                      )}`}
                    >
                      {getStatusLabel(item.status)}
                    </span>
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