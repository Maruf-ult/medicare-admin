import Link from "next/link";
import ProductCard, { ClientProduct } from "./ProductCard";

type ProductGridProps = {
  title: string;
  products: ClientProduct[];
  viewAllHref?: string;
};

export default function ProductGrid({
  title,
  products,
  viewAllHref = "/shop",
}: ProductGridProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-black text-gray-900">{title}</h2>

        <Link
          href={viewAllHref}
          className="text-sm font-bold text-blue-600 hover:underline"
        >
          View all →
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <p className="font-semibold text-gray-900">No products found</p>
          <p className="mt-1 text-sm text-gray-500">
            Products will appear here after they are added by admin.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}