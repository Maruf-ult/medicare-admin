"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Category CRUD was removed; categories are plain text on each product. */
export default function CategoryEditRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard/catalog");
  }, [router]);
  return null;
}
