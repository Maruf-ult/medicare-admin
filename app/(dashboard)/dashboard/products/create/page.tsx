"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { ApiResponse, PagedResponse } from "@/types";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  ArrowLeft,
  Loader2,
  PackagePlus,
  Save,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

type Category = {
  id: number;
  name: string;
};

type Brand = {
  id: number;
  name: string;
};

type ProductRequest = {
  name: string;
  description?: string;
  shortDescription?: string;
  categoryId: number;
  brandId: number;
  price: number;
  discountPrice?: number | null;
  stock: number;
  lowStockThreshold: number;
  requiresPrescription: boolean;
  dosageForm?: string;
  strength?: string;
  packSize?: string;
  genericName?: string;
  manufacturer?: string;
  activeIngredient?: string;
  indications?: string;
  sideEffects?: string;
  warnings?: string;
  contraindications?: string;
  storageInfo?: string;
  pregnancyWarning?: string;
  childSafetyInfo?: string;
  isActive: boolean;
  isFeatured: boolean;
};

function extractItems<T>(data: T[] | PagedResponse<T>): T[] {
  return Array.isArray(data) ? data : data.items ?? [];
}

const initialForm: ProductRequest = {
  name: "",
  description: "",
  shortDescription: "",
  categoryId: 0,
  brandId: 0,
  price: 0,
  discountPrice: null,
  stock: 0,
  lowStockThreshold: 10,
  requiresPrescription: false,
  dosageForm: "",
  strength: "",
  packSize: "",
  genericName: "",
  manufacturer: "",
  activeIngredient: "",
  indications: "",
  sideEffects: "",
  warnings: "",
  contraindications: "",
  storageInfo: "",
  pregnancyWarning: "",
  childSafetyInfo: "",
  isActive: true,
  isFeatured: false,
};

