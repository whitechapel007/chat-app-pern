import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  fullName: string;
  username: string;
  email: string;
  gender: string;
  profilePic?: string;
  isOnline: boolean;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}

interface AuthActions {
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setInitialized: (initialized: boolean) => void;
  login: (user: User) => void;
  logout: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // State
      ...initialState,

      // Actions
      setUser: (user) => set({ user }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      setInitialized: (isInitialized) => set({ isInitialized }),

      login: (user) =>
        set({
          user,
          isAuthenticated: true,
          error: null,
        }),

      logout: async () => {
        try {
          // Import authAPI dynamically to avoid circular dependency
          const { authAPI } = await import("../services/auth");
          await authAPI.logout();
        } catch (error) {
          console.warn("Logout API call failed:", error);
        } finally {
          // Always clear local state regardless of API call result
          set({
            user: null,
            isAuthenticated: false,
            error: null,
          });
        }
      },

      clearError: () => set({ error: null }),

      reset: () => set(initialState),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
