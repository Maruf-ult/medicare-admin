import { clsx, type ClassValue } from "clsx";
import { format } from "date-fns";
import { twMerge } from "tailwind-merge";

// ── Tailwind class merger ──────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── Currency formatter ────────────────────────────────────
export function formatCurrency(amount: number | null | undefined): string {
  const value = amount ?? 0;
  return `৳${value.toLocaleString("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// ── Date formatter ────────────────────────────────────────
export function formatDate(date: string): string {
  return format(new Date(date), "dd MMM yyyy");
}
// ── Date formatter ────────────────────────────────────────
export function formatDateTime(date: string): string {
  return format(new Date(date), "dd MMM yyyy,hh:mm a");
}
// ── Time ago ──────────────────────────────────────────────
export function timeAgo(date: string): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return `just now`;
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}
// ── Truncate text ─────────────────────────────────────────
export function truncate(text: string, length: number): string {
  return text.length > length ? `${text.substring(0, length)}...` : text;
}
// ── Get initials from name ────────────────────────────────
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((g) => g[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
}
// ── Product field helpers (API may use stockQuantity / SKU) ─
export function getProductStock(p: {
  stock?: number;
  stockQuantity?: number;
}): number {
  const n = p.stockQuantity ?? p.stock ?? 0;
  return Number.isFinite(n) ? n : 0;
}

export function getProductSku(p: {
  sku?: string | null;
  SKU?: string | null;
}): string {
  const v = p.sku ?? p.SKU;
  const s = v == null ? "" : String(v).trim();
  return s || "N/A";
}

// ── Get image url ─────────────────────────────────────────
export function getImageUrl(path: string | null | undefined): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const rootUrl = baseUrl.replace(/\/api$/, "");
  
  return path.startsWith("/") ? `${rootUrl}${path}` : `${rootUrl}/${path}`;
}