export default function CreateProductPage() {
  const router = useRouter();

  const [form, setForm] = useState<ProductRequest>(initialForm);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getOptions = async () => {
    try {
      setIsLoadingOptions(true);
      setErrorMessage(null);

      const [categoryResponse, brandResponse] = await Promise.all([
        api.get<ApiResponse<Category[] | PagedResponse<Category>>>(
          "/categories",
          {
            params: {
              pageNumber: 1,
              pageSize: 100,
            },
          }
        ),
        api.get<ApiResponse<Brand[] | PagedResponse<Brand>>>("/brands", {
          params: {
            pageNumber: 1,
            pageSize: 100,
          },
        }),
      ]);

      if (categoryResponse.data.success && categoryResponse.data.data) {
        setCategories(extractItems(categoryResponse.data.data));
      }

      if (brandResponse.data.success && brandResponse.data.data) {
        setBrands(extractItems(brandResponse.data.data));
      }
    } catch (error) {
      console.error("Failed to load categories/brands:", error);
      setErrorMessage("Failed to load categories and brands.");
    } finally {
      setIsLoadingOptions(false);
    }
  };

  useEffect(() => {
    getOptions();
  }, []);

  const updateField = <K extends keyof ProductRequest>(
    key: K,
    value: ProductRequest[K]
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      toast.error("Product name is required");
      return false;
    }

    if (!form.categoryId) {
      toast.error("Please select a category");
      return false;
    }

    if (!form.brandId) {
      toast.error("Please select a brand");
      return false;
    }

    if (form.price < 0) {
      toast.error("Price cannot be negative");
      return false;
    }

    if (form.stock < 0) {
      toast.error("Stock cannot be negative");
      return false;
    }

    if (
      form.discountPrice !== null &&
      form.discountPrice !== undefined &&
      form.discountPrice > form.price
    ) {
      toast.error("Discount price cannot be greater than regular price");
      return false;
    }

    return true;
  };

  const cleanPayload = (): ProductRequest => {
    return {
      ...form,
      name: form.name.trim(),
      description: form.description?.trim() || undefined,
      shortDescription: form.shortDescription?.trim() || undefined,
      discountPrice:
        form.discountPrice === null || Number.isNaN(form.discountPrice)
          ? null
          : form.discountPrice,
      dosageForm: form.dosageForm?.trim() || undefined,
      strength: form.strength?.trim() || undefined,
      packSize: form.packSize?.trim() || undefined,
      genericName: form.genericName?.trim() || undefined,
      manufacturer: form.manufacturer?.trim() || undefined,
      activeIngredient: form.activeIngredient?.trim() || undefined,
      indications: form.indications?.trim() || undefined,
      sideEffects: form.sideEffects?.trim() || undefined,
      warnings: form.warnings?.trim() || undefined,
      contraindications: form.contraindications?.trim() || undefined,
      storageInfo: form.storageInfo?.trim() || undefined,
      pregnancyWarning: form.pregnancyWarning?.trim() || undefined,
      childSafetyInfo: form.childSafetyInfo?.trim() || undefined,
    };
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const response = await api.post<ApiResponse<unknown>>(
        "/products",
        cleanPayload()
      );

      if (response.data.success) {
        toast.success("Product created successfully");
        router.push("/dashboard/products");
      } else {
        toast.error(response.data.message || "Failed to create product");
      }
    } catch (error) {
      console.error("Failed to create product:", error);
      setErrorMessage("Failed to create product. Please check your input.");
      toast.error("Failed to create product");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingOptions) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading form options...
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Link
              href="/dashboard/products"
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Products
            </Link>
          </div>

          <h1 className="text-3xl font-bold text-gray-900">Add Product</h1>
          <p className="mt-1 text-gray-600">
            Create a new medicine or healthcare product.
          </p>
        </div>

        <div className="rounded-2xl bg-blue-50 p-4">
          <PackagePlus className="h-7 w-7 text-blue-600" />
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-bold text-gray-900">
            Basic Information
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Product Name *
              </label>
              <input
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="Napa Extend 665mg"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Generic Name
              </label>
              <input
                value={form.genericName}
                onChange={(event) =>
                  updateField("genericName", event.target.value)
                }
                placeholder="Paracetamol"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Category *
              </label>
              <select
                value={form.categoryId}
                onChange={(event) =>
                  updateField("categoryId", Number(event.target.value))
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={0}>Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Brand *
              </label>
              <select
                value={form.brandId}
                onChange={(event) =>
                  updateField("brandId", Number(event.target.value))
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={0}>Select brand</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Short Description
              </label>
              <input
                value={form.shortDescription}
                onChange={(event) =>
                  updateField("shortDescription", event.target.value)
                }
                placeholder="Short summary shown in product cards"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                rows={4}
                placeholder="Full product description"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-bold text-gray-900">
            Price & Stock
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Price *
              </label>
              <input
                type="number"
                value={form.price}
                onChange={(event) =>
                  updateField("price", Number(event.target.value))
                }
                min={0}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Discount Price
              </label>
              <input
                type="number"
                value={form.discountPrice ?? ""}
                onChange={(event) =>
                  updateField(
                    "discountPrice",
                    event.target.value === "" ? null : Number(event.target.value)
                  )
                }
                min={0}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Stock *
              </label>
              <input
                type="number"
                value={form.stock}
                onChange={(event) =>
                  updateField("stock", Number(event.target.value))
                }
                min={0}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Low Stock Threshold
              </label>
              <input
                type="number"
                value={form.lowStockThreshold}
                onChange={(event) =>
                  updateField("lowStockThreshold", Number(event.target.value))
                }
                min={0}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <label className="flex items-center gap-3 rounded-lg border border-gray-200 p-4">
              <input
                type="checkbox"
                checked={form.requiresPrescription}
                onChange={(event) =>
                  updateField("requiresPrescription", event.target.checked)
                }
                className="h-4 w-4 rounded border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">
                Requires Prescription
              </span>
            </label>

            <label className="flex items-center gap-3 rounded-lg border border-gray-200 p-4">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(event) =>
                  updateField("isFeatured", event.target.checked)
                }
                className="h-4 w-4 rounded border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">
                Featured Product
              </span>
            </label>

            <label className="flex items-center gap-3 rounded-lg border border-gray-200 p-4">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) =>
                  updateField("isActive", event.target.checked)
                }
                className="h-4 w-4 rounded border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">
                Active Product
              </span>
            </label>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-bold text-gray-900">
            Medicine Details
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Dosage Form
              </label>
              <input
                value={form.dosageForm}
                onChange={(event) =>
                  updateField("dosageForm", event.target.value)
                }
                placeholder="Tablet, Syrup, Capsule"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Strength
              </label>
              <input
                value={form.strength}
                onChange={(event) => updateField("strength", event.target.value)}
                placeholder="500mg"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Pack Size
              </label>
              <input
                value={form.packSize}
                onChange={(event) => updateField("packSize", event.target.value)}
                placeholder="10 tablets"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Manufacturer
              </label>
              <input
                value={form.manufacturer}
                onChange={(event) =>
                  updateField("manufacturer", event.target.value)
                }
                placeholder="Square Pharmaceuticals"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Active Ingredient
              </label>
              <input
                value={form.activeIngredient}
                onChange={(event) =>
                  updateField("activeIngredient", event.target.value)
                }
                placeholder="Paracetamol"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-bold text-gray-900">
            Medical Information
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <TextAreaField
              label="Indications"
              value={form.indications ?? ""}
              onChange={(value) => updateField("indications", value)}
            />

            <TextAreaField
              label="Side Effects"
              value={form.sideEffects ?? ""}
              onChange={(value) => updateField("sideEffects", value)}
            />

            <TextAreaField
              label="Warnings"
              value={form.warnings ?? ""}
              onChange={(value) => updateField("warnings", value)}
            />

            <TextAreaField
              label="Contraindications"
              value={form.contraindications ?? ""}
              onChange={(value) => updateField("contraindications", value)}
            />

            <TextAreaField
              label="Storage Info"
              value={form.storageInfo ?? ""}
              onChange={(value) => updateField("storageInfo", value)}
            />

            <TextAreaField
              label="Pregnancy Warning"
              value={form.pregnancyWarning ?? ""}
              onChange={(value) => updateField("pregnancyWarning", value)}
            />

            <div className="md:col-span-2">
              <TextAreaField
                label="Child Safety Info"
                value={form.childSafetyInfo ?? ""}
                onChange={(value) => updateField("childSafetyInfo", value)}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" asChild>
            <Link href="/dashboard/products">Cancel</Link>
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Create Product
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}