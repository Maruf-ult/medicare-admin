"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Brand CRUD was removed; brands are plain text on each product. */
export default function BrandCreateRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard/products/create");
  }, [router]);
  return null;
}
