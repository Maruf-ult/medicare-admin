"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Brand CRUD was removed; brands are plain text on each product. */
export default function BrandEditRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard/catalog");
  }, [router]);
  return null;
}
