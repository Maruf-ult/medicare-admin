import { clsx, type ClassValue } from "clsx";
import { format } from "date-fns";
import { twMerge } from "tailwind-merge";

// ── Tailwind class merger ──────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── Currency formatter ────────────────────────────────────
export function formatCurrency(amount: number): string {
  return `৳${amount.toLocaleString("en-BD", {
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
