import { AxiosError } from "axios";
import { apiClient } from "../lib/api";

// Auth API endpoints
export const authAPI = {
  signin: (data: { email: string; password: string }) =>
    apiClient.post("/auth/signin", data),

  signup: (data: {
    fullname: string;
    username: string;
    email: string;
    password: string;
    gender: string;
  }) => apiClient.post("/auth/signup", data),

  logout: async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch (error) {
      // Even if logout fails on server (e.g., already logged out),
      // we should clear client state. Only log non-401 errors.
      if (error instanceof AxiosError) {
        if (error.response?.status !== 401) {
          console.warn("Logout request failed:", error.message);
        }
      } else {
        console.warn("Logout request failed:", error);
      }
    }
  },

  getProfile: () => apiClient.get("/auth/me"),
};
