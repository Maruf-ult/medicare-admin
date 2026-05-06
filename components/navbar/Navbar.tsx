import { UserRound } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-2xl font-bold text-blue-600">
          MediCare
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <Link
            href="/"
            className="text-sm font-medium text-gray-700 hover:text-blue-600"
          >
            Home
          </Link>
          <Link
            href="/dashboard/products"
            className="text-sm font-medium text-gray-700 hover:text-blue-600"
          >
            Products
          </Link>
          <Link
            href="/dashboard/prescriptions"
            className="text-sm font-medium text-gray-700 hover:text-blue-600"
          >
            Prescriptions
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:flex"
          >
            <UserRound className="h-4 w-4" />
            Login
          </Link>

          <Link
            href="/signup"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Sign Up
          </Link>
        </div>
      </nav>
    </header>
  );
}
