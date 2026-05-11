"use client";

import { authUtils } from "@/lib/auth";
import { cn } from "@/lib/utils";
import {
  Heart,
  LogOut,
  Menu,
  Search,
  ShoppingCart,
  Upload,
  UserCircle,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { AuthResponse } from "@/types";

const navLinks = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Shop",
    href: "/shop",
  },
  {
    label: "My Orders",
    href: "/my-orders",
  },
];

export default function ClientNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [user, setUser] = useState<AuthResponse | null>(null);

  useEffect(() => {
    setUser(authUtils.getUser());
  }, []);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const query = search.trim();

    if (!query) {
      router.push("/shop");
      return;
    }

    router.push(`/shop?search=${encodeURIComponent(query)}`);
  };

  const handleLogout = () => {
    authUtils.logout();
  };

  return (
    <>
      <div className="bg-blue-600 px-4 py-2 text-center text-xs font-semibold text-white sm:text-sm">
        🚚 Free delivery on orders over ৳500
        <span className="mx-2 opacity-60">|</span>
        100% genuine medicines
        <span className="mx-2 hidden opacity-60 sm:inline">|</span>
        <span className="hidden sm:inline">Licensed pharmacist support</span>
      </div>

      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto grid h-16 max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-4 px-4 sm:px-6 lg:px-8">
          {/* Left: Logo + compact search */}
          <div className="flex min-w-0 items-center gap-4">
            <Link
              href="/"
              className="shrink-0 font-sans text-xl font-black text-gray-900"
            >
              Medi<span className="text-blue-600">Care+</span>
            </Link>

            <form
              onSubmit={handleSearch}
              className="hidden w-[260px] items-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50 transition focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50 xl:flex"
            >
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search..."
                className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400"
              />

              <button
                type="submit"
                className="flex h-full items-center justify-center bg-blue-600 px-3 text-white hover:bg-blue-700"
                aria-label="Search"
              >
                <Search className="h-4 w-4" />
              </button>
            </form>
          </div>

          {/* Center: Navigation */}
          <nav className="hidden items-center justify-center gap-1 lg:flex">
            {navLinks.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-lg px-4 py-2 text-sm font-semibold transition",
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: Actions */}
          <div className="hidden items-center justify-end gap-2 lg:flex">
            <Link
              href="/cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600"
              title="Cart"
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-blue-600 px-1 text-[10px] font-bold text-white">
                0
              </span>
            </Link>

            <Link
              href="/wishlist"
              className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600"
              title="Wishlist"
            >
              <Heart className="h-5 w-5" />
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-blue-600 px-1 text-[10px] font-bold text-white">
                0
              </span>
            </Link>

            <Link
              href="/upload-prescription"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-bold text-gray-700 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600"
            >
              <Upload className="h-4 w-4" />
              Upload Rx
            </Link>

            {user ? (
              <>
                <Link
                  href="/profile"
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50"
                >
                  <UserCircle className="h-4 w-4" />
                  <span className="max-w-[110px] truncate">
                    {user.name || "Account"}
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
              >
                Login / Sign Up
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setIsMobileOpen((prev) => !prev)}
            className="ml-auto flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 lg:hidden"
            aria-label="Open menu"
          >
            {isMobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Mobile + tablet search */}
        <div className="border-t border-gray-100 px-4 py-3 xl:hidden">
          <form
            onSubmit={handleSearch}
            className="mx-auto flex max-w-md items-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50 focus-within:border-blue-500 focus-within:bg-white"
          >
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search medicines..."
              className="min-w-0 flex-1 bg-transparent px-4 py-2.5 text-sm outline-none"
            />

            <button
              type="submit"
              className="bg-blue-600 px-4 py-2.5 text-white"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>
        </div>

        {isMobileOpen && (
          <div className="border-t border-gray-200 bg-white px-4 py-4 lg:hidden">
            <div className="space-y-1">
              {navLinks.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={cn(
                      "block rounded-lg px-3 py-2 text-sm font-semibold",
                      isActive
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}

              <Link
                href="/upload-prescription"
                onClick={() => setIsMobileOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Upload Prescription
              </Link>

              <Link
                href="/cart"
                onClick={() => setIsMobileOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cart
              </Link>

              <Link
                href="/wishlist"
                onClick={() => setIsMobileOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Wishlist
              </Link>

              {user ? (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setIsMobileOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Profile
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="block w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsMobileOpen(false)}
                  className="mt-3 block rounded-lg bg-blue-600 px-4 py-2.5 text-center text-sm font-bold text-white"
                >
                  Login / Sign Up
                </Link>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}