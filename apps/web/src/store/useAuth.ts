import { create } from "zustand";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isModalOpen: boolean;
  modalTab: "signin" | "signup";

  openAuthModal: (tab?: "signin" | "signup") => void;
  closeAuthModal: () => void;
  setModalTab: (tab: "signin" | "signup") => void;

  checkSession: () => Promise<void>;
  login: (credentials: { email: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  signup: (data: { name: string; email: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

let isChecking = false;

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isModalOpen: false,
  modalTab: "signin",

  openAuthModal: (tab = "signin") => set({ isModalOpen: true, modalTab: tab }),
  closeAuthModal: () => set({ isModalOpen: false }),
  setModalTab: (modalTab) => set({ modalTab }),

  checkSession: async () => {
    if (isChecking) return;
    isChecking = true;
    try {
      const res = await fetch("/api/auth/me");
      if (!res.ok) {
        set({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }
      const data = await res.json();
      if (data?.user) {
        set({ user: data.user, isAuthenticated: true, isLoading: false });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    } finally {
      isChecking = false;
    }
  },

  login: async ({ email, password }) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.message || "Failed to sign in" };
      }

      set({
        user: data.user,
        isAuthenticated: true,
        isModalOpen: false,
      });
      return { success: true };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  },

  signup: async ({ name, email, password }) => {
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.message || "Failed to create account" };
      }

      set({
        user: data.user,
        isAuthenticated: true,
        isModalOpen: false,
      });
      return { success: true };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  },

  logout: async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      set({ user: null, isAuthenticated: false });
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  },
}));
