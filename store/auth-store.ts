import { authApi } from "@/api/auth-api";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  image?: string;
  role: "admin" | "user";
}

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  setUser: (user: UserProfile | null) => void;
  setToken: (token: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      setUser: (user) => set({ user }),
      setToken: (token) => {
        set({ token });
        if (token) {
          localStorage.setItem("token", token);
        } else {
          localStorage.removeItem("token");
        }
      },

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await authApi.login({ email, password });
          set({ user: response.user, token: response.token, isLoading: false });
          localStorage.setItem("token", response.token);
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      signup: async (name, email, password) => {
        set({ isLoading: true });
        try {
          const response = await authApi.signup({ name, email, password });
          set({ user: response.user, token: response.token, isLoading: false });
          localStorage.setItem("token", response.token);
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({ user: null, token: null });
        localStorage.removeItem("token");
      },

      initializeAuth: async () => {
        const token = localStorage.getItem("token");
        if (token && !get().user) {
          set({ token, isLoading: true });
          try {
            const profile = await authApi.getProfile();
            set({ user: profile, isLoading: false });
          } catch (error) {
            // Token is invalid, remove it
            set({ token: null, isLoading: false });
            localStorage.removeItem("token");
          }
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user }),
    }
  )
);
