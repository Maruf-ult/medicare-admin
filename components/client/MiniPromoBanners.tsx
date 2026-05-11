import Link from "next/link";

const banners = [
  {
    title: "Medicines up to 20% off",
    description: "OTC & prescription medicines at trusted prices",
    icon: "💊",
    href: "/shop",
    linkText: "Shop Now",
  },
  {
    title: "Free Rx review",
    description: "Upload prescription and get pharmacist review",
    icon: "📋",
    href: "/upload-prescription",
    linkText: "Upload Prescription",
  },
  {
    title: "Baby care essentials",
    description: "Safe products delivered to your door",
    icon: "🍼",
    href: "/shop",
    linkText: "Explore",
  },
];

export default function MiniPromoBanners() {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
      <div className="grid gap-4 md:grid-cols-3">
        {banners.map((banner) => (
          <Link
            key={banner.title}
            href={banner.href}
            className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div>
              <h3 className="font-black text-gray-900">{banner.title}</h3>
              <p className="mt-1 text-sm leading-6 text-gray-500">
                {banner.description}
              </p>
              <p className="mt-2 text-sm font-bold text-blue-600">
                {banner.linkText} →
              </p>
            </div>

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-3xl">
              {banner.icon}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}