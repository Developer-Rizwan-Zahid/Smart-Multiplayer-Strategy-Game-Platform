import { create } from "zustand";
import { getStoredUser } from "./api";

type Role = "Player" | "Admin";

type AuthState = {
  token: string | null;
  username: string | null;
  role: Role | null;
  setAuth: (token: string, username: string, role: Role) => void;
  clearAuth: () => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token:
    typeof window !== "undefined"
      ? window.localStorage.getItem("auth_token")
      : null,
  username: typeof window !== "undefined" ? getStoredUser()?.username ?? null : null,
  role: typeof window !== "undefined" ? (getStoredUser()?.role as Role) ?? null : null,
  setAuth: (token, username, role) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("auth_token", token);
      window.localStorage.setItem(
        "auth_user",
        JSON.stringify({ username, role }),
      );
    }
    set({ token, username, role });
  },
  clearAuth: () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("auth_token");
      window.localStorage.removeItem("auth_user");
    }
    set({ token: null, username: null, role: null });
  },
  logout: () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("auth_token");
      window.localStorage.removeItem("auth_user");
    }
    set({ token: null, username: null, role: null });
  },
}));

