"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  Edit2,
  Eye,
  Loader2,
  Plus,
  RefreshCcw,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

type BackendProduct = {
  id: number;
  name: string;
  slug?: string;
  sku?: string | null;
  genericName?: string | null;
  brandName?: string | null;
  categoryName?: string | null;
  price: number;
  discountPrice?: number | null;
  stock?: number;
  stockQuantity?: number;
  requiresPrescription: boolean;
  isActive: boolean;
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
  return Array.isArray(data) ? data : data.items;
}

function normalizeProducts(
  data: BackendProduct[] | PagedResponse<BackendProduct>
): Product[] {
  return extractItems(data).map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku ?? "N/A",
    genericName: product.genericName ?? "N/A",
    brand: product.brandName ?? "No Brand",
    category: product.categoryName ?? "Uncategorized",
    price: product.price,
    discountPrice: product.discountPrice,
    stock: product.stockQuantity ?? product.stock ?? 0,
    requiresRx: product.requiresPrescription,
    status: product.isActive ? "active" : "inactive",
  }));
}

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getProducts = async () => {
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
    getProducts();
  }, []);

  const handleSearch = () => {
    getProducts();
  };

  const handleDeleteProduct = async (product: Product) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(product.id);

      const response = await api.delete<ApiResponse<null>>(
        `/products/${product.id}`
      );

      if (response.data.success) {
        setProducts((prev) => prev.filter((p) => p.id !== product.id));
        toast.success(`Product "${product.name}" deleted successfully`);
      } else {
        toast.error(response.data.message || "Failed to delete product.");
      }
    } catch (error) {
      console.error("Failed to delete product:", error);
      toast.error("Failed to delete product. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.genericName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading products...
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="mt-1 text-gray-600">
            Manage medicines, syrups, health products, stock, and prescription
            requirements.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={getProducts}
            className="gap-2"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>

          <Button
            asChild
            className="flex items-center space-x-2 bg-blue-600 text-white hover:bg-blue-700"
          >
            <Link href="/dashboard/products/create">
              <Plus className="h-4 w-4" />
              <span>Add Product</span>
            </Link>
          </Button>
        </div>
      </div>

      <div className="mb-6 flex gap-4 rounded-lg border border-gray-200 bg-white p-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

          <input
            type="text"
            placeholder="Search product, generic name, SKU, brand, category..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleSearch();
              }
            }}
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <Button
          type="button"
          onClick={handleSearch}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          Search
        </Button>
      </div>

      {errorMessage && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {errorMessage}
        </div>
      )}

      {filteredProducts.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center">
          <h3 className="text-lg font-semibold text-gray-900">
            No products found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Add your first medicine or try another search keyword.
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
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                  Type
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
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">
                        {product.name}
                      </p>
                      <p className="text-sm text-gray-600">{product.brand}</p>
                      <p className="text-xs text-gray-400">
                        Generic: {product.genericName}
                      </p>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-700">
                    {product.sku}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-700">
                    {product.category}
                  </td>

                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(product.discountPrice ?? product.price)}
                      </p>

                      {product.discountPrice && (
                        <p className="text-xs text-gray-400 line-through">
                          {formatCurrency(product.price)}
                        </p>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${
                        product.stock > 20
                          ? "bg-green-100 text-green-700"
                          : product.stock > 0
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {product.stock} units
                    </span>
                  </td>

                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${
                        product.requiresRx
                          ? "bg-red-100 text-red-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {product.requiresRx ? "Rx" : "OTC"}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${
                        product.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {product.status}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <Link
                        href={`/dashboard/products/${product.id}`}
                        className="text-blue-600 hover:text-blue-700"
                        title="View product"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>

                      <Link
                        href={`/dashboard/products/${product.id}/edit`}
                        className="text-orange-600 hover:text-orange-700"
                        title="Edit product"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Link>

                      <button
                        type="button"
                        disabled={deletingId === product.id}
                        onClick={() => handleDeleteProduct(product)}
                        className="text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                        title="Delete product"
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