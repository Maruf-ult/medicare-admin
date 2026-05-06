import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-4 lg:px-8">
        <div>
          <h3 className="text-xl font-bold text-blue-600">MediCare</h3>
          <p className="mt-3 text-sm text-gray-600">
            Trusted online pharmacy for medicines, health products, and prescription support.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900">Shop</h4>
          <div className="mt-3 space-y-2 text-sm">
            <Link href="/shop" className="block text-gray-600 hover:text-blue-600">
              All Products
            </Link>
            <Link href="/hot-deals" className="block text-gray-600 hover:text-blue-600">
              Hot Deals
            </Link>
            <Link href="/upload-prescription" className="block text-gray-600 hover:text-blue-600">
              Upload Prescription
            </Link>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900">Account</h4>
          <div className="mt-3 space-y-2 text-sm">
            <Link href="/sign-in" className="block text-gray-600 hover:text-blue-600">
              Sign In
            </Link>
            <Link href="/sign-up" className="block text-gray-600 hover:text-blue-600">
              Sign Up
            </Link>
            <Link href="/dashboard" className="block text-gray-600 hover:text-blue-600">
              My Dashboard
            </Link>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900">Support</h4>
          <div className="mt-3 space-y-2 text-sm">
            <Link href="/about" className="block text-gray-600 hover:text-blue-600">
              About Us
            </Link>
            <Link href="/contact" className="block text-gray-600 hover:text-blue-600">
              Contact
            </Link>
            <p className="text-gray-600">Email: support@medicare.com</p>
            <p className="text-gray-600">Phone: +880 1700-000000</p>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 py-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} MediCare. All rights reserved.
      </div>
    </footer>
  );
}