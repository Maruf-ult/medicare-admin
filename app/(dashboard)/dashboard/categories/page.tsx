"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CategoriesRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/catalog");
  }, [router]);

  return null;
}
