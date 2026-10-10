import Link from "next/link";

export default function ClientFooter() {
  return (
    <footer className="mt-12 bg-gray-900 px-4 py-12 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 border-b border-white/10 pb-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="mb-3 text-2xl font-black">
              Medi<span className="text-blue-300">Care+</span>
            </div>

            <p className="max-w-sm text-sm leading-7 text-white/50">
              Bangladesh&apos;s trusted online pharmacy. Genuine medicines,
              prescription upload support, and fast doorstep delivery.
            </p>
          </div>

          <FooterColumn
            title="Shop"
            links={[
              { label: "All Products", href: "/shop" },
              { label: "Featured Products", href: "/shop?featured=true" },
              { label: "Prescription Medicines", href: "/shop?rx=true" },
              { label: "Low Stock Deals", href: "/shop" },
            ]}
          />

          <FooterColumn
            title="Services"
            links={[
              { label: "Upload Prescription", href: "/upload-prescription" },
              { label: "My Orders", href: "/my-orders" },
              { label: "My Prescriptions", href: "/my-prescriptions" },
              { label: "Wishlist", href: "/wishlist" },
            ]}
          />

          <FooterColumn
            title="Account"
            links={[
              { label: "Profile", href: "/profile" },
              { label: "Cart", href: "/cart" },
              { label: "Change Password", href: "/change-password" },
              { label: "Sign In", href: "/login" },
            ]}
          />
        </div>

        <div className="flex flex-col gap-2 pt-6 text-sm text-white/30 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2025 MediCare+ — All rights reserved</p>
          <p>Made with care for Bangladesh 🇧🇩</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: {
    label: string;
    href: string;
  }[];
}) {
  return (
    <div>
      <h4 className="mb-4 text-xs font-extrabold uppercase tracking-widest text-white/30">
        {title}
      </h4>

      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.href + link.label}>
            <Link
              href={link.href}
              className="text-sm font-medium text-white/55 transition hover:text-blue-300"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}