import { AuthResponse } from "@/types";

const TOKEN_KEY = "medicare_admin_token";
const USER_KEY = "medicare_admin_user";

function safeJsonParse<T>(value: string | null): T | null {
  if (!value) return null;

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function getExpiryDate(user: AuthResponse): string | undefined {
  return user.expiresAt || user.expireAt;
}

export const authUtils = {
  setAuth: (data: AuthResponse) => {
    if (typeof window === "undefined") return;

    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data));

    // Save token to cookie for middleware
    document.cookie = `${TOKEN_KEY}=${data.token}; path=/; max-age=${
      7 * 24 * 60 * 60
    }; SameSite=Lax`;
  },

  getToken: (): string | null => {
    if (typeof window === "undefined") return null;

    return localStorage.getItem(TOKEN_KEY);
  },

  getUser: (): AuthResponse | null => {
    if (typeof window === "undefined") return null;

    return safeJsonParse<AuthResponse>(localStorage.getItem(USER_KEY));
  },

  isAuthenticated: (): boolean => {
    if (typeof window === "undefined") return false;

    const token = localStorage.getItem(TOKEN_KEY);
    const user = safeJsonParse<AuthResponse>(localStorage.getItem(USER_KEY));

    if (!token || !user) return false;

    const expiry = getExpiryDate(user);

    // If backend does not send expiry, keep user logged in while token exists.
    if (!expiry) return true;

    const expiresAt = new Date(expiry);

    if (Number.isNaN(expiresAt.getTime())) {
      return true;
    }

    return expiresAt > new Date();
  },

  isAdmin: (): boolean => {
    const user = authUtils.getUser();
    return user?.role === "Admin";
  },

  isCustomer: (): boolean => {
    const user = authUtils.getUser();
    return user?.role === "Customer";
  },

  logout: () => {
    if (typeof window === "undefined") return;

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    // Clear cookie
    document.cookie = `${TOKEN_KEY}=; path=/; max-age=0`;

    window.location.href = "/login";
  },
};

export { TOKEN_KEY, USER_KEY };