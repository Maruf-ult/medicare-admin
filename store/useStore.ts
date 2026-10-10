import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "@/lib/api";
import { ApiResponse } from "@/types";

interface CartState {
  count: number;
  wishlistCount: number;
  fetchCounts: () => Promise<void>;
  setCount: (count: number) => void;
  setWishlistCount: (count: number) => void;
}

export const useStore = create<CartState>()(
  persist(
    (set) => ({
      count: 0,
      wishlistCount: 0,
      setCount: (count) => set({ count }),
      setWishlistCount: (wishlistCount) => set({ wishlistCount }),
      fetchCounts: async () => {
        try {
          const [cartRes, wishlistRes] = await Promise.allSettled([
            api.get<ApiResponse<any>>("/cart"),
            api.get<ApiResponse<any>>("/wishlist"),
          ]);

          if (cartRes.status === "fulfilled" && cartRes.value.data.success) {
            const data = cartRes.value.data.data;
            const count = Array.isArray(data) 
              ? data.length 
              : data?.items?.length ?? 0;
            set({ count });
          }

          if (wishlistRes.status === "fulfilled" && wishlistRes.value.data.success) {
            const data = wishlistRes.value.data.data;
            const wishlistCount = Array.isArray(data) 
              ? data.length 
              : data?.items?.length ?? 0;
            set({ wishlistCount });
          }
        } catch (error) {
          console.error("Failed to fetch counts:", error);
        }
      },
    }),
    {
      name: "medicare-storage",
    }
  )
);
