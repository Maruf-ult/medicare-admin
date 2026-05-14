"use client";

import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { formatCurrency, getProductSku } from "@/lib/utils";
import { ApiResponse, PagedResponse } from "@/types";
import {
  AlertCircle,
  Edit2,
  Eye,
  Loader2,
  Pill,
  Plus,
  RefreshCcw,
  Search,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type BackendProduct = {
  id: number;
  name: string;
  slug?: string;
  sku?: string | null;
  SKU?: string | null;
  genericName?: string | null;
  brand?: string | null;
  category?: string | null;
  brandName?: string | null;
  categoryName?: string | null;
  price: number;
  discountPrice?: number | null;
  stock?: number;
  stockQuantity?: number;
  requiresPrescription: boolean;
  isActive: boolean;
};

type Product = {
  id: number;
  name: string;
  slug?: string;
  sku: string;
  genericName: string;
  brand: string;
  category: string;
  price: number;
  discountPrice?: number | null;
  stock: number;
  requiresRx: boolean;
  status: "active" | "inactive";
};

function extractItems<T>(data: T[] | PagedResponse<T>): T[] {
  return Array.isArray(data) ? data : data.items ?? [];
}

function normalizeProducts(
  data: BackendProduct[] | PagedResponse<BackendProduct>,
): Product[] {
  return extractItems(data).map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: getProductSku(product),
    genericName: product.genericName ?? "N/A",
    brand: product.brand ?? product.brandName ?? "No Brand",
    category: product.category ?? product.categoryName ?? "Uncategorized",
    price: product.price,
    discountPrice: product.discountPrice,
    stock: product.stockQuantity ?? product.stock ?? 0,
    requiresRx: product.requiresPrescription,
    status: product.isActive ? "active" : "inactive",
  }));
}

export default function CatalogPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const response = await api.get<
        ApiResponse<BackendProduct[] | PagedResponse<BackendProduct>>
      >("/products", {
        params: {
          search: searchTerm || undefined,
          pageNumber: 1,
          pageSize: 100,
        },
      });

      if (response.data.success && response.data.data) {
        setProducts(normalizeProducts(response.data.data));
      } else {
        setProducts([]);
        setErrorMessage(response.data.message || "Failed to load products.");
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setProducts([]);
      setErrorMessage("Failed to load products. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDeleteProduct = async (product: Product) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?`,
    );
    if (!confirmed) return;

    try {
      setDeletingId(product.id);
      const response = await api.delete<ApiResponse<null>>(
        `/products/${product.id}`,
      );

      if (response.data.success) {
        toast.success("Product deleted successfully");
        loadProducts();
      } else {
        toast.error(response.data.message || "Failed to delete product");
      }
    } catch (error) {
      console.error("Failed to delete product:", error);
      toast.error("Failed to delete product");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Catalog</h1>
          <p className="mt-1 text-gray-600">
            Browse and manage products. Category and brand are stored as text on
            each product.
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {errorMessage}
        </div>
      )}

      <CatalogProductsTable
        products={products}
        isLoading={isLoading}
        deletingId={deletingId}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSearch={loadProducts}
        onDelete={handleDeleteProduct}
        onRefresh={loadProducts}
      />
    </div>
  );
}

function CatalogProductsTable({
  products,
  isLoading,
  deletingId,
  searchTerm,
  onSearchChange,
  onSearch,
  onDelete,
  onRefresh,
}: {
  products: Product[];
  isLoading: boolean;
  deletingId: number | null;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onSearch: () => void;
  onDelete: (product: Product) => void;
  onRefresh: () => void;
}) {
  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-2">
          <input
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
            placeholder="Search products..."
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={onSearch}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-white hover:bg-blue-700"
          >
            <Search className="h-4 w-4" />
            Search
          </button>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onRefresh}
            className="gap-2"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
          <Button
            asChild
            className="gap-2 bg-blue-600 text-white hover:bg-blue-700"
          >
            <Link href="/dashboard/products/create">
              <Plus className="h-4 w-4" />
              Create
            </Link>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex min-h-75 items-center justify-center rounded-lg border border-gray-200 bg-white">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading products...
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center">
          <Pill className="mx-auto mb-2 h-10 w-10 text-gray-300" />
          <p className="font-semibold text-gray-900">No products found</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Brand
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {product.name}
                    </div>
                    <div className="text-xs text-gray-500">{product.sku}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {product.brand}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {product.category}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(product.price)}
                    </div>
                    {product.discountPrice && (
                      <div className="text-xs text-red-600">
                        {formatCurrency(product.discountPrice)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {product.stock} units
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        product.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/dashboard/products/${product.id}`}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/dashboard/products/${product.id}/edit`}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => onDelete(product)}
                        disabled={deletingId === product.id}
                        className="text-gray-500 hover:text-red-600 disabled:opacity-50"
                      >
                        {deletingId === product.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
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
    </div>
  );
}
