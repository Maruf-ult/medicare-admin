"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function BrandsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/catalog");
  }, [router]);

  return null;
}
