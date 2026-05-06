"use client";

import { Button } from "@/components/ui/button";
import { Edit2, Eye, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

interface Product {
  id: number;
  name: string;
  brand: string;
  category: string;
  price: number;
  stock: number;
  requiresRx: boolean;
  status: "active" | "inactive";
}

const mockProducts: Product[] = [
  {
    id: 1,
    name: "Amoxicillin 500mg",
    brand: "Square",
    category: "Antibiotics",
    price: 120,
    stock: 45,
    requiresRx: true,
    status: "active",
  },
  {
    id: 2,
    name: "Paracetamol 500mg",
    brand: "Beximco",
    category: "Painkillers",
    price: 45,
    stock: 120,
    requiresRx: false,
    status: "active",
  },
  {
    id: 3,
    name: "Vitamin D3 1000IU",
    brand: "Renata",
    category: "Vitamins",
    price: 200,
    stock: 89,
    requiresRx: false,
    status: "active",
  },
  {
    id: 4,
    name: "Metformin 500mg",
    brand: "ACI",
    category: "Diabetes",
    price: 100,
    stock: 12,
    requiresRx: true,
    status: "active",
  },
  {
    id: 5,
    name: "Ibuprofen 400mg",
    brand: "Eskayef",
    category: "Painkillers",
    price: 75,
    stock: 0,
    requiresRx: false,
    status: "inactive",
  },
];

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState(mockProducts);

  const handleDeleteProduct = (productId: number, productName: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    toast.success(`Product "${productName}" deleted successfully`);
  };

  const handleEditProduct = (productId: number) => {
    toast.info(`Opening product ${productId} for editing...`);
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">Manage your medicine catalog</p>
        </div>
        <Link href="/dashboard/products/create">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Button>
        </Link>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                Product
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
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.brand}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {product.category}
                </td>
                <td className="px-6 py-4 font-semibold text-gray-900">
                  ৳{product.price}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
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
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
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
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      product.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {product.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <Link href={`/dashboard/products/${product.id}`}>
                      <button
                        onClick={() =>
                          toast.info(`Viewing product ${product.id}`)
                        }
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </Link>
                    <Link href={`/dashboard/products/${product.id}/edit`}>
                      <button
                        onClick={() => handleEditProduct(product.id)}
                        className="text-orange-600 hover:text-orange-700"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </Link>
                    <button
                      onClick={() =>
                        handleDeleteProduct(product.id, product.name)
                      }
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
